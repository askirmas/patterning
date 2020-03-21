import regexpize from "./regexpize"

describe('research', () => {
  type rp = Parameters<typeof regexpize>
  function exec(str: string, schema: rp[0], flags?: rp[1]) {
    const  $return = regexpize(schema, flags)
    .exec(str)
    return $return && {...$return.groups}
  }

  describe('tag as backreference', () => {
    // https://2ality.com/2017/05/regexp-named-capture-groups.html#backreferences
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
    it('html array', () => expect(
      [
        ..."X<title>abc</title>Y<b>b</b>Z"
        .matchAll(
          /<(?<tag>[a-z]+)>(?<text>[^<]*)<\/\k<tag>>/g
        )
      ].map(({groups}) => ({...groups}))
    ).toStrictEqual([
      {tag: "title", text: "abc"},
      {tag: "b", text: "b"}
    ]))
    it('html tags', () => expect(
      [
        ..."X<title>abc</title>Y<b>b</b>Z"
        .matchAll(/[^<]*<(?<tag>[a-z]+)>.*<\/\1>[^<]*/g)
      ].map(({groups}) => ({...groups}))
    ).toStrictEqual([{tag: "title"}, {tag: "b"}]))
    it('html trick', () => expect(
      () => "X<title>abc</title>Y<b>b</b>Z"
        .matchAll(/[^<]*<([a-z]+)>(?<\1>.*)<\/\1[^<]*/g)
    ).toThrowError(SyntaxError))
    it('html', () => expect(
      [
        ..."X<title>abc</title>Y<b>b</b>Z"
        .matchAll(/^([^<]*<(?<tag>[a-z]+)>(.*)<\/\k<tag>>[^<]*)*$/g)
      ].map(({groups, ...etc}) => ({...etc, groups: {...groups}}))
      [0].groups
    ).toStrictEqual({tag: "b"}))
  })
})

describe('methods and globals', () => {
  const nulls = {
    execs: [
      null,
      null,
      null
    ],
    match: null,
    matchAll: []
  }
  , onlyA = {
    execs: [
      ["a"],
      ["a"],
      ["a"]
    ],
    match: ["a"],
    matchAll: [["a"]]
  }
  , cases = [
    [/\w/, "/", nulls],
    [/\w/g, "/", nulls],
    [/\w/, "a", onlyA],
    [/\w/, "a/b", onlyA],
    
    [/\w/g, "a", {
      execs: [
        ["a"],
        null,
        ["a"]
      ],
      match: ["a"],
      matchAll: [["a"]]
    }],

    [/\w/g, "a/b", {
      execs: [
        ["a"],
        ["b"],
        null
      ],
      match: ["a", "b"],
      matchAll: [["a"], ["b"]]
    }],


  ] as const
  for (const [reg, str, {execs, match, matchAll}] of cases)
    describe(`${str} -> ${reg}`, () => {

      /** Shallow decomposition to Array of RegExp Iterators */
      function de(s: any) {
        return s && (
          Array.isArray(s)
          ? [...s]
          : [...s].map(s => [...s])
        )
      }

      function match2all(match?: Readonly<string[]|null>) {
        return !match ? [] : match.map(x => [x])
      }

      describe('execs', () => {
        const {length} = execs
        for (let i = 0; i < length; i++)
        it(`call #${i + 1}`, () => expect(de(reg.exec(str))).toStrictEqual(execs[i]))
      })
      describe('matches', () => {
        it('match', () => expect(de(str.match(reg))).toStrictEqual(match))
        it('matchAll', () => expect(de(str.matchAll(reg))).toStrictEqual(matchAll))
        it('derive', () => expect(de(str.matchAll(reg))).toStrictEqual(match2all(match)))
      })
  })
})
