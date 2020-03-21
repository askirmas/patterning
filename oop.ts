import {keyReger, schema2regStr, schema2replace} from './schemaReg'
import {regexpize} from "./regexpize"

type Opts2 = Parameters<typeof schema2regStr>[2]
type Opts3 = Parameters<typeof regexpize>[1]
type SchemaParams = Exclude<Opts2 & Opts3, string>
type Params = Parameters<typeof keyReger>[0] & SchemaParams

/*const free = {
  freeStart: true,
  freeEnd: true
}*/
//TODO: Callable class https://hackernoon.com/creating-callable-objects-in-javascript-d21l3te1 https://stackoverflow.com/questions/12769636/how-to-make-a-class-implement-a-call-signature-in-typescript
class Parser {
  _keyReg: RegExp
  _params: Params
  _schemas: Map<string, Schema> = new Map()

  constructor(params: Params) {
    this._keyReg = keyReger(params)
    this._params = params
  }
  
  schema(schema: string, params?: SchemaParams) {
    const schemas = this._schemas
    /*, {valuePattern} = params
    , opts = {valuePattern, ...free}*/

    if (params || !schemas.has(schema))
      schemas.set(schema, new Schema(this._keyReg, schema, params || this._params)) 
    return this._schemas.get(schema)!
  }
}

class Schema {
  _parser: RegExp
  _replacer: string

  constructor(keyReg: RegExp, schema: string, params: SchemaParams) {
    this._parser = regexpize(
      schema2regStr(
        keyReg,
        schema,
        /*opts*/ params
      ),
      params
    )
    this._replacer = schema2replace(
      keyReg,
      schema
    )
  }

  get replacer() {
    return this._replacer
  }

  match(instance: string) {
    const matchReturn = instance.match(this._parser)
    return matchReturn && (matchReturn.groups ? {...matchReturn.groups} : true)
  }
  matchAll(instance: string) {
    const matchAllReturn = instance.matchAll(this._parser)
    return matchAllReturn && [...matchAllReturn]
    .map(({groups}) => groups && {...groups})
  }
  exec(instance: string) {
    const execReturn = this._parser.exec(instance)
    return execReturn && {...execReturn.groups}  
  }
  test(instance: string) {
    return this._parser.test(instance)
  }
  replace(instance: string, schema: Schema) {
    return this._parser.test(instance)
    && instance.replace(this._parser, schema.replacer)
    //TODO: order escaping/unescaping
    .replace('\\', '')
  }
  /*place(schema: Schema, instance: string) {
    return this.test(instance) && instance.replace(schema._parser, this._replacer)
    //return schema.replace(instance, this)
  }*/
}

export default Parser
export {
  Parser,
  Schema
}