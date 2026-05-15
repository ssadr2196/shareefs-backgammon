import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createInitialBoard } from '../game/board'
import { rollDice, createUnrolledDice } from '../game/dice'
import { applyMove, allLegalTurns, selectableSources, validDestinations, deduplicateTurns } from '../game/moves'
import { checkWin } from '../game/win'
import { chooseAITurn } from '../ai'
import type { GameState, Move, Player, DieValue, Difficulty, PlayerProfile, WinType } from '../game/types'

export type Screen = 'lobby' | 'game' | 'end'

interface GameStore {
  // Navigation
  screen: Screen

  // Game state
  gameState: GameState | null
  difficulty: Difficulty
  selectedPoint: number | null
  validDests: number[]
  selectablePts: number[]

  // Undo
  undoStack: GameState[]

  // Profile
  profile: PlayerProfile | null

  // Flags
  aiThinking: boolean
  animating: boolean

  // Actions
  setScreen: (s: Screen) => void
  setDifficulty: (d: Difficulty) => void
  startGame: () => void
  rollDiceAction: () => void
  selectPoint: (point: number) => void
  moveTo: (dest: number) => void
  undoMove: () => void
  resign: () => void
  newGame: () => void
  setProfile: (p: PlayerProfile) => void
  clearProfile: () => void
  setAnimating: (v: boolean) => void
}

function freshGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    dice: createUnrolledDice(),
    phase: 'rolling',
    winner: null,
    winType: null,
    moveHistory: [],
    turnNumber: 1,
  }
}

function computeSelectable(gs: GameState): number[] {
  if (gs.phase !== 'moving') return []
  return selectableSources(gs.board, gs.currentPlayer, gs.dice.remaining)
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: 'lobby',
      gameState: null,
      difficulty: 'medium',
      selectedPoint: null,
      validDests: [],
      selectablePts: [],
      undoStack: [],
      profile: null,
      aiThinking: false,
      animating: false,

      setScreen: (screen) => set({ screen }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setAnimating: (animating) => set({ animating }),

      startGame: () => {
        const gs = freshGameState()
        set({
          gameState: gs,
          screen: 'game',
          selectedPoint: null,
          validDests: [],
          selectablePts: [],
          undoStack: [],
          aiThinking: false,
        })
      },

      rollDiceAction: () => {
        const { gameState } = get()
        if (!gameState || gameState.phase !== 'rolling') return

        const dice = rollDice()
        const gs: GameState = {
          ...gameState,
          dice,
          phase: 'moving',
        }

        const selectable = computeSelectable(gs)

        // Check if no legal moves available (pass turn)
        const turns = allLegalTurns(gs.board, gs.currentPlayer, dice.remaining)
        const hasMoves = turns.some(t => t.length > 0)

        if (!hasMoves) {
          // Pass turn
          const next = nextTurn(gs)
          set({ gameState: next, selectablePts: computeSelectable(next), selectedPoint: null, validDests: [] })

          if (next.currentPlayer === 'black') {
            scheduleAI(get, set)
          }
          return
        }

        set({ gameState: gs, selectablePts: selectable, selectedPoint: null, validDests: [] })

        // If black's turn, trigger AI
        if (gs.currentPlayer === 'black') {
          scheduleAI(get, set)
        }
      },

      selectPoint: (point) => {
        const { gameState, selectablePts } = get()
        if (!gameState || gameState.phase !== 'moving') return
        if (!selectablePts.includes(point)) return

        const dests = validDestinations(
          gameState.board,
          gameState.currentPlayer,
          point,
          gameState.dice.remaining
        )
        set({ selectedPoint: point, validDests: dests })
      },

      moveTo: (dest) => {
        const { gameState, selectedPoint, undoStack } = get()
        if (!gameState || selectedPoint === null) return
        if (gameState.currentPlayer !== 'white') return // human is always white

        const turns = deduplicateTurns(
          allLegalTurns(gameState.board, gameState.currentPlayer, gameState.dice.remaining)
        )

        // Find a turn that starts with selectedPoint → dest
        const matchingTurn = turns.find(
          t => t.length > 0 && t[0].from === selectedPoint && t[0].to === dest
        )
        if (!matchingTurn) return

        // Apply just the first move of this turn
        const move = matchingTurn[0]
        const newBoard = applyMove(gameState.board, move, gameState.currentPlayer)
        const dieUsed = move.dieUsed
        const newRemaining = removeFirstDie(gameState.dice.remaining, dieUsed)

        const newGs: GameState = {
          ...gameState,
          board: newBoard,
          dice: { ...gameState.dice, remaining: newRemaining },
          moveHistory: appendCurrentTurnMove(gameState.moveHistory, move),
        }

        // Check win
        const winType = checkWin(newBoard, gameState.currentPlayer)
        if (winType) {
          const finished: GameState = { ...newGs, phase: 'game-over', winner: gameState.currentPlayer, winType }
          set({ gameState: finished, selectedPoint: null, validDests: [], selectablePts: [] })
          get().setScreen('end')
          updateStats(get, 'white', winType)
          return
        }

        // Check if dice exhausted or no more legal moves
        const remainingTurns = allLegalTurns(newBoard, gameState.currentPlayer, newRemaining)
        const hasMore = newRemaining.length > 0 && remainingTurns.some(t => t.length > 0)

        if (!hasMore) {
          const next = nextTurn(newGs)
          set({
            gameState: next,
            undoStack: [...undoStack, gameState],
            selectedPoint: null,
            validDests: [],
            selectablePts: computeSelectable(next),
          })
          if (next.currentPlayer === 'black') {
            scheduleAI(get, set)
          }
          return
        }

        const selectable = selectableSources(newBoard, gameState.currentPlayer, newRemaining)
        set({
          gameState: newGs,
          undoStack: [...undoStack, gameState],
          selectedPoint: null,
          validDests: [],
          selectablePts: selectable,
        })
      },

      undoMove: () => {
        const { undoStack } = get()
        if (undoStack.length === 0) return
        const prev = undoStack[undoStack.length - 1]
        set({
          gameState: prev,
          undoStack: undoStack.slice(0, -1),
          selectedPoint: null,
          validDests: [],
          selectablePts: computeSelectable(prev),
          aiThinking: false,
        })
      },

      resign: () => {
        const { gameState } = get()
        if (!gameState) return
        const winner: Player = gameState.currentPlayer === 'white' ? 'black' : 'white'
        const finished: GameState = { ...gameState, phase: 'game-over', winner, winType: 'normal' }
        set({ gameState: finished, selectedPoint: null, validDests: [], selectablePts: [] })
        get().setScreen('end')
        updateStats(get, 'black', 'normal')
      },

      newGame: () => {
        get().startGame()
      },

      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'shareefs-backgammon',
      partialize: (state) => ({ profile: state.profile, difficulty: state.difficulty }),
    }
  )
)

