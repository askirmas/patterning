import {valuePattern as defaultValuePattern, keyPattern as defaultKeyPattern} from './default.json'
import {SchemaParameters, KeyParameters} from "./definitions"

const escapePattern = /[\\{}$[\]()?+*|\.\-\^]/g

export {
  schema2regStr, schema2replace, 
  keyReger,
  SchemaParameters, KeyParameters
}

function schema2regStr(
  keyReg: RegExp,
  schema: string,
  {
    valuePattern = defaultValuePattern,
    freeStart, freeEnd,
  }: SchemaParameters = {}
) {
  return `${
    freeStart ? '' : '^'
  }${
    schema.replace(
      keyReg,
      `(?<$1>${valuePattern})`
    )
  }${
    freeEnd ? '' :'$'
  }`
}

function schema2replace(keyReg: RegExp,
  schema: string,
  {
    freeStart, freeEnd,
  }: Exclude<SchemaParameters, 'valuePattern'> = {}
) {
  return `${
    freeStart ? '' : '^'
  }${
    schema.replace(
      keyReg,
      `$<$1>`
    )
  }${
    freeEnd ? '' :'$'
  }`
}

function keyReger({prefix, postfix, keyPattern = defaultKeyPattern}: KeyParameters) {
  return new RegExp(`${
    prefix.replace(escapePattern, "\\$&")
  }(${
    keyPattern
  })${
    postfix.replace(escapePattern, "\\$&")
  }`, 'g')
}
