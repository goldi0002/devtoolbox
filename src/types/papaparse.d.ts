declare module 'papaparse' {
  interface ParseResult<T> {
    data: T[]
    errors: { type: string; message: string; code: string }[]
    meta: {
      delimiter: string
      linebreak: string
      aborted: boolean
      fields: string[]
      truncated: boolean
    }
  }

  interface ParseConfig {
    delimiter?: string
    header?: boolean
    skipEmptyLines?: boolean
    dynamicTyping?: boolean
    transformHeader?: (header: string) => string
    [key: string]: any
  }

  function parse<T = any>(input: string | File, config?: ParseConfig): ParseResult<T>

  export default { parse }
}
