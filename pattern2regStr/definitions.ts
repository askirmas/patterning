export type RegStrParams = Partial<{
  /** @default ".*" */
  value: string
  /** @default false */
  freeStart: boolean
  /** @default false */
  freeEnd: boolean
}> & (
  {keyReg: RegExp}
  | KeyParameters
)

export type KeyParameters = {
  prefix: string
  postfix: string
  /** @default "[a-zA-Z_][a-zA-Z0-9_]*" */
  key?: string
}
