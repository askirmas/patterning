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

  describe("keys coincide", () => {
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
            it('undefined', () => expect(
              parser.schema(route)
              .replace(
                url,
                parser.schema(nextRoute)
              )  
            ).toBe(undefined))
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
  describe("keys different", () => {
    const anys = ["/:any", ":any"]
    it('0', () => expect(
      parser.schema(routes[0]).replace(urls[0], parser.schema(anys[0]))
    ).toStrictEqual(undefined))
    it('1', () => expect(
      parser.schema(routes[0]).replace(urls[0], parser.schema(anys[1]))
    ).toStrictEqual(undefined))

  })
})
describe('plural', () => {
  const parser = new Parser({
    "prefix": ":",
    "postfix": "",
    "valuePattern": "\\w+"
  }) 
  , routes = [
    "api/:script",
    "api/:script/:id",
    ":page",
    ":page/:item"
  ]
  beforeAll(done => {
    parser.clear()
    routes.forEach(route => parser.schema(route))
    done()
  })

  describe('.match', () => {
    const cases = [
      [""],
      ["api", {
        "page": "api"
      }],
      ["api/user", {
        "script": "user",
      }],
      ["api/user/10", {
        "script": "user",
        "id": "10"
      }],
      ["user", {
        "page": "user",
      }],
      ["user/bibi", {
        "page": "user",
        "item": "bibi"
      }],
      ["user/bibi/junior"],
    ] as const

    for (const [url, expectation] of cases)
      it(url, () => expect(parser.match(url)).toStrictEqual(expectation))
  
    describe("//TODO: Key-specific pattern", () => {
      const url = "api/user/bibi"
      it.skip(":id will be \\d+", () => expect(parser.match(url)).toBe(undefined))
      it(url, () => expect(parser.match(url)).toStrictEqual({
        "script": "user",
        "id": "bibi"
      }))
    })
  })

  describe('.replace', () => {
    const recepient = new Parser({
      "prefix": "[",
      "postfix": "]",
      "valuePattern": "\\w+"
    })

    beforeAll(done => {
      recepient.schema("email:[item]@[page].com")
      done()
    })
    describe('undefined', () => {
      const cases = ["", "api/user/10", "user", "user/bibi/junior"]
      for (const route of cases)
        it(route, () => expect(parser.replace(route, recepient)).toBe(undefined))
    })
    const cases = {"api/user": "email:user@api.com", "user/bibi": "email:bibi@user.com"}
    for (const input in cases) { 
      const output = cases[input as keyof typeof cases]
      it(`${input} -> ${output}`, () => expect(parser.replace(input, recepient)).toBe(output))
    }
  })
})