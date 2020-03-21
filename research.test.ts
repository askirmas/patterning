import { regexpize } from "./regexpize"


describe('tag as backreference', () => {
  // https://2ality.com/2017/05/regexp-named-capture-groups.html#backreferences
  const key = "tag"
  , keyPattern = '[a-z]+'
  , valuePattern = "[^<]+"
  , openPrefix = "<"
  , openPostfix = ">"
  , closePrefix = "</"
  , closePostfix = ">"
  , catcher = `${
    openPrefix}(?<${key}>${keyPattern})${openPostfix
  }${
    valuePattern
  }${
    closePrefix}\\k<${key}>${closePostfix
  }`
  it('true', () => expect(exec("<title>abc</title>", catcher)).toStrictEqual({
    "tag": "title"
  }))
  it('false', () => expect(exec("<title>abc</titl>", catcher)).toBe(null))
  it('html array', () => expect(
    [
      ..."X<title>abc</title>Y<b>b</b>Z"
      .matchAll(
        /<(?<tag>[a-z]+)>(?<text>[^<]*)<\/\k<tag>>/g
      )
    ].map(({groups}) => ({...groups}))
  ).toStrictEqual([
    {tag: "title", text: "abc"},
    {tag: "b", text: "b"}
  ]))
  it('html tags', () => expect(
    [
      ..."X<title>abc</title>Y<b>b</b>Z"
      .matchAll(/[^<]*<(?<tag>[a-z]+)>.*<\/\1>[^<]*/g)
    ].map(({groups}) => ({...groups}))
  ).toStrictEqual([{tag: "title"}, {tag: "b"}]))
  it('html trick', () => expect(
    () => "X<title>abc</title>Y<b>b</b>Z"
      .matchAll(/[^<]*<([a-z]+)>(?<\1>.*)<\/\1[^<]*/g)
  ).toThrowError(SyntaxError))
  it('html', () => expect(
    [
      ..."X<title>abc</title>Y<b>b</b>Z"
      .matchAll(/^([^<]*<(?<tag>[a-z]+)>(.*)<\/\k<tag>>[^<]*)*$/g)
    ].map(({groups, ...etc}) => ({...etc, groups: {...groups}}))
    [0].groups
  ).toStrictEqual({tag: "b"}))
})


type rp = Parameters<typeof regexpize>
function exec(str: string, schema: rp[0], flags?: rp[1]) {
  const  $return = regexpize(schema, flags)
  .exec(str)
  return $return && {...$return.groups}
}