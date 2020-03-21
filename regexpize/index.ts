import regExpFlaging from './flags.json'
import {RegExpFlagsObject} from "./definitions"

type RegExpFlags = RegExpFlagsObject|string|null|undefined|false

export default regexpize
export {
  regexpize,
  RegExpFlags
}

/** @returns `source` on strict `flags` equilty */
function regexpize(
  source: string|RegExp,
  flags?: RegExpFlags
) {
  let flagsStr: string|undefined = undefined

  // flagObject to flagString 
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
    source instanceof RegExp
    && (
      flagsStr === undefined
      || source.flags === flagsStr
    )
  )
  ? source
  : new RegExp(source, flagsStr)
}
