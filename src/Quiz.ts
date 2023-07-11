/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-floating-promises */

import fastObjectProperties from './utilities/fastObjectProperties'
import throat from './utilities/throat'
import {
  type PromiseType, 
} from './types'

interface QuizThroatOptions {
  concurrency: number
  schedule: boolean
}

interface QuizDeferPromise<T extends any> {
  cancel: EnhancedPromise<T>['cancel']
  flush: () => any
  is: {
    finalled: () => boolean
    rejected: () => boolean
    resolved: () => boolean
  }
  promise: EnhancedPromise<T>
  reject: (reason?: any) => any
  resolve: (value: T | PromiseLike<T>) => any
  state: 'pending' | 'rejected' | 'resolved'
}

interface QuizDeferifyPromise<T extends any, F = any>
  extends QuizDeferPromise<T> {
  forward: F
}

type QuizPromiseExecuter<T extends any> = (
  resolve: (value: T | PromiseLike<T>) => any,
  reject: (reason?: any) => any,
) => any

type QuizQueueItem = () => Promise<any>

interface QuizPromiseOptions {
  cancelable?: boolean
  timeout?: number
}

interface EnhancedPromise<T extends any> extends Promise<T> {
  cancel: () => any
}

//
type QuizCallbackError = Error | string | null | any | undefined
type QuizFunctionCallback<R> = (error: QuizCallbackError, results: R) => any
type QuizFunctionWithCallback<T extends any[], R> = (
  ...args: [...T, QuizFunctionCallback<R>]
) => any

class Quiz {
  static readonly defaults = fastObjectProperties({
    concurrency: 4,
  })

