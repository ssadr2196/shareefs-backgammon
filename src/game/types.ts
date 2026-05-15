// Core backgammon types — pure, no React dependency

export type Player = 'white' | 'black'

/** Point 1-24, 0 = bar, 25 = borne off */
export type PointIndex = number

export interface CheckerPosition {
  point: PointIndex // 0=bar, 1-24=board points, 25=borne-off
  player: Player
}

/**
 * Board representation:
 * - points[0]  = unused (1-indexed for clarity)
 * - points[1]  = point 1  (white's home: 1-6, black's home: 19-24)
 * - points[24] = point 24
 * - bar.white / bar.black = checkers on bar
 * - off.white / off.black = borne-off checkers
 *
 * White moves 1→24, Black moves 24→1
 */
export interface BoardState {
  // points[i].count > 0 means that many checkers of points[i].player occupy point i
  points: Array<{ count: number; player: Player | null }>
  bar: { white: number; black: number }
  off: { white: number; off: number; black: number }
}

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6

export interface DiceState {
  values: [DieValue, DieValue]
  remaining: DieValue[] // dice moves still available to play
  rolled: boolean
}

export interface Move {
  from: PointIndex // 0 = bar
  to: PointIndex   // 25 = bear off
  dieUsed: DieValue
  hit: boolean     // true if this move hit an opponent blot
}

export type GamePhase = 'rolling' | 'moving' | 'game-over'

export type WinType = 'normal' | 'gammon' | 'backgammon'

export interface GameState {
  board: BoardState
  currentPlayer: Player
  dice: DiceState
  phase: GamePhase
  winner: Player | null
  winType: WinType | null
  moveHistory: Move[][]  // array of turns, each turn is array of moves
  turnNumber: number
}

export interface PlayerProfile {
  username: string
  wins: number
  losses: number
  gamesPlayed: number
  createdAt: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'
