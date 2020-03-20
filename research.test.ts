import {exec} from "./runner"

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
