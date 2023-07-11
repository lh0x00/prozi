import create from 'to-fast-properties'

function fastObjectProperties<T extends object>(data?: T): T {
  return create<T>(data)
}

export default fastObjectProperties
