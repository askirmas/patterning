const $default = {
  value: ".*",
  key: "[a-zA-Z_][a-zA-Z0-9_]*"
}

export {
  pattern2regStr,
  keyReger,
  getDefault
}


export type RegStrParams = Partial<{
  /** @default ".*" */
  value: string
  /** @default false */
  start: boolean
  /** @default false */
  end: boolean
}> & (
  {keyReg: RegExp}
  | KeyParameters
)

function pattern2regStr(pattern: string, {value = $default.value, start, end, ...keyParams}: RegStrParams) {
  const keyReg = 'keyReg' in keyParams
  ? keyParams.keyReg
  : keyReger(keyParams)

  return `${
    start ? '^' : ''
  }${
    pattern.replace(
      keyReg,
      `(?<$1>${value})`
    )
  }${
    end ? '$' :''
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

function getDefault() {
  return {...$default}
}