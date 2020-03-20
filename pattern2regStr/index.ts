import $default from './default.json'

export {
  pattern2regStr,
  keyReger
}


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

function pattern2regStr(pattern: string, {value = $default.value, freeStart, freeEnd, ...keyParams}: RegStrParams) {
  const keyReg = 'keyReg' in keyParams
  ? keyParams.keyReg
  : keyReger(keyParams)

  return `${
    freeStart ? '' : '^'
  }${
    pattern.replace(
      keyReg,
      `(?<$1>${value})`
    )
  }${
    freeEnd ? '' :'$'
  }`
}

type KeyParameters = {
  prefix: string
  postfix: string
  /** @default "[a-zA-Z_][a-zA-Z0-9_]*" */
  key?: string
}

function keyReger({prefix, postfix, key = $default.key}: KeyParameters) {
  return new RegExp(`${escape(prefix)}(${key})${escape(postfix)}`, 'g')
}

function escape(str: string) {
  return str.replace(/[\\{}$[\]()?+*|\.\-\^]/g, "\\$&")
}
