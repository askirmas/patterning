import {regexpize} from '.'
const str = 'asd';
[
  undefined,
  '',
  {global: true},
  {g: true}
].forEach(flag => myIt(flag))

function myIt(flags: Parameters<typeof regexpize>[1]) {
  return it(
    flags === undefined
    ? 'undefined'
    : JSON.stringify(flags), () => {
      const result = regexpize(str, flags)
      expect(regexpize(str, flags)).toStrictEqual(result) 
      expect(regexpize(result)).toStrictEqual(result)     
  })

}