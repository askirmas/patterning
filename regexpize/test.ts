import {regexpize} from '.'
const str = 'asd';
[
  undefined,
  '',
  {global: true},
  {ignoreCase: true, unicode: false, global: true},
  {g: true}
].forEach(flag => myIt(flag))

function myIt(flags: Parameters<typeof regexpize>[1]) {
  return describe(
    flags === undefined
    ? 'undefined'
    : JSON.stringify(flags), () => {
      const result = regexpize(str, flags)
      it("assignment", () => expect(regexpize(str, flags)).toStrictEqual(result))
      it('undefined flags', () => expect(regexpize(result)).toBe(result))
      it('same flags', () => expect(regexpize(result, flags)).toBe(result))
  })
}