import {schema2regStr, schema2replace, keyReger} from "./index"
import $default from './default.json'

const params = {prefix: "${", postfix: "}"}
, keyReg = keyReger(params)
, pattern = '${x}/b/${y}'
, digits = '[0-9]+'
, freeDigits = `(?<x>${digits})/b/(?<y>${digits})`
, freeOpts = {freeStart: true, freeEnd: true}
, strict = `^(?<x>${$default.valuePattern})/b/(?<y>${$default.valuePattern})$`

describe(keyReger.name, () => {
  it('default works', () => expect(keyReg).toStrictEqual(keyReger({...params, ...$default})))
})
describe(schema2regStr.name, () => {
  it('default === strict', () => expect(schema2regStr(
    keyReg,
    pattern,
    )).toBe(strict))
  it('free', () => expect(schema2regStr(
    keyReg,
    pattern,
    {valuePattern: digits, ...freeOpts}
  )).toBe(freeDigits))
})

it(schema2replace.name, () => expect(schema2replace(
  keyReg,
  pattern
)).toBe("$<x>/b/$<y>"))
