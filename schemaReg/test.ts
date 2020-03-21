import {schema2regStr, keyReger} from "."
import $default from './default.json'

const params = {prefix: "${", postfix: "}"}
, keyReg = keyReger(params)
, pattern = '${x}/b/${y}'
, digits = '[0-9]+'
, freeDigits = `(?<x>${digits})/b/(?<y>${digits})`
, strict = `^(?<x>${$default.valuePattern})/b/(?<y>${$default.valuePattern})$`

describe(keyReger.name, () => {
  it('default works', () => expect(keyReg).toStrictEqual(keyReger({...params, ...$default})))
})
describe(schema2regStr.name, () => {
  it('keyReg', () => expect(schema2regStr(
    keyReg,
    pattern,
    )).toBe(strict))
  it('full', () => expect(schema2regStr(
    keyReg,
    pattern,
    {valuePattern: digits, freeStart: true, freeEnd: true}
  )).toBe(freeDigits))
})
