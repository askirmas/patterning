import $default from './default.json'
import {SchemaParameters, KeyParameters} from "./definitions"

const escapePattern = /[\\{}$[\]()?+*|\.\-\^]/g
, {valuePattern: defaultValuePattern, keyPattern: defaultKeyPattern} = $default

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

function schema2replace(keyReg: RegExp, schema: string) {
  return schema.replace(
    keyReg,
    `$<$1>`
  )
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
