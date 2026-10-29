const glyphs: Record<string, string[]> = {
  A: ['01110', '11011', '11011', '11111', '11011', '11011'],
  V: ['11011', '11011', '11011', '11011', '01110', '00100'],
  D: ['11110', '11011', '11011', '11011', '11011', '11110'],
  E: ['11111', '11000', '11110', '11000', '11000', '11111'],
  Y: ['11011', '11011', '01110', '00100', '00100', '00100'],
  '.': ['000', '000', '000', '000', '110', '110'],
  '0': ['01110', '11011', '11011', '11011', '11011', '01110'],
  '4': ['11011', '11011', '11111', '00011', '00011', '00011'],
  '5': ['11111', '11000', '11110', '00011', '00011', '11110'],
}

/** Text cells remain aligned in the shared monospaced font. */
export function asciiWordmark(text: string) {
  return Array.from({ length: 6 }, (_, row) => Array.from(text, letter =>
    (glyphs[letter]?.[row] ?? '00000').replaceAll('1', '█').replaceAll('0', ' ')).join(' ')).join('\n')
}

export function almatyTime() {
  return 'ALMT ' + new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit',
  }).format(new Date())
}

/** Use physical keys so terminal shortcuts are independent of input language. */
export function terminalKey(event: Pick<KeyboardEvent, 'code' | 'key' | 'shiftKey'>) {
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3).toLowerCase()
  if (event.code === 'Slash' && event.shiftKey) return '?'
  return event.key.length === 1 ? event.key.toLowerCase() : event.key
}
