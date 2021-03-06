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
  
  /** @deprecated */
  schema(schema: string/*TODO: |RegExp|Schema*/, params?: SchemaParams, receiver?: null|string|Schema) {
    const schemas = this._schemas
    /*, {valuePattern} = params
    , opts = {valuePattern, ...free}*/

    //TODO: Receiver could change
    if (params || !schemas.has(schema))
      schemas.set(schema, new Schema(this._keyReg, schema, params || this._params, receiver)) 
    
    return this._schemas.get(schema)!
  }

  add(...args: (string|[string, (null|string)?]|Record<string, null|string|undefined>)[]) {
    for (const schema of args) {
      const isArray = Array.isArray(schema)
      , s = Array.isArray(schema) ? schema[0] : schema
      , r = isArray ? schema[1] : undefined
      
      if (typeof s === "string")
        this.schema(s, undefined, r)
      else
        for (const k in s)
          this.schema(k, undefined, s[k])          
    }
    return this
  }

  match(instance: string) {
    for(const schema of this._schemas.values())
      if (schema.test(instance))
        return schema.match(instance)
    return
  }

  replace(instance: string, parser?: Parser) {
    for (const schema of this._schemas.values())
      if (schema.test(instance))
        //TODO: Privatize parser._schemas
        if (parser)
          for (const recepient of parser._schemas.values()) {
            const $result = schema.replace(instance, recepient)
            if ($result)
              return $result
          }
        else
          return schema.replace(instance)
    return
  }
  //TODO: place() 

  clear() {
    return this._schemas.clear()
  }
}

class Schema {
  _parser: RegExp
  _replacer: string
  _receiver: Schema|undefined|null

  constructor(keyReg: RegExp, schema: string, params: SchemaParams, receiver?: null|string|Schema) {
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
    // TODO: check groups.keys coincide with regexp: <group>|'group'|...
    if (receiver !== undefined)
      this._receiver
      = typeof receiver === 'string'
      ? new Schema(keyReg, receiver, params) 
      : receiver instanceof Schema
      ? receiver
      : null
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
  /*check(instance: string) {
    return this._receiver?.test(instance)
  }*/

  replace(instance: string, schema: null|Schema|undefined = this._receiver) {
    if (!schema)
      return schema    
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
  /** @deprecated */
  Schema
}