import regexpize from "./regexpize"

type rp = Parameters<typeof regexpize>
function exec(str: string, schema: rp[0], flags?: rp[1]) {
  const  $return = regexpize(schema, flags)
  .exec(str)
  return $return && {...$return.groups}
}


/** Shallow decomposition to Array of RegExp Iterators */
function dA(s: any) {
  return s && (
    Array.isArray(s)
    ? [...s]
    : [...s].map(s => [...s])
  )
}
/** Shallow decomposition to Object of RegExp Iterators */
function dO(s: any) {
  return s && (
    Array.isArray(s)
    ? {...s}
    : [...s].map(s => ({...s}))
  )
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

describe('methods and globals', () => {
  it.todo('with start and end')
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

      function match2all(match?: Readonly<string[]|null>) {
        return !match ? [] : match.map(x => [x])
      }

      describe('execs', () => {
        const {length} = execs
        for (let i = 0; i < length; i++)
        it(`call #${i + 1}`, () => expect(dA(reg.exec(str))).toStrictEqual(execs[i]))
      })
      describe('matches', () => {
        it('match', () => expect(dA(str.match(reg))).toStrictEqual(match))
        it('matchAll', () => expect(dA(str.matchAll(reg))).toStrictEqual(matchAll))
        it('derive', () => expect(dA(str.matchAll(reg))).toStrictEqual(match2all(match)))
      })
  })
})

describe("super position", () => {
  const endsStriper = /(^\^|\$$)/g
  function switchRegExps(regexps: (string|RegExp)[], notStrict?: boolean) {
    return new RegExp(`${
      notStrict ? "^" : ""
    }${
      regexps
      .map(reg => `(${
        notStrict ? "" : "^"
      }${
        (
          reg instanceof RegExp
          ? reg.source
          //: typeof reg === 'string'
          : reg
        )
        .replace(endsStriper, '')
      }${
        notStrict ? "" : "$"
      })`)
      .join('|')
    }${
      notStrict ? "$" : ""
    }`, 'g')
  }

  describe("switch", () => {
    describe("little demo", () => {
      const routes = switchRegExps([
        /(?<command>\w+)\/(?<id>\w+)/,
        /(?<x>\w+)\/(?<y>\w+)/
      ])
      it('same pattern, different keys', () => expect(dO(
        'a/b'.matchAll(
          routes
        )
      )).toMatchObject([{
        "groups": { 
          "command": "a",
          "id": "b",
          "x": undefined,
          "y": undefined
        }
      }]))
      
      it('SyntaxError: Duplicate capture group name', () => expect(
        () => /(?<a>\d+)|(?<a>[a-z]+)/
      ).toThrowError(/Duplicate capture group name$/))
    })
    describe('webportal', () => {
      const routes = [
        /^api\/(?<collection_script>\w+)$/,
        /^api\/(?<get_script>\w+)\/(?<id>\d+)$/,
        /^(?<collection_page>\w+)$/,
        /^(?<page>\w+)\/(?<item>\w+)$/
      ]
      , strictRouting = switchRegExps(routes) 
      , notStrictRouting = switchRegExps(routes, true)

      function suiting(r: RegExp, suites: Readonly<Readonly<[string, object?]>[]>) {
        for (const [request, groups] of suites)
        it(request, () => expect(dO(
          request.matchAll(r)
        )).toMatchObject(
          !groups ? []
          : (Array.isArray(groups) ? groups : [groups])
          .map(groups => ({groups}))
        ))  
      }

      describe('strict = any', () => {
        const suites = [
          ["api/user", {
            "collection_script": "user",
            "get_script": undefined,
            "id": undefined,
            "collection_page": undefined,
            "page": undefined,
            "item": undefined
          }],
          ["user", {
            "collection_page": "user",
            "collection_script": undefined,
            "get_script": undefined,
            "id": undefined,
            "page": undefined,
            "item": undefined
          }],
        ] as const
        describe('strict=true', () => suiting(strictRouting, suites))
        describe('strict=false', () => suiting(notStrictRouting, suites))
      }) 
      describe("strict=true", () => {
        suiting(strictRouting, [
          ["api/user/10", {
            "get_script": "user",
            "id": "10",
            "collection_script": undefined,
            "collection_page": undefined,
            "page": undefined,
            "item": undefined
          }],
          ["api/user/bibi"],
          ["user/bibi", {
            "page": "user",
            "item": "bibi",
            "collection_script": undefined,
            "get_script": undefined,
            "id": undefined,
            "collection_page": undefined
          }],
          ["user/bibi/junior"],
        ] as const)      
      })
    })
  })

  function chainRegExps(regs: RegExp[], instance: string) {  
    const $result = regs.find(reg => reg.test(instance))?.exec(instance)?.groups
    return $result && {...$result}
  }

  describe('chain', () => {
    const routes = [
      /^api\/(?<script>\w+)$/,
      /^api\/(?<script>\w+)\/(?<id>\d+)$/,
      /^(?<page>\w+)$/,
      /^(?<page>\w+)\/(?<item>\w+)$/
    ]
    , cases = [
      [""],
      ["api", {
        "page": "api"
      }],
      ["api/user", {
        "script": "user",
      }],
      ["api/user/10", {
        "script": "user",
        "id": "10"
      }],
      ["api/user/bibi"],
      ["user", {
        "page": "user"
      }],
      ["user/bibi", {
        "page": "user",
        "item": "bibi"
      }],
      ["user/bibi/junior"],
    ] as const
    for (const [url, expectation] of cases)
     it(url, () => expect(chainRegExps(routes, url)).toStrictEqual(expectation))
  })
})