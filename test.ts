
import {keyReger, schemaParser, parse, methods, SchemaParameters} from '.'
import regexpize from './regexpize'
import { schema2regStr, schema2replace } from './schemaReg'
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


describe('research', () => {

  type rp = Parameters<typeof regexpize>
  function exec(str: string, schema: rp[0], flags?: rp[1]) {
    const  $return = regexpize(schema, flags)
    .exec(str)
    return $return && {...$return.groups}
  }

  describe('tag as backreference', () => {
    // https://2ality.com/2017/05/regexp-named-capture-groups.html#backreferences
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
    it('html array', () => expect(
      [
        ..."X<title>abc</title>Y<b>b</b>Z"
        .matchAll(
          /<(?<tag>[a-z]+)>(?<text>[^<]*)<\/\k<tag>>/g
        )
      ].map(({groups}) => ({...groups}))
    ).toStrictEqual([
      {tag: "title", text: "abc"},
      {tag: "b", text: "b"}
    ]))
    it('html tags', () => expect(
      [
        ..."X<title>abc</title>Y<b>b</b>Z"
        .matchAll(/[^<]*<(?<tag>[a-z]+)>.*<\/\1>[^<]*/g)
      ].map(({groups}) => ({...groups}))
    ).toStrictEqual([{tag: "title"}, {tag: "b"}]))
    it('html trick', () => expect(
      () => "X<title>abc</title>Y<b>b</b>Z"
        .matchAll(/[^<]*<([a-z]+)>(?<\1>.*)<\/\1[^<]*/g)
    ).toThrowError(SyntaxError))
    it('html', () => expect(
      [
        ..."X<title>abc</title>Y<b>b</b>Z"
        .matchAll(/^([^<]*<(?<tag>[a-z]+)>(.*)<\/\k<tag>>[^<]*)*$/g)
      ].map(({groups, ...etc}) => ({...etc, groups: {...groups}}))
      [0].groups
    ).toStrictEqual({tag: "b"}))
  })
  describe('reshape', () => {
    const parser = regexpize(schema2regStr(
      expressRouteCatcher,
      expressRoute.schemas[1]
    ))
    describe('not match', () => {
      it('replace', () => expect(
        instance.replace(parser,
          '$<source>/b/$<id>'
        )
      ).toBe('/b/'))
    })    
    it('idfn', () => expect(
      instance.replace(parser,
        schema2replace(expressRouteCatcher, expressRoute.schemas[1])
      )
    ).toBe(instance))
    it('1', () => expect(
      instance.replace(parser,
        '/$<x>?id=$<y>'
      )
    )
    .toBe('/a?id=c'))
  })
})