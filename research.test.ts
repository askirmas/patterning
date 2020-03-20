import { exec, matchAll, match } from "./runner"

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
    it(reg, () => expect(match(instance, reg)).toStrictEqual(obj))
  }

  it('matchAll', () => expect(matchAll(instance, "(?<x>[^/]*)/(?<y>[^/]*)")).toStrictEqual([
    {"x": "a", "y": "b"},
    {"x": "", "y": "c"}
  ]))
  it('matchAll without /g', () => expect(matchAll(instance, "(?<x>[^/]*)/(?<y>[^/]*)", '')).toStrictEqual([
    {"x": "a", "y": "b"}
  ]))

  describe('tag as backreference', () => {
    it('true', () => expect(exec("<title>abc</title>", '<(?<tag>[a-z]+)>[^<]+</\\k<tag>>')).toStrictEqual({
      "tag": "title"
    }))
    it('false', () => expect(exec("<title>abc</titl>", '<(?<tag>[a-z]+)>[^<]+</\\k<tag>>')).toBe(null))

  })
})
