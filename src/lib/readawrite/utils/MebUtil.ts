export const convertStringToArrayBufferView = (e: string): ArrayBuffer => {
  const length = e.length
  const buffer = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    buffer[i] = e.charCodeAt(i)
  }
  return buffer.buffer
}

export const convertArrayBufferViewtoString = (e: Uint8Array): string => {
  return new TextDecoder('utf-8').decode(new Uint8Array(e))
}

export const convertHexToString = (e: string): string => {
  let t = ''
  for (let r = 0; r < e.length; r += 2) {
    t += String.fromCharCode(parseInt(e.substring(r, 2), 16))
  }
  return t
}
