import * as runner from "./runner"
import { pattern2regStr, RegStrParams } from "./pattern2regStr"

const instance = "a/b/c"
, valuePattern = "[^/]*"
, expressRoute: RegStrParams = {
  prefix: ":",
  postfix: ""
}
, templateLiteral: RegStrParams = {
  prefix: "${",
  postfix: "}"
}
, withValue: Partial<RegStrParams> = {value: valuePattern}
, withValueFreeStart: Partial<RegStrParams> = {...withValue, freeStart: true}
, withValueFree: Partial<RegStrParams> = {...withValueFreeStart, freeEnd: true}

function launcher(
  method: keyof typeof runner,
  str: string, reg: Parameters<typeof pattern2regStr>[0],
  params: Parameters<typeof pattern2regStr>[1],
  flags?: Parameters<typeof runner[typeof method]>[2]
) {
  return runner[method](str, pattern2regStr(reg, params), flags)
}

describe(instance, () => {
  describe('templateLiteral', () => {
    const schema = "${$x}/${y}"
    it(schema, () => expect(
      launcher('match',instance, schema, templateLiteral)
    ).toStrictEqual(
      {"$x": "a/b", "y": "c"}
    ))
  })

  describe('expressRoute', () => {
    const cases: [
      string,
      Partial<RegStrParams>|undefined,
      {
        /** `match` and `exec` produce the same. `Exec` have side effect and maybe slightly faster https://www.measurethat.net/Benchmarks/Show/3168/0/match-vs-exec  */
        $default: Record<string,string>|null
        /** `true` means `[$default]` to easier see where's the difference */ 
        matchAll: any[]|true
      }
    ][] = [
      [
        ":x/:y",
        undefined,
        {
          "$default": {"x": "a/b", "y": "c"},
          "matchAll": true,
        }
      ],
      [
        ":x/:y",
        withValue,
        {
          "matchAll": [],
          "$default": null
        }
      ],
      [
        ":x/:y",
        withValueFree,
        {
          "matchAll": [{"x": "a", "y": "b"}, {"x": "", "y": "c"}],
          "$default": {"x": "a", "y": "b"}
        }
      ],
      [
        ":x/b/:y",
        withValueFree,
        {
          "$default": {"x": "a", "y": "c"},
          "matchAll": true
        }
      ],
      [
        ":x/:y",
        withValueFreeStart,
        {
          "$default": {"x": "b", "y": "c"},
          "matchAll": true
        }
      ]
    ]
  
    for (const [schema, params, expectation] of cases)
      describe(`${schema} @ ${JSON.stringify(params)}`, () => {
        for (let method in runner)
          it(method, () => expect(
            launcher(
              method as keyof typeof runner,
              instance,
              schema,
              {...expressRoute, ...params}
            )
          ).toStrictEqual(
            method === "matchAll" && method in expectation
            ? (
              expectation[method] === true
              ? [expectation.$default]
              : expectation[method]
            )
            : expectation.$default))
      })
  })

  it('matchAll', () => expect(
    launcher("matchAll", instance, ":x/:y", {...withValueFree, ...expressRoute})
  ).toStrictEqual([
    {"x": "a", "y": "b"},
    {"x": "", "y": "c"}
  ]))
  it('matchAll without /g', () => expect(
    launcher("matchAll", instance, ":x/:y", {...withValueFree, ...expressRoute}, '')
  ).toStrictEqual([
    {"x": "a", "y": "b"}
  ]))

})

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
  it('true', () => expect(runner.exec("<title>abc</title>", catcher)).toStrictEqual({
    "tag": "title"
  }))
  it('false', () => expect(runner.exec("<title>abc</titl>", catcher)).toBe(null))

})
