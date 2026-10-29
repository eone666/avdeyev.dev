import { expect, test } from 'bun:test'
import { terminalKey } from './terminal'

test('physical shortcuts work with Latin and Russian key values', () => {
  for (const [code, latin, russian] of [
    ['KeyH', 'h', 'р'], ['KeyJ', 'j', 'о'], ['KeyK', 'k', 'л'], ['KeyL', 'l', 'д'],
    ['KeyP', 'p', 'з'], ['KeyA', 'a', 'ф'], ['KeyC', 'c', 'с'],
  ]) {
    expect(terminalKey({ code, key: latin, shiftKey: false })).toBe(latin)
    expect(terminalKey({ code, key: russian, shiftKey: false })).toBe(latin)
  }
  expect(terminalKey({ code: 'Slash', key: ',', shiftKey: true })).toBe('?')
  expect(terminalKey({ code: 'Digit3', key: '3', shiftKey: false })).toBe('3')
  expect(terminalKey({ code: 'ArrowDown', key: 'ArrowDown', shiftKey: false })).toBe('ArrowDown')
})
