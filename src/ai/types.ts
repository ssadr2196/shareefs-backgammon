import type { BoardState, Move, Player, DieValue } from '../game/types'

export interface AIContext {
  board: BoardState
  player: Player
  remaining: DieValue[]
}

export type AIChooseTurn = (ctx: AIContext) => Move[]
