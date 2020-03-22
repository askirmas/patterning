import $default from './default.json'
import {SchemaParameters as SchemaParameters_, KeyParameters as KeyParameters_} from "./definitions"
export type SchemaParameters = SchemaParameters_
export type KeyParameters = KeyParameters_

//TODO: Unnecessary escape character: \^.eslint(no-useless-escape)
const escapePattern = /[\\{}$[\]()?+*|.\-\^]/g
, {valuePattern: defaultValuePattern, keyPattern: defaultKeyPattern} = $default

export {
  schema2regStr, schema2replace, 
  keyReger
}

function schema2regStr(
  keyReg: RegExp,
  schema: string,
  opts: SchemaParameters = {}
) {
  const {
    valuePattern = defaultValuePattern,
    freeStart, freeEnd,
  } = opts || {}
  
  return `${
    freeStart ? '' : '^'
  }${
    schema.replace(
      keyReg,
      //TODO: Object/Function with valuePattern per key
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
