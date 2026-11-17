// csso ships without TypeScript declarations. This declares only the part the minifier uses.
declare module 'csso' {
  export interface CssoOptions {
    comments?: boolean | 'exclamation' | 'first-exclamation'
  }
  export function minify(source: string, options?: CssoOptions): { css: string }
}
