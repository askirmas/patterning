import * as runner from "./runner"
import { pattern2regStr } from "./pattern2regStr"

type Methods = keyof typeof runner
//const methods = Object.freeze(Object.keys(runner) as Methods[])
const methods = Object.freeze(["match", "exec", "matchAll"] as const)

type PatternParameters = Parameters<typeof pattern2regStr>[1]
type Flags = Parameters<typeof runner[Methods]>[2]

export default launcher
export {
  match, exec, matchAll,
  methods,
  PatternParameters, Flags, Methods
}

function launcher(
  method: keyof typeof runner,
  instance: string,
  schema: string,
  params: PatternParameters,
  flags?: Flags
) {
  return runner[method](instance, pattern2regStr(schema, params), flags)
}

function match(
  instance: string,
  schema: string,
  params: PatternParameters,
  flags?: Flags
) {
  return runner.match(instance, pattern2regStr(schema, params), flags)
}

function exec(
  instance: string,
  schema: string,
  params: PatternParameters,
  flags?: Flags
) {
  return runner.exec(instance, pattern2regStr(schema, params), flags)
}

function matchAll(
  instance: string,
  schema: string,
  params: PatternParameters,
  flags?: Flags
) {
  return runner.matchAll(instance, pattern2regStr(schema, params), flags)
}
