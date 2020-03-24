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
//TODO: Extends Schema means joins all schemas
class Parser {
  _keyReg: RegExp
  _params: Params
  _schemas: Map<string, Schema> = new Map()

  constructor(params: Params) {
    this._keyReg = keyReger(params)
    this._params = params
  }
  
  schema(schema: string/*TODO: |RegExp|Schema*/, params?: SchemaParams, receiver?: string|Schema) {
    const schemas = this._schemas
    /*, {valuePattern} = params
    , opts = {valuePattern, ...free}*/

    if (params || !schemas.has(schema))
      schemas.set(schema, new Schema(this._keyReg, schema, params || this._params, receiver)) 
    return this._schemas.get(schema)!
  }

  match(instance: string) {
    for(const schema of this._schemas.values())
      if (schema.test(instance))
        return schema.match(instance)
    return
  }

  replace(instance: string, parser: Parser) {
    for (const schema of this._schemas.values())
      if (schema.test(instance))
        //TODO: Privatize parser._schemas
        //TODO Add 1-to-1 replacement map 
        for (const recepient of parser._schemas.values()) {
          const $result = schema.replace(instance, recepient)
          if ($result)
            return $result
        }
    return
  }

  clear() {
    return this._schemas.clear()
  }
}

class Schema {
  _parser: RegExp
  _replacer: string
  _receiver: Schema|undefined

  constructor(keyReg: RegExp, schema: string, params: SchemaParams, receiver?: string|Schema) {
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
    if (receiver !== undefined)
      this._receiver
      = typeof receiver === 'string'
      ? new Schema(keyReg, receiver, params) 
      : receiver instanceof Schema
      ? receiver
      : undefined
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
  replace(instance: string, schema: Schema|undefined = this._receiver) {
    if (schema === undefined)
      return null

    const $return = this._parser.test(instance)
    && instance.replace(this._parser, schema.replacer)
    //TODO: order escaping/unescaping
    .replace('\\', '')

    return $return && schema.test($return)
    ? $return
    : undefined
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