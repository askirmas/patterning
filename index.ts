import { pattern2regStr, RegStrParams as KeyParameters} from "./pattern2regStr"
import { regexpize, RegExpFlags } from "./regexpize"

export default match
export {
  match, exec, matchAll,
  KeyParameters, RegExpFlags
}

function match(
  instance: string,
  strSchema: string,
  params: KeyParameters,
  flags?: RegExpFlags
) {
  const schema = pattern2regStr(strSchema, params)
  , $return = instance.match(
    regexpize(schema, flags)
  )
  return $return && {...$return.groups}
}

function exec(
  instance: string,
  strSchema: string,
  params: KeyParameters,
  flags?: RegExpFlags
) {
  const schema = pattern2regStr(strSchema, params)
  , $return = regexpize(schema, flags)
  .exec(instance)

  return $return && {...$return.groups}  
}

function matchAll(
  instance: string,
  strSchema: string,
  params: KeyParameters,
  flags: RegExpFlags = 'g'
) {
  const schema = pattern2regStr(strSchema, params)
  , $return = instance.matchAll(
    regexpize(schema, flags)
  )
  return $return && [...$return]
  .map(({groups}) => groups && {...groups})
}
