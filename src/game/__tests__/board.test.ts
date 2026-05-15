import { describe, it, expect } from 'vitest'
import { createInitialBoard, isBlot, isBlocked, allCheckersHome, pipCount, checkersRemaining } from '../board'

describe('Initial board setup', () => {
  const board = createInitialBoard()

  it('has correct white checker positions', () => {
    expect(board.points[24]).toEqual({ count: 2, player: 'white' })
    expect(board.points[13]).toEqual({ count: 5, player: 'white' })
    expect(board.points[8]).toEqual({ count: 3, player: 'white' })
    expect(board.points[6]).toEqual({ count: 5, player: 'white' })
  })

  it('has correct black checker positions', () => {
    expect(board.points[1]).toEqual({ count: 2, player: 'black' })
    expect(board.points[12]).toEqual({ count: 5, player: 'black' })
    expect(board.points[17]).toEqual({ count: 3, player: 'black' })
    expect(board.points[19]).toEqual({ count: 5, player: 'black' })
  })

  it('has 15 white checkers', () => {
    const total = board.points.reduce((s, p) => s + (p.player === 'white' ? p.count : 0), 0)
    expect(total).toBe(15)
  })

  it('has 15 black checkers', () => {
    const total = board.points.reduce((s, p) => s + (p.player === 'black' ? p.count : 0), 0)
    expect(total).toBe(15)
  })

  it('has empty bar', () => {
    expect(board.bar.white).toBe(0)
    expect(board.bar.black).toBe(0)
  })
})

describe('Board queries', () => {
  it('isBlot detects single opponent checker', () => {
    const board = createInitialBoard()
    // Point 24 has 2 white checkers — not a blot for black
    expect(isBlot(board, 24, 'black')).toBe(false)
    // Manually place a single black checker
    const b = { ...board, points: board.points.map((p, i) => i === 20 ? { count: 1, player: 'black' as const } : p) }
    expect(isBlot(b, 20, 'white')).toBe(true)
  })

  it('isBlocked detects 2+ opponent checkers', () => {
    const board = createInitialBoard()
    // Point 1 has 2 black checkers — blocked for white
    expect(isBlocked(board, 1, 'white')).toBe(true)
    // Point 24 has 2 white checkers — blocked for black
    expect(isBlocked(board, 24, 'black')).toBe(true)
  })

  it('allCheckersHome returns false at start', () => {
    expect(allCheckersHome(createInitialBoard(), 'white')).toBe(false)
    expect(allCheckersHome(createInitialBoard(), 'black')).toBe(false)
  })

  it('allCheckersHome returns true when all in home board', () => {
    // Build a board with all white checkers in home (1-6)
    const board = createInitialBoard()
    const points = board.points.map(() => ({ count: 0, player: null as 'white' | 'black' | null }))
    points[6] = { count: 15, player: 'white' }
    const b = { ...board, points }
    expect(allCheckersHome(b, 'white')).toBe(true)
  })
})

describe('Pip count', () => {
  it('calculates white pip count from starting position', () => {
    const board = createInitialBoard()
    // White: 2@24→1pip each = 2, 5@13→12pip each = 60, 3@8→17pip each = 51, 5@6→19pip each = 95
    // pip = (25-point)*count for white
    const expected = 2*(25-24) + 5*(25-13) + 3*(25-8) + 5*(25-6)
    expect(pipCount(board, 'white')).toBe(expected)
  })

  it('white and black start with equal pip counts', () => {
    const board = createInitialBoard()
    expect(pipCount(board, 'white')).toBe(pipCount(board, 'black'))
  })
})

describe('checkersRemaining', () => {
  it('returns 15 at start', () => {
    const board = createInitialBoard()
    expect(checkersRemaining(board, 'white')).toBe(15)
    expect(checkersRemaining(board, 'black')).toBe(15)
  })
})
