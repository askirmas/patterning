export type SchemaParameters = Partial<{
  /** //TODO: Consider .+
   * @default ".*"
   * */
  valuePattern: string
  /** @default false */
  freeStart: boolean
  /** @default false */
  freeEnd: boolean
}>

export type KeyParameters = {
  prefix: string
  postfix: string
  /** @default "[a-zA-Z_$][a-zA-Z0-9_$]*" */
  keyPattern?: string
}
