
import {keyReger, schemaParser, parse, methods, SchemaParameters} from './fn'
import {expressRoute, templateLiteral, definitions} from "./test.json"

const {withValueFree, instance} = definitions
, expressRouteCatcher = keyReger(expressRoute.keyParameters)

describe(instance, () => {
  describe('template literal', () => {
    const {
      keyParameters,
      suite: {
        schema,
        expectation
      }
    } = templateLiteral
    , parser = schemaParser(keyParameters, schema)
        
    it(schema, () => expect(
      parse(parser, instance)
    ).toStrictEqual(expectation))
  })

  describe('expressRoute', () => {
    const cases = expressRoute.suites as [
      string,
      Partial<SchemaParameters>|undefined,
      {
        $default: Record<string,string>|null
        /** `true` means `[$default]` to easier see where's the difference */
        matchAll: any[]|true
      }
    ][]
  
    for (const [schema, params, expectation] of cases)
      describe(`${schema} @ ${JSON.stringify(params)}`, () => {
        for (const method of methods) { 
          const expected = !(method in expectation)
          ? expectation.$default
          : (
            method === "matchAll"
            && expectation[method] === true
            ? [expectation.$default]
            //@ts-ignore
            : expectation[method]
          )
          it(method, () => expect(
              parse(
                schemaParser(expressRouteCatcher, schema, params),
                instance,
                //@ts-ignore
                params,
                method
              )
            ).toStrictEqual(
              expected
            )            
          )
        }
      })
  })
  describe('matchAll', () => {
    const parser = schemaParser(expressRouteCatcher, expressRoute.schemas[0], withValueFree)
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
