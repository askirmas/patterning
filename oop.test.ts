import {Parser} from "./oop"
import {definitions, templateLiteral, expressRoute} from './test.json'
import { SchemaParameters } from "./schemaReg"
import { methods } from "./fn"

const {instance} = definitions
, expressRouteParser = new Parser(expressRoute.keyParameters)
, templateLiteralParser = new Parser(templateLiteral.keyParameters)
    
describe(`${instance} @ exec, match, matchAll`, () => {
  describe('templateLiteral', () => {
    const {schema, expectation} = templateLiteral.suite
    it(schema, () => expect(templateLiteralParser.schema(schema).match(instance)).toStrictEqual(expectation)
    )
  })
  describe("expressRoute", () => {
    const cases = expressRoute.suites as [
      string,
      Partial<SchemaParameters>|undefined,
      {
        $default: Record<string,string>|null
        /** `true` means `[$default]` to easier see where's the difference */
        matchAll?: any[]|true
        match?: any|true
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
          it(method, () => {
            expect(expressRouteParser.schema(schema, params)[method](instance)).toStrictEqual(expected)
          })
        }    
      })
  })
})

describe('reshape', () => {
  const parser = new Parser({...expressRoute.keyParameters, valuePattern: "[\\w\\-]+"}) 
  , routes = ["/api/:getter\\?id=:id", ":getter/:id"]
  , urls = ["/api/item?id=2", "item/2"]
  
  for (const ri in routes)
    for (const ui in urls) {
      const route = routes[ri]
      , nextRoute = routes[(parseInt(ri) + 1) % routes.length]
      , url = urls[ui]
      , nextUrl = urls[(parseInt(ui) + 1) % urls.length]

      describe (`${url} -> ${route}`, () => {
        it('.test', () => expect(
          parser.schema(route).test(url)
        ).toBe(ri === ui))

        if (ri !== ui)
          it('false', () => expect(
            parser.schema(route)
            .replace(
              url,
              parser.schema(nextRoute)
            )  
          ).toBe(false))
        else {
          it('idfn', () => expect(
            parser.schema(route)
            .replace(
              url,
              parser.schema(route)
            )
          ).toBe(url))
          it('replaced', () => expect(
            parser.schema(route)
            .replace(
              url,
              parser.schema(nextRoute)
            )
          ).toBe(nextUrl))
        }

      })
    }
})