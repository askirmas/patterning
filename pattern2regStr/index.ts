import $default from './default.json'
import {RegStrParams, KeyParameters} from "./definitions"

export {
  pattern2regStr,
  keyReger,
  RegStrParams
}

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

function keyReger({prefix, postfix, key = $default.key}: KeyParameters) {
  return new RegExp(`${escape(prefix)}(${key})${escape(postfix)}`, 'g')
}

function escape(str: string) {
  return str.replace(/[\\{}$[\]()?+*|\.\-\^]/g, "\\$&")
}
