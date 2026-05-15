import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { WinType } from '../../game/types'

const WIN_LABELS: Record<WinType, { label: string; desc: string; points: number }> = {
  normal:      { label: 'Win',         desc: 'Well played!',                            points: 1 },
  gammon:      { label: 'Gammon!',     desc: 'Opponent has no checkers borne off.',      points: 2 },
  backgammon:  { label: 'Backgammon!', desc: 'Maximum victory — 3 points.',             points: 3 },
}

export function EndGame() {
  const { gameState, profile, newGame, setScreen } = useGameStore()
  if (!gameState?.winner || !gameState?.winType) return null

  const humanWon = gameState.winner === 'white'
  const winData = WIN_LABELS[gameState.winType]

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #0e0805 60%, #1a0e06 100%)' }}>

      <motion.div
        className="w-full max-w-sm text-center space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Result badge */}
        <motion.div
          initial={{ rotate: -5 }}
          animate={{ rotate: [-5, 3, -2, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex flex-col items-center px-10 py-6 rounded-2xl"
            style={{
              background: humanWon
                ? 'linear-gradient(135deg, #8B1A1A, #6B1010)'
                : 'linear-gradient(135deg, #2c1a0e, #1a0e06)',
              border: `2px solid ${humanWon ? '#C9A96E' : '#6b4226'}`,
            }}
          >
            <span className="text-4xl mb-2">{humanWon ? '🏆' : '🎲'}</span>
            <h1
              className="text-brand-cream font-bold mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 8vw, 2.5rem)' }}
            >
              {humanWon ? 'You Win!' : 'AI Wins'}
            </h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{
                background: 'rgba(201,169,110,0.2)',
                color: '#C9A96E',
                border: '1px solid rgba(201,169,110,0.4)',
              }}
            >
              {winData.label}
            </span>
            <p className="text-brand-cream/50 text-sm mt-2">{winData.desc}</p>
            <p className="text-brand-gold/60 text-xs mt-1">{winData.points} point{winData.points > 1 ? 's' : ''}</p>
          </div>
        </motion.div>

        {/* Stats update */}
        {profile && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.15)' }}>
            <p className="text-brand-gold/50 text-xs uppercase tracking-wider mb-2">Your record</p>
            <div className="flex justify-around">
              <div>
                <p className="text-brand-cream text-xl font-bold">{profile.wins}</p>
                <p className="text-brand-cream/40 text-[10px]">Wins</p>
              </div>
              <div>
                <p className="text-brand-cream text-xl font-bold">{profile.losses}</p>
                <p className="text-brand-cream/40 text-[10px]">Losses</p>
              </div>
              <div>
                <p className="text-brand-cream text-xl font-bold">{profile.gamesPlayed}</p>
                <p className="text-brand-cream/40 text-[10px]">Played</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <motion.button
            onClick={newGame}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-brand-cream text-base tracking-wide shadow-lg"
            style={{ background: 'linear-gradient(135deg, #A52020, #8B1A1A)', border: '1px solid rgba(201,169,110,0.3)' }}
          >
            Play Again
          </motion.button>
          <button
            onClick={() => setScreen('lobby')}
            className="w-full py-3 rounded-2xl font-semibold text-brand-cream/60 text-sm
                       border border-brand-wood/30 hover:border-brand-wood/60 transition-colors"
          >
            Back to Lobby
          </button>
        </div>

        <p className="text-brand-cream/20 text-xs">
          Order another shawarma while you wait? 🌯
        </p>
      </motion.div>
    </div>
  )
}
