import type { BoardState, Move, Player, DieValue } from './types'
import { isBlocked, isBlot, allCheckersHome, homeRange, cloneBoard, opponent } from './board'

/**
 * Convention:
 *  White starts at 24,13,8,6 and moves TOWARD 1 (direction -1).
 *  White home board = 1-6. Bear off when checker would go below 1.
 *  White enters from bar on points 25-die (range 19-24 = black's home).
 *
 *  Black starts at 1,12,17,19 and moves TOWARD 24 (direction +1).
 *  Black home board = 19-24. Bear off when checker would go above 24.
 *  Black enters from bar on points die (range 1-6 = white's home).
 */
function direction(player: Player): 1 | -1 {
  return player === 'white' ? -1 : 1
}

/**
 * Generate all single-die moves for a player for one die value.
 * Handles: bar entry, normal moves, hitting blots, bearing off with overshoot.
 */
export function movesForDie(board: BoardState, player: Player, die: DieValue): Move[] {
  const moves: Move[] = []
  const onBar = player === 'white' ? board.bar.white : board.bar.black

  if (onBar > 0) {
    // Must enter from bar before any other move
    const entryPoint = player === 'white' ? (25 - die) : die
    if (entryPoint >= 1 && entryPoint <= 24 && !isBlocked(board, entryPoint, player)) {
      moves.push({
        from: 0,
        to: entryPoint,
        dieUsed: die,
        hit: isBlot(board, entryPoint, player),
      })
    }
    return moves
  }

  const canBear = allCheckersHome(board, player)
  const [homeLo, homeHi] = homeRange(player) // white: [1,6], black: [19,24]

  for (let i = 1; i <= 24; i++) {
    const p = board.points[i]
    if (p.player !== player || p.count === 0) continue

    const dest = i + direction(player) * die

    if (player === 'white') {
      if (dest < 1) {
        // Would bear off (go below point 1)
        if (!canBear) continue
        if (dest === 0) {
          // Exact bear-off (die === i)
          moves.push({ from: i, to: 25, dieUsed: die, hit: false })
        } else {
          // Overshoot — only allowed if no white checker on a higher-numbered home point
          let higherExists = false
          for (let j = i + 1; j <= homeHi; j++) {
            if (board.points[j].player === 'white' && board.points[j].count > 0) {
              higherExists = true
              break
            }
          }
          if (!higherExists) {
            moves.push({ from: i, to: 25, dieUsed: die, hit: false })
          }
        }
        continue
      }
    } else {
      // Black moves +1, bears off past 24
      if (dest > 24) {
        if (!canBear) continue
        if (dest === 25) {
          // Exact bear-off (die === 25-i)
          moves.push({ from: i, to: 25, dieUsed: die, hit: false })
        } else {
          // Overshoot — only allowed if no black checker on a lower-numbered home point
          let lowerExists = false
          for (let j = i - 1; j >= homeLo; j--) {
            if (board.points[j].player === 'black' && board.points[j].count > 0) {
              lowerExists = true
              break
            }
          }
          if (!lowerExists) {
            moves.push({ from: i, to: 25, dieUsed: die, hit: false })
          }
        }
        continue
      }
    }

    // Normal board move (dest in 1-24)
    if (dest < 1 || dest > 24) continue
    if (isBlocked(board, dest, player)) continue

    moves.push({
      from: i,
      to: dest,
      dieUsed: die,
      hit: isBlot(board, dest, player),
    })
  }

  return moves
}

/** Apply a single move to a board (returns new board, immutable). */
export function applyMove(board: BoardState, move: Move, player: Player): BoardState {
  const b = cloneBoard(board)
  const opp = opponent(player)

  // Remove checker from source
  if (move.from === 0) {
    if (player === 'white') b.bar.white--
    else b.bar.black--
  } else {
    b.points[move.from].count--
    if (b.points[move.from].count === 0) b.points[move.from].player = null
  }

  // Hit — send opponent's blot to bar
  if (move.hit && move.to !== 25) {
    b.points[move.to].count = 0
    b.points[move.to].player = null
    if (opp === 'white') b.bar.white++
    else b.bar.black++
  }

  // Place checker at destination
  if (move.to === 25) {
    if (player === 'white') b.off.white++
    else b.off.black++
  } else {
    if (b.points[move.to].player === null) b.points[move.to].player = player
    b.points[move.to].count++
  }

  return b
}

/** Get unique die values from remaining list. */
function uniqueDice(remaining: DieValue[]): DieValue[] {
  return [...new Set(remaining)]
}

/**
 * Generate all legal complete move sequences for a player's turn.
 * Enforces: must use as many dice as possible; if only one die can be played,
 * must play the higher die.
 */
export function allLegalTurns(
  board: BoardState,
  player: Player,
  remaining: DieValue[],
): Move[][] {
  if (remaining.length === 0) return [[]]

  const results: Move[][] = []
  const tried = new Set<string>()

  for (const die of uniqueDice(remaining)) {
    const singleMoves = movesForDie(board, player, die)
    for (const move of singleMoves) {
      const key = `${move.from}-${move.to}-${die}`
      if (tried.has(key)) continue
      tried.add(key)

      const newBoard = applyMove(board, move, player)
      const newRemaining = removeFirst(remaining, die)
      const rest = allLegalTurns(newBoard, player, newRemaining)

      for (const tail of rest) {
        results.push([move, ...tail])
      }
    }
  }

  if (results.length === 0) return [[]] // no moves possible

  // Enforce: must use maximum number of dice
  const maxLen = Math.max(...results.map(r => r.length))
  const maxMoves = results.filter(r => r.length === maxLen)

  // If only one die can be played (maxLen===1) and multiple dice available,
  // must play the higher die value
  if (maxLen === 1 && remaining.length >= 2) {
    const maxDie = Math.max(...maxMoves.map(r => r[0].dieUsed)) as DieValue
    return maxMoves.filter(r => r[0].dieUsed === maxDie)
  }

  return maxMoves
}

/** Remove first occurrence of value from array. */
function removeFirst(arr: DieValue[], val: DieValue): DieValue[] {
  const idx = arr.indexOf(val)
  if (idx === -1) return arr
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)]
}

/** Deduplicate move sequences by logical from→to sequence. */
export function deduplicateTurns(turns: Move[][]): Move[][] {
  const seen = new Set<string>()
  return turns.filter(turn => {
    const key = turn.map(m => `${m.from}>${m.to}`).join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Get unique valid destinations from all legal turns for a given source point. */
export function validDestinations(
  board: BoardState,
  player: Player,
  from: number,
  remaining: DieValue[]
): number[] {
  const turns = allLegalTurns(board, player, remaining)
  const dests = new Set<number>()
  for (const turn of turns) {
    if (turn.length > 0 && turn[0].from === from) {
      dests.add(turn[0].to)
    }
  }
  return [...dests]
}

/** Get all selectable source points for the current player. */
export function selectableSources(
  board: BoardState,
  player: Player,
  remaining: DieValue[]
): number[] {
  const turns = allLegalTurns(board, player, remaining)
  const sources = new Set<number>()
  for (const turn of turns) {
    if (turn.length > 0) sources.add(turn[0].from)
  }
  return [...sources]
}
