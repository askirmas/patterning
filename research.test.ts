const instance = "a/b/c"
describe(instance, () => {
  const cases: [string, object][] = [
    [
      "(?<x>.*)/(?<y>.*)", {
      "x": "a/b", "y": "c"
    }],
    [
      "(?<x>[^/]*)/(?<y>[^/]*)", {
      "x": "a", "y": "b"
    }],
    [
      "(?<x>[^/]*)/b/(?<y>[^/]*)", {
      "x": "a", "y": "c"
    }],
    [
      "(?<x>[^/]*)/(?<y>[^/]*)$", {
      "x": "b", "y": "c"
    }]
  ]
  for (const [reg, obj] of cases) {
    it(reg, () => expect(strReg(instance, reg)).toStrictEqual(obj))
  }

  it('matchAll', () => expect(strRegAll(instance, "(?<x>[^/]*)/(?<y>[^/]*)")).toStrictEqual([
    {"x": "a", "y": "b"},
    {"x": "", "y": "c"}
  ]))
  describe('tag as backreference', () => {
    it('true', () => expect(regStr('<(?<tag>[a-z]+)>[^<]+</\\k<tag>>', "<title>abc</title>")).toStrictEqual({
      "tag": "title"
    }))
    it('false', () => expect(regStr('<(?<tag>[a-z]+)>[^<]+</\\k<tag>>', "<title>abc</titl>")).toBe(null))

  })
})

function strReg(str: string, schema: string|RegExp) {
  const $return = str.match(
    regexpize(schema)
  )
  return $return && {...$return.groups}
}

function strRegAll(str: string, schema: string|RegExp) {
  const $return = str.matchAll(
    regexpize(schema, 'g')
  )
  return $return && [...$return].map(({groups}) => ({...groups}))
}

function regStr(schema: string|RegExp, str: string) {
  const  $return = regexpize(schema)
  .exec(str)
  return $return && {...$return.groups}
}

function regexpize(regexp: string|RegExp, flags?: string) {
  return regexp instanceof RegExp
  ? regexp
  : new RegExp(regexp, flags)
}