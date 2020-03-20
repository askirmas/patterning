import { regexpize } from "./regexpize"

type rp = Parameters<typeof regexpize>

export {
  match, matchAll, exec
}

function match(str: string, schema: rp[0], flags?: rp[1]) {
  const $return = str.match(
    regexpize(schema, flags)
  )
  return $return && {...$return.groups}
}

function matchAll(str: string, schema: rp[0], flags: rp[1] = 'g') {
  const $return = str.matchAll(
    regexpize(schema, flags)
  )
  return $return && [...$return]
  .map(({groups}) => groups && {...groups})
}

function exec(str: string, schema: rp[0], flags?: rp[1]) {
  const  $return = regexpize(schema, flags)
  .exec(str)
  return $return && {...$return.groups}
}