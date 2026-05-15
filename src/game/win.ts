import type { BoardState, Player, WinType } from './types'
import { opponent } from './board'

/** Check if a player has won. Returns win type or null. */
export function checkWin(board: BoardState, player: Player): WinType | null {
  const off = player === 'white' ? board.off.white : board.off.black
  if (off < 15) return null

  const opp = opponent(player)
  const oppOff = opp === 'white' ? board.off.white : board.off.black

  // Gammon: opponent has borne off no checkers
  if (oppOff === 0) {
    // Backgammon: opponent also has a checker on bar or in winner's home board
    const oppOnBar = opp === 'white' ? board.bar.white : board.bar.black
    if (oppOnBar > 0) return 'backgammon'

    // Winner's home board: white home = 1-6, black home = 19-24
    const [lo, hi] = player === 'white' ? [1, 6] : [19, 24]
    for (let i = lo; i <= hi; i++) {
      if (board.points[i].player === opp && board.points[i].count > 0) {
        return 'backgammon'
      }
    }

    return 'gammon'
  }

  return 'normal'
}

export function winPoints(winType: WinType): number {
  switch (winType) {
    case 'normal': return 1
    case 'gammon': return 2
    case 'backgammon': return 3
  }
}
