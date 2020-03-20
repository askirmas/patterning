import regExpFlaging from './flags.json'

export {
  regexpize
}
  
/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
export type RegExpFlags = Partial<{
  /** Global search */
  "global": boolean
  /** Case-insensitive search */
  "ignoreCase": boolean
  /** Multi-line search */
  "multiline": boolean
  /** Allows `.` to match newline characters. (Added in ES2018, not yet supported in Firefox) */
  "dotAll": boolean
  /** "unicode"; treat a pattern as a sequence of unicode code points */
  "unicode": boolean
  /** Perform a "sticky" search that matches starting at the current position in the target string. See [sticky](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky) */
  "sticky": boolean    
}>

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
