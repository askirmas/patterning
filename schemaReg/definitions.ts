export type SchemaParameters = Partial<{
  /** @default ".*" */ //TODO: 1) Consider
  valuePattern: string //TODO: |RegExp
  /** @default false */
  freeStart: boolean //TODO: |RegExp
  /** @default false */
  freeEnd: boolean //TODO: |RegExp
}>

//TODO: Pattern for specific key
export type KeyParameters = {
  prefix: string //TODO: |RegExp
  postfix: string //TODO: |RegExp
  /** @default "[\\w$^\\d][\\w$]*" */
  keyPattern?: string //TODO: |RegExp
}
