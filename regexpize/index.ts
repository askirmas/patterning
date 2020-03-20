import regExpFlaging from './flags.json'
import {RegExpFlagsObject} from "./definitions"

type RegExpFlags = string|RegExpFlagsObject

export default regexpize
export {
  regexpize,
  RegExpFlags
}

function regexpize(regexp: string|RegExp, flags?: RegExpFlags) {
  let flagsStr: string|undefined = undefined

  switch(typeof flags) {
    case 'string':
      flagsStr = flags
      break
    case 'object':
      if (!flags)
        break
      flagsStr = ''
      let key: keyof typeof flags
      for (key in regExpFlaging)
        if (flags[key])
          flagsStr += regExpFlaging[key]
      break          
  }

  return (
    regexp instanceof RegExp
    && (
      flagsStr === undefined
      || regexp.flags === flagsStr
    )
  )
  ? regexp
  : new RegExp(regexp, flagsStr)
}
