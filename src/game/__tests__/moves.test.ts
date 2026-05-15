import { describe, it, expect } from 'vitest'
import { createInitialBoard } from '../board'
import { movesForDie, applyMove, allLegalTurns, validDestinations } from '../moves'
import type { BoardState, Player } from '../types'

// White moves -1 (from 24 toward 1), home board 1-6, enters at 25-die
// Black moves +1 (from 1 toward 24), home board 19-24, enters at die

function makeBoard(
  setup: Array<[number, Player | null, number]>,
  bar = { white: 0, black: 0 },
  off = { white: 0, off: 0, black: 0 }
): BoardState {
  const points = Array.from({ length: 25 }, () => ({ count: 0, player: null as Player | null }))
  for (const [pt, player, count] of setup) {
    points[pt] = { count, player }
  }
  return { points, bar, off }
}

describe('movesForDie — normal moves', () => {
  it('white moves in -1 direction', () => {
    const board = makeBoard([[10, 'white', 1]])
    const moves = movesForDie(board, 'white', 3)
    // 10 - 3 = 7
    expect(moves.some(m => m.from === 10 && m.to === 7)).toBe(true)
  })

  it('black moves in +1 direction', () => {
    const board = makeBoard([[10, 'black', 1]])
    const moves = movesForDie(board, 'black', 3)
    // 10 + 3 = 13
    expect(moves.some(m => m.from === 10 && m.to === 13)).toBe(true)
  })

  it('does not generate move to a blocked point', () => {
    const board = createInitialBoard()
    // White at 6, die 5: 6-5=1 — point 1 has 2 black checkers (blocked)
    const moves = movesForDie(board, 'white', 5)
    expect(moves.some(m => m.from === 6 && m.to === 1)).toBe(false)
  })

  it('generates hit move onto a blot', () => {
    // White at 16, black blot at 13, die 3
    const board = makeBoard([[16, 'white', 1], [13, 'black', 1]])
    const moves = movesForDie(board, 'white', 3)
    const hitMove = moves.find(m => m.from === 16 && m.to === 13)
    expect(hitMove).toBeDefined()
    expect(hitMove?.hit).toBe(true)
  })
})

describe('applyMove', () => {
  it('moves checker and decrements source', () => {
    const board = makeBoard([[10, 'white', 2]])
    const move = { from: 10, to: 7, dieUsed: 3 as const, hit: false }
    const b = applyMove(board, move, 'white')
    expect(b.points[10].count).toBe(1)
    expect(b.points[7].count).toBe(1)
    expect(b.points[7].player).toBe('white')
  })

  it('sends opponent to bar on hit', () => {
    const board = makeBoard([[16, 'white', 1], [13, 'black', 1]])
    const move = { from: 16, to: 13, dieUsed: 3 as const, hit: true }
    const b = applyMove(board, move, 'white')
    expect(b.bar.black).toBe(1)
    expect(b.points[13].player).toBe('white')
    expect(b.points[13].count).toBe(1)
  })

  it('white enters from bar', () => {
    // White on bar, die 3 → enters on 25-3=22
    const board = makeBoard([], { white: 1, black: 0 })
    const move = { from: 0, to: 22, dieUsed: 3 as const, hit: false }
    const b = applyMove(board, move, 'white')
    expect(b.bar.white).toBe(0)
    expect(b.points[22].count).toBe(1)
    expect(b.points[22].player).toBe('white')
  })

  it('black enters from bar', () => {
    // Black on bar, die 4 → enters on point 4
    const board = makeBoard([], { white: 0, black: 1 })
    const move = { from: 0, to: 4, dieUsed: 4 as const, hit: false }
    const b = applyMove(board, move, 'black')
    expect(b.bar.black).toBe(0)
    expect(b.points[4].count).toBe(1)
    expect(b.points[4].player).toBe('black')
  })

  it('bears off', () => {
    const board = makeBoard([[3, 'white', 1]])
    const move = { from: 3, to: 25, dieUsed: 3 as const, hit: false }
    const b = applyMove(board, move, 'white')
    expect(b.off.white).toBe(1)
    expect(b.points[3].count).toBe(0)
  })
})

