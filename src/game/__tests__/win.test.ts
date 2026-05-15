import { describe, it, expect } from 'vitest'
import { checkWin } from '../win'
import type { BoardState } from '../types'

function emptyBoard(whiteOff: number, blackOff: number, bar = { white: 0, black: 0 }, whiteHomeCheckers = 0): BoardState {
  const points = Array.from({ length: 25 }, () => ({ count: 0, player: null as 'white' | 'black' | null }))
  if (whiteHomeCheckers > 0) {
    points[3] = { count: whiteHomeCheckers, player: 'white' }
  }
  return {
    points,
    bar,
    off: { white: whiteOff, off: 0, black: blackOff },
  }
}

describe('Win detection', () => {
  it('returns null when white has not borne off all', () => {
    expect(checkWin(emptyBoard(14, 0), 'white')).toBeNull()
  })

  it('detects normal win', () => {
    // White off all 15, black has borne off some
    expect(checkWin(emptyBoard(15, 5), 'white')).toBe('normal')
  })

  it('detects gammon — opponent borne off none', () => {
    expect(checkWin(emptyBoard(15, 0), 'white')).toBe('gammon')
  })

  it('detects backgammon — opponent on bar', () => {
    expect(checkWin(emptyBoard(15, 0, { white: 0, black: 1 }), 'white')).toBe('backgammon')
  })

  it('detects backgammon — opponent in winner home board', () => {
    const board = emptyBoard(15, 0)
    // Place a black checker in white's home board (points 1-6)
    board.points[4] = { count: 1, player: 'black' }
    expect(checkWin(board, 'white')).toBe('backgammon')
  })

  it('detects black gammon', () => {
    expect(checkWin(emptyBoard(0, 15), 'black')).toBe('gammon')
  })
})
