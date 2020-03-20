import {pattern2regStr, keyReger} from "."
import $default from './default.json'

const params = {prefix: "${", postfix: "}"}
, keyReg = keyReger(params)
, pattern = '${x}/b/${y}'
, freeRegString = '(?<x>.*)/b/(?<y>.*)'
, regString = `^${freeRegString}$`
it('pre and post', () => expect(pattern2regStr(
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

