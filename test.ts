
import {match, exec, matchAll} from '.'
import {KeyParameters} from '.'

const methods = {match, exec, matchAll}
, instance = "a/b/c"
, valuePattern = "[^/]*"
, expressRoute: KeyParameters = {
  prefix: ":",
  postfix: ""
}
, templateLiteral: KeyParameters = {
  prefix: "${",
  postfix: "}"
}
, withValue: Partial<KeyParameters> = {value: valuePattern}
, withValueFreeStart: Partial<KeyParameters> = {...withValue, freeStart: true}
, withValueFree: Partial<KeyParameters> = {...withValueFreeStart, freeEnd: true}

describe(instance, () => {
  describe('templateLiteral', () => {
    const schema = "${$x}/${y}"
    it(schema, () => expect(
      match(instance, schema, templateLiteral)
    ).toStrictEqual(
      {"$x": "a/b", "y": "c"}
    ))
  })

  describe('expressRoute', () => {
    const cases: [
      string,
      Partial<KeyParameters>|undefined,
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
        for (const method in methods) { 
          const expected = method === "matchAll" && method in expectation
          ? (
            expectation[method] === true
            ? [expectation.$default]
            : expectation[method]
          )
          : expectation.$default

          it(method, () => {
            expect(
              methods[method as keyof typeof methods](
                instance,
                schema,
                {...expressRoute, ...params}
              )
            ).toStrictEqual(
              expected
            )            
          })
        }
      })
  })

  it('matchAll', () => expect(
    matchAll(instance, ":x/:y", {...withValueFree, ...expressRoute})
  ).toStrictEqual([
    {"x": "a", "y": "b"},
    {"x": "", "y": "c"}
  ]))
  it('matchAll without /g', () => expect(
    matchAll(instance, ":x/:y", {...withValueFree, ...expressRoute}, '')
  ).toStrictEqual([
    {"x": "a", "y": "b"}
  ]))

})
