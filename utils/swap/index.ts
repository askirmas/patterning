export default swap
export {
  swap
}

type RecordKeys = string | number | symbol

function swap<T1, T2>(source: Map<T1, T2>) :Map<T2, T1>
function swap<T1 extends RecordKeys, T2>(source: Record<T1, T2>) :Map<T2, T1>
function swap(source: any) :undefined
function swap(source: any) {
  if (source === null || typeof source !== 'object')
    return
  //@ts-ignore Cannot find name 'T2'
  const $return: Map<T2, T1> = new Map()
  if (source instanceof Map) {
    for (const entry of source.entries()) {
      const value = entry[1]
      if ($return.has(value))
        throw new Error('Duplicated value')
      $return.set(value, entry[0])
    }
  } else {
    const keys = Object.keys(source)
    , {length} = keys 
    for (let i = 0; i < length; i++) {
      const key = keys[i]
      $return.set(source[key], key)
    }
  }
  return $return
}
