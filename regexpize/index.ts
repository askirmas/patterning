import regExpFlaging from './flags.json'
import {RegExpFlags} from "./definitions"

export {
  regexpize,
  RegExpFlags
}

function regexpize(regexp: string|RegExp, flags?: string|RegExpFlags) {
  return regexp instanceof RegExp
  ? regexp
  : new RegExp(regexp, flagsToString(flags))
}

function flagsToString(flags?: string|RegExpFlags) {
  if (typeof flags === 'string')
    return flags
  if (!flags || typeof flags !== 'object')
    return undefined
  let $return = ''
  , key: keyof typeof flags
  for (key in flags)
    if (key in regExpFlaging && flags[key])
      $return += regExpFlaging[key]
  return $return
}
