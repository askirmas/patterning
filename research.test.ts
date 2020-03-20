import { regexpize } from "./regexpize"


describe('tag as backreference', () => {
  const key = "tag"
  , keyPattern = '[a-z]+'
  , valuePattern = "[^<]+"
  , openPrefix = "<"
  , openPostfix = ">"
  , closePrefix = "</"
  , closePostfix = ">"
  , catcher = `${
    openPrefix}(?<${key}>${keyPattern})${openPostfix
  }${
    valuePattern
  }${
    closePrefix}\\k<${key}>${closePostfix
  }`
  it('true', () => expect(exec("<title>abc</title>", catcher)).toStrictEqual({
    "tag": "title"
  }))
  it('false', () => expect(exec("<title>abc</titl>", catcher)).toBe(null))

})


type rp = Parameters<typeof regexpize>
function exec(str: string, schema: rp[0], flags?: rp[1]) {
  const  $return = regexpize(schema, flags)
  .exec(str)
  return $return && {...$return.groups}
}