  static wrap<T extends any[], U>(
    run: (...args: T) => U | PromiseLike<U>,
  ): (...args: T) => Promise<U> {
    return async function (this: any, ...rest: T) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context = this

      return Quiz.create(async (resolve, reject) => {
        try {
          resolve(Promise.resolve(run.apply(context, rest)))
        } catch (error) {
          reject(error)
        }
      })
    }
  }

  static async immediate<T extends any>(
    task?: () => T | PromiseLike<T>,
  ): Promise<T> {
    return Quiz.create((resolve, reject) => {
      Promise.resolve().then(() => {
        Promise.resolve((typeof task === 'function' ? task() : null) as any)
          .then(resolve)
          .catch(reject)
      })
    })
  }

  static async timeout<T extends any>(
    task?: () => T | PromiseLike<T>,
    delay = 0,
  ): Promise<T> {
    return Quiz.create((resolve, reject) => {
      setTimeout(() => {
        Promise.resolve((typeof task === 'function' ? task() : null) as any)
          .then(resolve)
          .catch(reject)
      }, delay)
    })
  }

  static async throat<I extends any, R extends any>(
    list: I[],
    task: (item: I, idx?: number) => Promise<R>,
    options?: Partial<QuizThroatOptions>,
  ): Promise<R[]> {
    if (!list || !Array.isArray(list) || !('map' in list)) {
      throw new Error(
        'The parameter list received is invalid,' +
          "it's must be a list or support `map` prototype.",
      )
    }

    const opts = Object.assign(
      {
        concurrency: this.defaults.concurrency,
        schedule: false,
      },
      options,
    )

    if (opts.concurrency <= 0) {
      throw new Error('Quiz throat required concurrency value is greater 0.')
    }

    return Quiz.map(list, task, opts)
  }

  static async map<I extends any, R extends any>(
    list: I[],
    task: (item: I, idx?: number) => Promise<R>,
    options?: Partial<QuizThroatOptions>,
  ): Promise<R[]> {
    if (!list || !Array.isArray(list) || !('map' in list)) {
      throw new Error(
        'The parameter list received is invalid,' +
          "it's must be a list or support `map` prototype.",
      )
    }

    const opts = Object.assign(
      {
        concurrency: -1,
        schedule: false,
      },
      options,
    )

    return Quiz.all(
      list.map(opts.concurrency > 0 ? throat(opts.concurrency, task) : task),
    )
  }

  static async from<T extends Record<string, Promise<any>>>(
    promises: T,
  ): Promise<{
    [K in keyof T]: PromiseType<T[K]>
  }> {
    const keys = Object.keys(promises)
    const values = Object.values(promises)
    const recevied: any[] = await this.all(values)

    const results = recevied.reduce(
      (acc, item, idx) =>
        Object.assign(acc, {
          [keys[idx]]: item,
        }),
      fastObjectProperties(),
    )

    return results
  }

  static async all<I extends any>(
    ...rest: Array<Promise<I> | Array<Promise<I>>>
  ): Promise<I[]> {
    const promises: Array<Promise<any>> = rest.reduce<any>(
      (acc, item) => acc.concat(item),
      [],
    )

    return Promise.all(promises)
  }

  static readonly race = async <I extends any>(
    ...rest: Array<Promise<I> | Array<Promise<I>>>
  ): Promise<I> => {
    const promises: Array<Promise<any>> = rest.reduce<any>(
      (acc, item) => acc.concat(item),
      [],
    )

    return Promise.race(promises)
  }

  static defer<T extends any>(
    options?: QuizPromiseOptions,
  ): QuizDeferPromise<T> {
    const opts = Object.assign(
      {
        timeout: -1,
        cancelable: true,
      },
      options,
    )

    const defered = fastObjectProperties({}) as QuizDeferPromise<T>

    defered.state = 'pending'
    defered.is = fastObjectProperties({
      finalled: () =>
        defered.state === 'resolved' || defered.state === 'rejected',
      resolved: () => defered.state === 'resolved',
      rejected: () => defered.state === 'rejected',
    })

    // @ts-expect-error
    defered.promise = new Promise((resolve, reject) => {
      defered.resolve = resolve
      defered.reject = reject

      if (opts.cancelable) {
        Promise.resolve().then(() => {
          defered.cancel = defered.promise.cancel = function () {
            const error = new Error('The promise have been canceled.')
            error.name = 'PromiseCanceled'

            defered.reject(error)
          }
        })
      }

      if (opts.timeout > 0) {
        let timer = setTimeout(() => {
          timer = -1 as any

          const error = new Error('The promise has been timedout.')
          error.name = 'PromiseTimedout'

          defered.reject(error)
        }, opts.timeout)

        defered.flush = function () {
          clearTimeout(timer)

          timer = -1 as any
        }

        defered.promise.finally(() => {
          defered.flush()
        })
      }
    })

    //
    defered.promise
      .then(() => (defered.state = 'resolved'))
      .catch(() => (defered.state = 'rejected'))

    return defered
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  static run<T extends any>(
    task: () => Promise<T>,
    options?: QuizPromiseOptions,
  ): EnhancedPromise<T> {
    const defered = Quiz.defer<T>(options)

    task().then(defered.resolve).catch(defered.reject)

    return defered.promise
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  static create<T extends unknown>(
    task: QuizPromiseExecuter<T>,
    options?: QuizPromiseOptions,
  ): EnhancedPromise<T> {
    const defered = Quiz.defer<T>(options)

    task(defered.resolve, defered.reject)

    return defered.promise
  }

  static promisify =
    <I extends any[], R>(wrapped: QuizFunctionWithCallback<I, R>) =>
    async (...args: I): Promise<R> =>
      new Promise((resolve, reject) => {
        wrapped(...args, (error: QuizCallbackError, results: R) => {
          error ? reject(error) : resolve(results)
        })
      })

  static deferify =
    <I extends any[], R, F = any>(wrapped: QuizFunctionWithCallback<I, R>) =>
    (...args: I): QuizDeferifyPromise<R, F> => {
      const defer = Quiz.defer<R>()

      // @ts-expect-error
      defer.forward = wrapped(...args, (error: QuizCallbackError, results: R) =>
        error ? defer.reject(error) : defer.resolve(results))

      return defer as any
    }
}

export type {
  EnhancedPromise,
  QuizCallbackError,
  QuizDeferifyPromise,
  QuizDeferPromise,
  QuizFunctionCallback,
  QuizFunctionWithCallback,
  QuizPromiseExecuter,
  QuizPromiseOptions,
  QuizQueueItem,
  QuizThroatOptions,
}

export default Quiz
