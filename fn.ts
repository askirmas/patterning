import { keyReger, schema2regStr, KeyParameters as KeyParameters_, SchemaParameters as SchemaParameters_ } from "./schemaReg"
import regexpize from "./regexpize"

//TODO: add .text/.search/... 
const methods = ["exec", "match", "matchAll"] as const
export type KeyParameters = KeyParameters_
export type SchemaParameters = SchemaParameters_
export {
  keyReger, schemaParser, parse, regexpize,
  methods
}

//TODO: apply to parser other schemaParams
function schemaParser(
  key: KeyParameters | RegExp, //Parameters<typeof keyReger>[0] | Parameters<typeof schema2regStr>[0],

  schemaStr: string, //Parameters<typeof schema2regStr>[1],
  schemaParams?: SchemaParameters, // Parameters<typeof schema2regStr>[2],

  flags?: Parameters<typeof regexpize>[1],
) {
  const keyReg = key instanceof RegExp ? key : keyReger(key)
  , parserStr = schema2regStr(keyReg, schemaStr, schemaParams)
  , parser = regexpize(parserStr, flags)
  return parser
}

function parse(
  parser: RegExp,
  instance: string,
  flags?: Parameters<typeof regexpize>[1],
  /** `match` and `exec` produce the same. `Exec` have side effect and maybe slightly faster https://www.measurethat.net/Benchmarks/Show/3168/0/match-vs-exec  */
  method: typeof methods[number] = "match",
) {
  const p = regexpize(parser, flags)

  switch (method) {
    case "match":
      const matchReturn = instance.match(p)
      return matchReturn && (matchReturn.groups ? {...matchReturn.groups} : true)
    case "exec":
      const execReturn = p.exec(instance)
      return execReturn && {...execReturn.groups}  
    case "matchAll": 
      const matchAllReturn = instance.matchAll(p)
      return matchAllReturn && [...matchAllReturn]
      .map(({groups}) => groups && {...groups})
   default:
     return 
  }
}
