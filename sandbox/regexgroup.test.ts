import describing /*, {iUnitTests}*/ from './tester'

interface thisModule<T> {
  obj2path: T
  path2obj: T
}

const mtests: thisModule<any> = require('./regexgroup.test.json')
const m: thisModule<any> = require('./regexgroup')

Object.entries(mtests)
.forEach(([fname, ftests]) =>
  describing(
    m,
    //@ts-ignore
    fname,
    ftests
  )
)
