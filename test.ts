
import {keyReger, schemaParser, parse, methods, SchemaParameters} from '.'

const instance = "a/b/c"
, valuePattern = "[^/]*"
, expressRouteCatcher = keyReger({
  prefix: ":",
  postfix: ""
})
, expressRouteSchema = ":x/:y"
, withValue: Partial<SchemaParameters> = {valuePattern}
, withValueFreeStart: Partial<SchemaParameters> = {...withValue, freeStart: true}
, withValueFree: Partial<SchemaParameters> = {...withValueFreeStart, freeEnd: true}

describe(instance, () => {
  describe('template literal', () => {
    const schema = "${$x}/${y}"
    , parser = schemaParser(
      {
        prefix: "${",
        postfix: "}"
      },
      schema
    )
    , expectation = {"$x": "a/b", "y": "c"}
        
    it(schema, () => expect(
      parse(parser, instance)
    ).toStrictEqual(expectation))
  })

  describe('expressRoute', () => {
    const cases: [
      string,
      Partial<SchemaParameters>|undefined,
      {
        $default: Record<string,string>|null
        /** `true` means `[$default]` to easier see where's the difference */
        matchAll: any[]|true
      }
    ][] = [
      [
        expressRouteSchema,
        undefined,
        {
          "$default": {"x": "a/b", "y": "c"},
          "matchAll": true,
        }
      ],
      [
        expressRouteSchema,
        withValue,
        {
          "matchAll": [],
          "$default": null
        }
      ],
      [
        expressRouteSchema,
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
        expressRouteSchema,
        withValueFreeStart,
        {
          "$default": {"x": "b", "y": "c"},
          "matchAll": true
        }
      ]
    ]
  
    for (const [schema, params, expectation] of cases)
      describe(`${schema} @ ${JSON.stringify(params)}`, () => {
        for (const method of methods) { 
          const expected = method === "matchAll" && method in expectation
          ? (
            expectation[method] === true
            ? [expectation.$default]
            : expectation[method]
          )
          : expectation.$default

          it(method, () => {
            expect(
              parse(
                schemaParser(expressRouteCatcher, schema, params),
                instance,
                method === "matchAll" && 'g',
                method
              )
            ).toStrictEqual(
              expected
            )            
          })
        }
      })
  })
  describe('matchAll', () => {
    const parser = schemaParser(expressRouteCatcher, expressRouteSchema, withValueFree)
    it('matchAll', () => expect(
      parse(parser, instance, 'g', "matchAll")
    ).toStrictEqual([
      {"x": "a", "y": "b"},
      {"x": "", "y": "c"}
    ]))
    it('matchAll without /g', () => expect(
      parse(parser, instance, undefined, "matchAll")
    ).toStrictEqual([
      {"x": "a", "y": "b"}
    ]))
  })
})
it('bad method', () => expect(parse(
  /a/, instance, '',
  //@ts-ignore
  'asd'
)).toBe(
  undefined
))
