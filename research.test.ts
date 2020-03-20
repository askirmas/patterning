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

  })
})
