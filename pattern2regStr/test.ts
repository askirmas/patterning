import {pattern2regStr, keyReger} from "."
import $default from './default.json'

const params = {prefix: "${", postfix: "}"}
, keyReg = keyReger(params)
, keyReg4coverage = keyReger({...params, ...$default})
, pattern = '${x}/b/${y}'
, freeRegString = `(?<x>${$default.value})/b/(?<y>${$default.value})`
, regString = `^${freeRegString}$`
it('keyReg4coverage', () => expect(keyReg).toStrictEqual(keyReg4coverage))
it('pre and post', () => expect(pattern2regStr(
  pattern,
  params
)).toBe(regString))

it('keyReg injected', () => expect(
  params
).toMatchObject({keyReg}))
it('with injected', () => expect(pattern2regStr(
  pattern,
  params
)).toBe(regString))
it('keyReg', () => expect(pattern2regStr(
  pattern,
  {keyReg}
)).toBe(regString))
it('full', () => expect(pattern2regStr(
  pattern,
  {...$default, ...params, freeStart: true, freeEnd: true}
)).toBe(freeRegString))