describe('Bar entry rules', () => {
  it('cannot make normal move while on bar', () => {
    const board = makeBoard([[10, 'white', 2]], { white: 1, black: 0 })
    const moves = movesForDie(board, 'white', 3)
    // All moves must be bar entries (from===0)
    expect(moves.every(m => m.from === 0)).toBe(true)
  })

  it('white enters on 25-die', () => {
    const board = makeBoard([], { white: 1, black: 0 })
    const moves = movesForDie(board, 'white', 4)
    // White enters on 25-4=21
    expect(moves.some(m => m.from === 0 && m.to === 21)).toBe(true)
  })

  it('black enters on die', () => {
    const board = makeBoard([], { white: 0, black: 1 })
    const moves = movesForDie(board, 'black', 4)
    // Black enters on point 4
    expect(moves.some(m => m.from === 0 && m.to === 4)).toBe(true)
  })

  it('cannot enter on blocked point', () => {
    // White on bar, die 4 → would enter at 21, but 21 is blocked by black
    const board = makeBoard([[21, 'black', 2]], { white: 1, black: 0 })
    const moves = movesForDie(board, 'white', 4)
    expect(moves.length).toBe(0)
  })
})

describe('Bearing off', () => {
  it('cannot bear off when checkers outside home board', () => {
    // White has checker at 10 (outside home 1-6), so can't bear off
    const board = makeBoard([[6, 'white', 14], [10, 'white', 1]])
    const moves = movesForDie(board, 'white', 6)
    expect(moves.some(m => m.to === 25)).toBe(false)
  })

  it('can bear off with exact roll (die === point)', () => {
    // All white in home board, checker at 3, die 3: 3-3=0 = exact bear-off
    const board = makeBoard([[3, 'white', 1], [2, 'white', 14]])
    const moves = movesForDie(board, 'white', 3)
    expect(moves.some(m => m.from === 3 && m.to === 25)).toBe(true)
  })

  it('can bear off with higher die when no checker on higher point', () => {
    // All white in home board at 1,2,3 — roll die 5
    // Point 3 can bear off with die 5 (overshoot) since no checker on 4,5,6
    const board = makeBoard([[3, 'white', 5], [2, 'white', 5], [1, 'white', 5]])
    const moves = movesForDie(board, 'white', 5)
    expect(moves.some(m => m.from === 3 && m.to === 25)).toBe(true)
  })

  it('cannot overshoot bear-off if higher point is occupied', () => {
    // White at 5 and 2. Die 3: from 2, dest = 2-3 = -1 (overshoot).
    // BUT there's a checker on point 5 (higher) → cannot bear off from 2
    const board = makeBoard([[5, 'white', 1], [2, 'white', 14]])
    const moves = movesForDie(board, 'white', 3)
    expect(moves.some(m => m.from === 2 && m.to === 25)).toBe(false)
  })

  it('black can bear off with exact roll', () => {
    // All black in home board at 22, die 3: 22+3=25 = exact
    const board = makeBoard([[22, 'black', 1], [20, 'black', 14]])
    const moves = movesForDie(board, 'black', 3)
    expect(moves.some(m => m.from === 22 && m.to === 25)).toBe(true)
  })

  it('black can bear off with higher die when no checker on lower point', () => {
    // All black in home board at 22,23,24. Die 5: from 22, 22+5=27>24, overshoot
    // No checker on 19,20,21 (lower than 22) → can bear off
    const board = makeBoard([[22, 'black', 5], [23, 'black', 5], [24, 'black', 5]])
    const moves = movesForDie(board, 'black', 5)
    expect(moves.some(m => m.from === 22 && m.to === 25)).toBe(true)
  })
})

describe('allLegalTurns — must use both dice', () => {
  it('returns turns that use maximum dice', () => {
    const board = createInitialBoard()
    const turns = allLegalTurns(board, 'white', [3, 4])
    expect(turns.length).toBeGreaterThan(0)
    const maxLen = Math.max(...turns.map(t => t.length))
    expect(maxLen).toBe(2)
  })

  it('doubles produce up to 4 moves', () => {
    const board = createInitialBoard()
    const turns = allLegalTurns(board, 'white', [3, 3, 3, 3])
    const maxLen = Math.max(...turns.map(t => t.length))
    expect(maxLen).toBe(4)
  })

  it('must play higher die when only one can be played', () => {
    // White has one checker at point 5 (all in home board).
    // Black blocks point 2. Die 3: 5→2 blocked. Die 5: 5→0 exact bear-off.
    // Only die 5 can be played → must use die 5 (higher).
    const board = makeBoard([[5, 'white', 1], [2, 'black', 2]])
    const turns = allLegalTurns(board, 'white', [3, 5])
    expect(turns.length).toBeGreaterThan(0)
    const allDice = turns.flat().map(m => m.dieUsed)
    expect(allDice.every(d => d === 5)).toBe(true)
  })
})

describe('validDestinations', () => {
  it('returns valid dests for selected checker', () => {
    const board = createInitialBoard()
    // White at 24, dice [3,4]: dests = 24-3=21, 24-4=20 (and combos after)
    const dests = validDestinations(board, 'white', 24, [3, 4])
    expect(dests.length).toBeGreaterThan(0)
    expect(dests.every(d => d >= 1 && d <= 24)).toBe(true)
  })
})
