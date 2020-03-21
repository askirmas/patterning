import {Parser} from "./oop"
import {definitions, templateLiteral, expressRoute} from './test.json'
import { SchemaParameters } from "./schemaReg"
import { methods } from "."

const {instance} = definitions

describe('templateLiteral', () => {
  const tr = new Parser(templateLiteral.keyParameters)
  , {schema, expectation} = templateLiteral.suite
  it(schema, () => expect(tr.schema(schema).match(instance)).toStrictEqual(expectation)
  )
})
describe("expressRoute", () => {
  const tr = new Parser(expressRoute.keyParameters)
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
        it(method, () => {
          expect(tr.schema(schema, params)[method](instance)).toStrictEqual(expected)
        })
      }    
    })
})