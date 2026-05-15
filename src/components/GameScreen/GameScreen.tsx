import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Board } from '../Board/Board'
import { DiceArea } from '../Dice/DiceArea'
import { HowToPlay } from '../HowToPlay/HowToPlay'
import { useGameStore } from '../../store/gameStore'
import { useSound } from '../../hooks/useSound'

export function GameScreen() {
  const { gameState, undoStack, undoMove, resign, setScreen, difficulty } = useGameStore()
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showHowTo, setShowHowTo] = useState(false)
  const [confirmResign, setConfirmResign] = useState(false)
  const playSound = useSound(soundEnabled)

  // Measure the board section height so Board can scale checkers to fill it
  const boardSectionRef = useRef<HTMLDivElement>(null)
  const [boardSectionH, setBoardSectionH] = useState(400)
  useEffect(() => {
    const el = boardSectionRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => setBoardSectionH(Math.floor(entry.contentRect.height)))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!gameState) return null

  const { currentPlayer, phase, turnNumber } = gameState
  const isHumanTurn = currentPlayer === 'white'

  const handleResign = () => {
    if (confirmResign) {
      resign()
      setConfirmResign(false)
    } else {
      setConfirmResign(true)
      setTimeout(() => setConfirmResign(false), 3000)
    }
  }

  const diffLabel = difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'

  return (
    <div
      className="h-svh overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #0e0805 60%, #1a0e06 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a1a0a' }}>
        <button
          onClick={() => setScreen('lobby')}
          className="text-brand-gold/50 hover:text-brand-gold text-xs transition-colors"
          aria-label="Back to lobby"
        >
          ← Lobby
        </button>

        {/* Turn indicator */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-brand-gold/40"
              style={{
                background: currentPlayer === 'white'
                  ? 'radial-gradient(circle, #f5e6d3, #d4b896)'
                  : 'radial-gradient(circle, #5a3a20, #1a0e06)',
              }}
            />
            <span className="text-brand-cream/80 text-xs font-medium">
              {isHumanTurn ? 'Your turn' : `AI (${diffLabel})`}
            </span>
          </div>
          <span className="text-brand-cream/30 text-[9px]">Turn {turnNumber}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(v => !v)}
            className="text-brand-gold/40 hover:text-brand-gold text-sm transition-colors"
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setShowHowTo(true)}
            className="text-brand-gold/40 hover:text-brand-gold text-xs transition-colors"
          >
            ?
          </button>
        </div>
      </div>

      {/* Phase banner */}
      <motion.div
        key={`${currentPlayer}-${phase}`}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-1.5"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <p className="text-brand-gold/60 text-[11px] uppercase tracking-widest">
          {phase === 'rolling' && isHumanTurn && 'Roll your dice'}
          {phase === 'moving' && isHumanTurn && 'Select a checker to move'}
          {!isHumanTurn && "Opponent's turn"}
        </p>
      </motion.div>

      {/* Board */}
      <div ref={boardSectionRef} className="flex-1 min-h-0 flex flex-col items-center justify-center px-2 py-1 overflow-hidden">
        <Board onPlaySound={playSound} availableHeight={boardSectionH} />
      </div>

      {/* Dice area */}
      <div style={{ borderTop: '1px solid #2a1a0a', background: 'rgba(0,0,0,0.3)' }}>
        <DiceArea
          soundEnabled={soundEnabled}
          onPlaySound={playSound}
        />
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between px-4 py-3 gap-3" style={{ borderTop: '1px solid #2a1a0a' }}>
        <button
          onClick={undoMove}
          disabled={undoStack.length === 0}
          className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all
                     border border-brand-wood/30 text-brand-cream/50
                     disabled:opacity-30 hover:enabled:border-brand-gold/50 hover:enabled:text-brand-cream/80"
        >
          ↩ Undo
        </button>
        <button
          onClick={handleResign}
          className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${
            confirmResign
              ? 'border-brand-red text-brand-red'
              : 'border-brand-wood/30 text-brand-cream/50 hover:border-brand-red/50 hover:text-brand-cream/80'
          }`}
        >
          {confirmResign ? 'Confirm resign?' : 'Resign'}
        </button>
      </div>

      <HowToPlay open={showHowTo} onClose={() => setShowHowTo(false)} />
    </div>
  )
}
