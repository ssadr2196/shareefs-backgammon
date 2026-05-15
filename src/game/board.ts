import type { BoardState, Player } from './types'

/** Standard backgammon starting position.
 * White moves from point 1 toward 24.
 * Black moves from point 24 toward 1.
 */
export function createInitialBoard(): BoardState {
  const points: BoardState['points'] = Array.from({ length: 25 }, () => ({
    count: 0,
    player: null,
  }))

  // Standard starting layout
  const setup: Array<[number, Player, number]> = [
    [24, 'white', 2],
    [13, 'white', 5],
    [8,  'white', 3],
    [6,  'white', 5],
    [1,  'black', 2],
    [12, 'black', 5],
    [17, 'black', 3],
    [19, 'black', 5],
  ]

  for (const [point, player, count] of setup) {
    points[point] = { count, player }
  }

  return {
    points,
    bar: { white: 0, black: 0 },
    off: { white: 0, off: 0, black: 0 },
  }
}

/** Deep clone a board — keeps state immutable during move application */
export function cloneBoard(board: BoardState): BoardState {
  return {
    points: board.points.map(p => ({ ...p })),
    bar: { ...board.bar },
    off: { ...board.off },
  }
}

/** Count checkers owned by player on a given point (0 if opponent or empty) */
export function checkerCount(board: BoardState, point: number, player: Player): number {
  const p = board.points[point]
  if (!p || p.player !== player) return 0
  return p.count
}

/** True if point has exactly one opposing checker (blot) */
export function isBlot(board: BoardState, point: number, player: Player): boolean {
  const p = board.points[point]
  const opponent = player === 'white' ? 'black' : 'white'
  return p.player === opponent && p.count === 1
}

/** True if point is occupied by opponent with 2+ checkers (blocked) */
export function isBlocked(board: BoardState, point: number, player: Player): boolean {
  const p = board.points[point]
  const opponent = player === 'white' ? 'black' : 'white'
  return p.player === opponent && p.count >= 2
}

/** Home board range for a player: white = 1-6, black = 19-24 */
export function homeRange(player: Player): [number, number] {
  return player === 'white' ? [1, 6] : [19, 24]
}

/** Count total checkers still on the board + bar for a player */
export function checkersRemaining(board: BoardState, player: Player): number {
  let total = player === 'white' ? board.bar.white : board.bar.black
  for (let i = 1; i <= 24; i++) {
    const p = board.points[i]
    if (p.player === player) total += p.count
  }
  return total
}

/** True when all of a player's checkers are in their home board */
export function allCheckersHome(board: BoardState, player: Player): boolean {
  const bar = player === 'white' ? board.bar.white : board.bar.black
  if (bar > 0) return false
  const [lo, hi] = homeRange(player)
  for (let i = 1; i <= 24; i++) {
    if (i >= lo && i <= hi) continue
    if (board.points[i].player === player && board.points[i].count > 0) return false
  }
  return true
}

/** Pip count for a player — lower is better (closer to bearing off) */
export function pipCount(board: BoardState, player: Player): number {
  let pip = 0
  if (player === 'white') {
    pip += board.bar.white * 25
    for (let i = 1; i <= 24; i++) {
      if (board.points[i].player === 'white') {
        pip += board.points[i].count * (25 - i)
      }
    }
  } else {
    pip += board.bar.black * 25
    for (let i = 1; i <= 24; i++) {
      if (board.points[i].player === 'black') {
        pip += board.points[i].count * i
      }
    }
  }
  return pip
}

/** Opponent of a player */
export function opponent(player: Player): Player {
  return player === 'white' ? 'black' : 'white'
}
