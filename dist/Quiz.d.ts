import { type PromiseType } from './types';
interface QuizThroatOptions {
    concurrency: number;
    schedule: boolean;
}
interface QuizDeferPromise<T extends any> {
    cancel: EnhancedPromise<T>['cancel'];
    flush: () => any;
    is: {
        finalled: () => boolean;
        rejected: () => boolean;
        resolved: () => boolean;
    };
    promise: EnhancedPromise<T>;
    reject: (reason?: any) => any;
    resolve: (value: T | PromiseLike<T>) => any;
    state: 'pending' | 'rejected' | 'resolved';
}
interface QuizDeferifyPromise<T extends any, F = any> extends QuizDeferPromise<T> {
    forward: F;
}
type QuizPromiseExecuter<T extends any> = (resolve: (value: T | PromiseLike<T>) => any, reject: (reason?: any) => any) => any;
type QuizQueueItem = () => Promise<any>;
interface QuizPromiseOptions {
    cancelable?: boolean;
    timeout?: number;
}
interface EnhancedPromise<T extends any> extends Promise<T> {
    cancel: () => any;
}
type QuizCallbackError = Error | string | null | any | undefined;
type QuizFunctionCallback<R> = (error: QuizCallbackError, results: R) => any;
type QuizFunctionWithCallback<T extends any[], R> = (...args: [...T, QuizFunctionCallback<R>]) => any;
declare class Quiz {
    static readonly defaults: {
        concurrency: number;
    };
    static wrap<T extends any[], U>(run: (...args: T) => U | PromiseLike<U>): (...args: T) => Promise<U>;
    static immediate<T extends any>(task?: () => T | PromiseLike<T>): Promise<T>;
    static timeout<T extends any>(task?: () => T | PromiseLike<T>, delay?: number): Promise<T>;
    static throat<I extends any, R extends any>(list: I[], task: (item: I, idx?: number) => Promise<R>, options?: Partial<QuizThroatOptions>): Promise<R[]>;
    static map<I extends any, R extends any>(list: I[], task: (item: I, idx?: number) => Promise<R>, options?: Partial<QuizThroatOptions>): Promise<R[]>;
    static from<T extends Record<string, Promise<any>>>(promises: T): Promise<{
        [K in keyof T]: PromiseType<T[K]>;
    }>;
    static all<I extends any>(...rest: Array<Promise<I> | Array<Promise<I>>>): Promise<I[]>;
    static readonly race: <I extends unknown>(...rest: (Promise<I> | Promise<I>[])[]) => Promise<I>;
    static defer<T extends any>(options?: QuizPromiseOptions): QuizDeferPromise<T>;
    static run<T extends any>(task: () => Promise<T>, options?: QuizPromiseOptions): EnhancedPromise<T>;
    static create<T extends unknown>(task: QuizPromiseExecuter<T>, options?: QuizPromiseOptions): EnhancedPromise<T>;
    static promisify: <I extends any[], R>(wrapped: QuizFunctionWithCallback<I, R>) => (...args: I) => Promise<R>;
    static deferify: <I extends any[], R, F = any>(wrapped: QuizFunctionWithCallback<I, R>) => (...args: I) => QuizDeferifyPromise<R, F>;
}
export type { EnhancedPromise, QuizCallbackError, QuizDeferifyPromise, QuizDeferPromise, QuizFunctionCallback, QuizFunctionWithCallback, QuizPromiseExecuter, QuizPromiseOptions, QuizQueueItem, QuizThroatOptions, };
export default Quiz;
