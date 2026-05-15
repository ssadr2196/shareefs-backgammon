import { motion, AnimatePresence } from 'framer-motion'
import { Die } from './Die'
import { useGameStore } from '../../store/gameStore'
import { useHaptic } from '../../hooks/useHaptic'
import type { DieValue } from '../../game/types'
import { useState, useEffect } from 'react'

interface DiceAreaProps {
  onRoll?: () => void
  soundEnabled: boolean
  onPlaySound: (t: 'dice' | 'place' | 'hit' | 'win') => void
}

export function DiceArea({ onRoll, onPlaySound }: DiceAreaProps) {
  const { gameState, rollDiceAction, aiThinking } = useGameStore()
  const haptic = useHaptic()
  const [rolling, setRolling] = useState(false)

  const dice = gameState?.dice
  const phase = gameState?.phase
  const currentPlayer = gameState?.currentPlayer
  const canRoll = phase === 'rolling' && currentPlayer === 'white' && !aiThinking

  // Reset rolling state after animation
  useEffect(() => {
    if (rolling) {
      const t = setTimeout(() => setRolling(false), 550)
      return () => clearTimeout(t)
    }
  }, [rolling])

  const handleRoll = () => {
    if (!canRoll) return
    setRolling(true)
    haptic('roll')
    onPlaySound('dice')
    rollDiceAction()
    onRoll?.()
  }

  if (!dice) return null

  // Which dice have been used (remaining vs total)
  const allDice: DieValue[] = dice.rolled
    ? (dice.values[0] === dice.values[1]
        ? [dice.values[0], dice.values[0], dice.values[0], dice.values[0]]
        : [dice.values[0], dice.values[1]])
    : []

  // Mark spent: count remaining vs all
  const remaining = [...dice.remaining]
  const spentFlags = allDice.map((d) => {
    const idx = remaining.indexOf(d)
    if (idx !== -1) {
      remaining.splice(idx, 1)
      return false // still available
    }
    return true // spent
  })

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Dice display — fixed height container prevents layout shift */}
      <div className="flex items-center justify-center gap-3 h-16">
        <AnimatePresence mode="wait">
          {dice.rolled ? (
            <motion.div
              key="dice"
              className="flex gap-3"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {allDice.map((val, i) => (
                <Die
                  key={i}
                  value={val}
                  spent={spentFlags[i]}
                  rolling={rolling && !spentFlags[i]}
                  size={52}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="w-[52px] h-[52px] rounded-xl border-2 border-dashed border-brand-gold/30"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Roll button */}
      {canRoll && (
        <motion.button
          onClick={handleRoll}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-full font-semibold text-brand-cream tracking-wide
                     bg-brand-red hover:bg-brand-red-dark active:bg-brand-red-dark
                     shadow-lg shadow-black/40 transition-colors text-sm uppercase"
        >
          Roll Dice
        </motion.button>
      )}

      {/* AI thinking indicator */}
      {aiThinking && (
        <motion.div
          className="flex items-center gap-2 text-brand-gold/70 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="inline-flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-gold"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </span>
          Opponent thinking…
        </motion.div>
      )}
    </div>
  )
}
