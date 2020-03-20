import regExpFlaging from './flags.json'
import {RegExpFlags} from "./definitions"

export {
  regexpize,
  RegExpFlags
}

function regexpize(regexp: string|RegExp, flags?: string|RegExpFlags) {
  const flagsStr = flagsToString(flags)
  return (
    regexp instanceof RegExp
    && (
      flags === undefined
      || regexp.flags === flagsStr
    )
  )
  ? regexp
  : new RegExp(regexp, flagsStr)
}

function flagsToString(flags?: string|RegExpFlags) {
  if (typeof flags === 'string')
    return flags
  if (!flags || typeof flags !== 'object')
    return undefined
  let $return = ''
  , key: keyof typeof flags
  for (key in regExpFlaging)
    if (flags[key])
      $return += regExpFlaging[key]
  return $return
}
