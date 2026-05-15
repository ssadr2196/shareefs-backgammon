import { allLegalTurns, applyMove, deduplicateTurns } from '../game/moves'
import { opponent, pipCount, allCheckersHome, homeRange } from '../game/board'
import type { AIContext } from './types'
import type { BoardState, Move, Player } from '../game/types'

/**
 * Count how many checkers of `player` are exposed as blots, weighted by
 * the probability of being hit from the opponent's position.
 * Hit probability approximation: opponent has up to 24 pip values to land on us.
 */
function blotExposure(board: BoardState, player: Player): number {
  const opp = opponent(player)
  let exposure = 0

  for (let target = 1; target <= 24; target++) {
    if (board.points[target].player !== player || board.points[target].count !== 1) continue

    // Count how many dice values allow opponent to hit this blot
    let hitters = 0
    for (let die = 1; die <= 6; die++) {
      const fromBlack = target + (opp === 'black' ? die : -die)

      // Direct hit
      if (fromBlack >= 1 && fromBlack <= 24) {
        const src = board.points[fromBlack]
        if (src.player === opp && src.count > 0) {
          hitters++
          continue
        }
      }

      // Combined hit (two dice summing to reach target)
      for (let die2 = 1; die2 <= 6; die2++) {
        if (die2 === die) continue
        const from2 = target + (opp === 'black' ? (die + die2) : -(die + die2))
        if (from2 >= 1 && from2 <= 24) {
          const src2 = board.points[from2]
          if (src2.player === opp && src2.count > 0) {
            hitters++
            break
          }
        }
      }
    }

    // Weight: blots in danger zones matter more
    const [oppHomeLo, oppHomeHi] = homeRange(opp)
    const inOppHome = target >= oppHomeLo && target <= oppHomeHi
    exposure += hitters * (inOppHome ? 3 : 1.5)
  }

  return exposure
}

/** Count consecutive points owned by player starting from a given point. */
function primeLength(board: BoardState, player: Player): number {
  let maxRun = 0
  let run = 0
  for (let i = 1; i <= 24; i++) {
    if (board.points[i].player === player && board.points[i].count >= 2) {
      run++
      maxRun = Math.max(maxRun, run)
    } else {
      run = 0
    }
  }
  return maxRun
}

/** Race vs. contact awareness: is the position a race or still contact? */
function isRace(board: BoardState): boolean {
  let whiteMax = 0
  let blackMin = 25
  for (let i = 1; i <= 24; i++) {
    if (board.points[i].player === 'white') whiteMax = Math.max(whiteMax, i)
    if (board.points[i].player === 'black') blackMin = Math.min(blackMin, i)
  }
  // White moves -1 (from high to low), black moves +1 (from low to high)
  // No contact if white's rearmost checker (highest point) is behind black's rearmost (lowest point)
  return whiteMax < blackMin
}

/**
 * Deep evaluation function for Hard AI.
 * Combines: pip differential, blot exposure, prime bonus, bearing off progress, race awareness.
 */
function scoreBoardHard(board: BoardState, player: Player, prevBoard: BoardState): number {
  let score = 0
  const opp = opponent(player)

  const myPip = pipCount(board, player)
  const oppPip = pipCount(board, opp)
  const pipDiff = oppPip - myPip

  const race = isRace(board)

  if (race) {
    // In a pure race, pip count is almost everything
    score += pipDiff * 5

    // Bearing off efficiency: reward having all checkers home
    if (allCheckersHome(board, player)) score += 30
    if (allCheckersHome(board, opp)) score -= 30

    // Borne off checkers
    const myOff = player === 'white' ? board.off.white : board.off.black
    const oppOff = opp === 'white' ? board.off.white : board.off.black
    score += (myOff - oppOff) * 25
  } else {
    // Contact game: balance offense and defense
    score += pipDiff * 2

    // Blot exposure — highly penalise leaving our checkers exposed
    score -= blotExposure(board, player) * 4
    // Reward when opponent is exposed
    score += blotExposure(board, opp) * 2

    // Prime bonus — consecutive owned points block opponent
    score += primeLength(board, player) * 12
    score -= primeLength(board, opp) * 10

    // Points made (2+ checkers)
    for (let i = 1; i <= 24; i++) {
      const p = board.points[i]
      if (p.player === player && p.count >= 2) {
        // Points in opponent's home board are especially valuable
        const [oppLo, oppHi] = homeRange(opp)
        score += (i >= oppLo && i <= oppHi) ? 12 : 6
      }
      if (p.player === opp && p.count >= 2) score -= 5
    }

    // Reward hitting opponent blots (opponent went to bar)
    const oppBarBefore = opp === 'white' ? prevBoard.bar.white : prevBoard.bar.black
    const oppBarAfter = opp === 'white' ? board.bar.white : board.bar.black
    score += (oppBarAfter - oppBarBefore) * 30

    // Penalise checkers on bar for us
    const myBar = player === 'white' ? board.bar.white : board.bar.black
    score -= myBar * 20

    // Anchor in opponent's home board: safe spot to re-enter from bar
    const [oppLo2, oppHi2] = homeRange(opp)
    for (let i = oppLo2; i <= oppHi2; i++) {
      if (board.points[i].player === player && board.points[i].count >= 2) score += 8
    }
  }

  return score
}

export function hardChooseTurn(ctx: AIContext): Move[] {
  const { board, player, remaining } = ctx
  const turns = deduplicateTurns(allLegalTurns(board, player, remaining))

  if (turns.length === 0 || (turns.length === 1 && turns[0].length === 0)) return []

  const nonEmpty = turns.filter(t => t.length > 0)
  if (nonEmpty.length === 0) return []

  const scored = nonEmpty.map(turn => {
    let b = board
    for (const move of turn) b = applyMove(b, move, player)
    return { turn, score: scoreBoardHard(b, player, board) }
  })

  scored.sort((a, b) => b.score - a.score)

  // Hard AI always picks the top-scored move (deterministic)
  return scored[0].turn
}
