import {pattern2regStr, keyReger, getDefault} from "./pattern2regStr"
const params = {prefix: "${", postfix: "}"}
, keyReg = keyReger(params)
, pattern = '${x}/b/${y}'
, regString = '(?<x>.*)/b/(?<y>.*)'
, $default = getDefault()
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
  {...$default, ...params, start: true, end: true}
)).toBe(`^${regString}$`))

