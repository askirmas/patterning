import $default from './default.json'
import {RegStrParams, KeyParameters} from "./definitions"

const escapePattern = /[\\{}$[\]()?+*|\.\-\^]/g

export default pattern2regStr
export {
  pattern2regStr, keyReger,
  RegStrParams
}

/** `keyReg: RegExp` will be injected in @param `params` */
function pattern2regStr(pattern: string, params: RegStrParams) {
  const {
    value = $default.value,
    freeStart, freeEnd,
    ...keyParams
  } = params

  if (!('keyReg' in keyParams))
    //@ts-ignore
    params['keyReg']
    = keyReger(keyParams)

  return `${
    freeStart ? '' : '^'
  }${
    pattern.replace(
      //@ts-ignore
      params.keyReg,
      `(?<$1>${value})`
    )
  }${
    freeEnd ? '' :'$'
  }`
}

function keyReger({prefix, postfix, key = $default.key}: KeyParameters) {
  return new RegExp(`${
    prefix.replace(escapePattern, "\\$&")
  }(${
    key
  })${
    postfix.replace(escapePattern, "\\$&")
  }`, 'g')
}
