import { allLegalTurns, applyMove, deduplicateTurns } from '../game/moves'
import type { AIContext } from './types'
import type { Move } from '../game/types'

/**
 * Easy AI: picks a random legal turn, with a slight preference for
 * turns that don't leave blots (single checkers exposed to attack).
 */
export function easyChooseTurn(ctx: AIContext): Move[] {
  const { board, player, remaining } = ctx
  const turns = deduplicateTurns(allLegalTurns(board, player, remaining))

  if (turns.length === 0 || (turns.length === 1 && turns[0].length === 0)) return []

  // Filter out empty (pass) turns unless that's all we have
  const nonEmpty = turns.filter(t => t.length > 0)
  if (nonEmpty.length === 0) return []

  // Score: prefer turns that don't leave a new blot
  const scored = nonEmpty.map(turn => {
    let b = board
    for (const move of turn) b = applyMove(b, move, player)

    // Count blots left after this turn
    let blots = 0
    for (let i = 1; i <= 24; i++) {
      if (b.points[i].player === player && b.points[i].count === 1) blots++
    }

    // Random base + small safe-play bonus
    return { turn, score: Math.random() - blots * 0.1 }
  })

  scored.sort((a, b) => b.score - a.score)

  // Pick randomly from top ~half to stay unpredictable
  const topCut = Math.max(1, Math.ceil(scored.length * 0.6))
  const pool = scored.slice(0, topCut)
  return pool[Math.floor(Math.random() * pool.length)].turn
}