// --- Helpers ---

function nextTurn(gs: GameState): GameState {
  const next: Player = gs.currentPlayer === 'white' ? 'black' : 'white'
  return {
    ...gs,
    currentPlayer: next,
    dice: createUnrolledDice(),
    phase: 'rolling',
    moveHistory: [...gs.moveHistory, []],
    turnNumber: gs.turnNumber + 1,
  }
}

function removeFirstDie(remaining: DieValue[], die: DieValue): DieValue[] {
  const idx = remaining.indexOf(die)
  if (idx === -1) return remaining
  return [...remaining.slice(0, idx), ...remaining.slice(idx + 1)]
}

function appendCurrentTurnMove(history: Move[][], move: Move): Move[][] {
  if (history.length === 0) return [[move]]
  const last = history[history.length - 1]
  return [...history.slice(0, -1), [...last, move]]
}

function updateStats(
  get: () => GameStore,
  winner: Player,
  _winType: WinType
) {
  const { profile } = get()
  if (!profile) return
  const humanWon = winner === 'white'
  get().setProfile({
    ...profile,
    gamesPlayed: profile.gamesPlayed + 1,
    wins: humanWon ? profile.wins + 1 : profile.wins,
    losses: humanWon ? profile.losses : profile.losses + 1,
  })
}

function scheduleAI(get: () => GameStore, set: (p: Partial<GameStore>) => void) {
  set({ aiThinking: true })

  // Small delay so dice animation can play before AI moves
  setTimeout(() => {
    const state = get()
    if (!state.gameState || state.gameState.currentPlayer !== 'black') {
      set({ aiThinking: false })
      return
    }

    const gs = state.gameState

    // Roll dice for AI if needed
    let currentGs = gs
    if (gs.phase === 'rolling') {
      const dice = rollDice()
      currentGs = { ...gs, dice, phase: 'moving' }
    }

    const turns = allLegalTurns(currentGs.board, 'black', currentGs.dice.remaining)
    const hasMoves = turns.some(t => t.length > 0)

    if (!hasMoves) {
      const next = nextTurn(currentGs)
      set({
        gameState: next,
        selectablePts: computeSelectable(next),
        selectedPoint: null,
        validDests: [],
        aiThinking: false,
      })
      return
    }

    const chosen = chooseAITurn(
      { board: currentGs.board, player: 'black', remaining: currentGs.dice.remaining },
      state.difficulty
    )

    // Apply all moves in the chosen turn
    let board = currentGs.board
    let remaining = currentGs.dice.remaining
    const history = appendCurrentTurnMove(currentGs.moveHistory, chosen[0])

    for (const move of chosen) {
      board = applyMove(board, move, 'black')
      remaining = removeFirstDie(remaining, move.dieUsed)
    }

    const newGs: GameState = {
      ...currentGs,
      board,
      dice: { ...currentGs.dice, remaining },
      moveHistory: history,
    }

    // Check if AI won
    const winType = checkWin(board, 'black')
    if (winType) {
      const finished: GameState = { ...newGs, phase: 'game-over', winner: 'black', winType }
      set({ gameState: finished, selectedPoint: null, validDests: [], selectablePts: [], aiThinking: false })
      get().setScreen('end')
      updateStats(get, 'black', winType)
      return
    }

    const next = nextTurn(newGs)
    set({
      gameState: next,
      selectablePts: computeSelectable(next),
      selectedPoint: null,
      validDests: [],
      aiThinking: false,
    })
  }, 900)
}
