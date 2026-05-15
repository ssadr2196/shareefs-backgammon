import { allLegalTurns, applyMove, deduplicateTurns } from '../game/moves'
import { opponent, pipCount } from '../game/board'
import type { AIContext } from './types'
import type { BoardState, Move, Player } from '../game/types'

/**
 * Score a board position from the perspective of `player`.
 * Returns higher values for better positions.
 * Heuristics: hitting blots, making points, avoiding leaving blots, pip count advantage.
 */
function scoreBoardMedium(board: BoardState, player: Player, prevBoard: BoardState): number {
  let score = 0
  const opp = opponent(player)

  // Pip count advantage (lower pip count = better)
  const myPip = pipCount(board, player)
  const oppPip = pipCount(board, opp)
  score += (oppPip - myPip) * 2

  // Bonus for hitting opponent blots (opponent bar checkers went up)
  const oppBarBefore = opp === 'white' ? prevBoard.bar.white : prevBoard.bar.black
  const oppBarAfter = opp === 'white' ? board.bar.white : board.bar.black
  score += (oppBarAfter - oppBarBefore) * 25

  // Bonus for owning points (2+ checkers = point is made)
  for (let i = 1; i <= 24; i++) {
    const p = board.points[i]
    if (p.player === player && p.count >= 2) score += 5
    if (p.player === opp && p.count >= 2) score -= 3
  }

  // Penalty for leaving blots, especially in opponent's home (points 19-24 for white's perspective)
  // For white: blots on high points (near opponent's home) are dangerous
  // For black: blots on low points are dangerous
  for (let i = 1; i <= 24; i++) {
    if (board.points[i].player === player && board.points[i].count === 1) {
      // Blot in dangerous zone (opponent's inner board / priming zone)
      const dangerous = player === 'white' ? i >= 17 : i <= 8
      score -= dangerous ? 15 : 8
    }
  }

  // Bonus for bearing off checkers
  const myOff = player === 'white' ? board.off.white : board.off.black
  const prevMyOff = player === 'white' ? prevBoard.off.white : prevBoard.off.black
  score += (myOff - prevMyOff) * 20

  return score
}

export function mediumChooseTurn(ctx: AIContext): Move[] {
  const { board, player, remaining } = ctx
  const turns = deduplicateTurns(allLegalTurns(board, player, remaining))

  if (turns.length === 0 || (turns.length === 1 && turns[0].length === 0)) return []

  const nonEmpty = turns.filter(t => t.length > 0)
  if (nonEmpty.length === 0) return []

  const scored = nonEmpty.map(turn => {
    let b = board
    for (const move of turn) b = applyMove(b, move, player)
    return { turn, score: scoreBoardMedium(b, player, board) }
  })

  scored.sort((a, b) => b.score - a.score)

  // Add slight randomness so the medium AI isn't perfectly deterministic
  const topCut = Math.max(1, Math.ceil(scored.length * 0.25))
  const pool = scored.slice(0, topCut)
  return pool[Math.floor(Math.random() * pool.length)].turn
}
