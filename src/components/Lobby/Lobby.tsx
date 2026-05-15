import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { ArabesquePattern } from '../common/ArabesquePattern'
import { HowToPlay } from '../HowToPlay/HowToPlay'
import { ProfileModal } from './ProfileModal'
import type { Difficulty } from '../../game/types'

const DIFFICULTIES: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'easy',   label: 'Easy',   desc: 'Casual' },
  { key: 'medium', label: 'Medium', desc: 'Challenge' },
  { key: 'hard',   label: 'Hard',   desc: 'Expert' },
]

export function Lobby() {
  const { difficulty, setDifficulty, startGame, profile } = useGameStore()
  const [showHowTo, setShowHowTo] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div className="min-h-svh flex flex-col items-center justify-between py-8 px-4"
         style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #0e0805 60%, #1a0e06 100%)' }}>

      {/* Top link back */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <a
          href="https://shareefs.com.au"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-gold/50 hover:text-brand-gold text-xs transition-colors flex items-center gap-1"
        >
          ← shareefs.com.au
        </a>
        <button
          onClick={() => setShowProfile(true)}
          className="text-brand-gold/50 hover:text-brand-gold text-xs transition-colors"
        >
          {profile ? `👤 ${profile.username}` : '+ Profile'}
        </button>
      </div>

      {/* Hero section */}
      <motion.div
        className="flex flex-col items-center text-center space-y-4 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative top pattern */}
        <ArabesquePattern className="w-64 opacity-60" />

        {/* Restaurant name */}
        <div>
          <p className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-1">The Shawarma Social Club</p>
          <h1
            className="text-brand-cream leading-none"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 10vw, 4rem)', fontWeight: 700 }}
          >
            Shareefs
          </h1>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-brand-gold/20" />
          <span className="text-brand-gold text-lg">♦</span>
          <div className="flex-1 h-px bg-brand-gold/20" />
        </div>

        {/* Game title */}
        <div>
          <h2
            className="text-brand-gold tracking-widest uppercase text-sm mb-0.5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Backgammon
          </h2>
          <p className="text-brand-cream/40 text-xs">Play while you wait</p>
        </div>

        {/* Stats card */}
        {profile && (
          <motion.div
            className="w-full rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-brand-gold/60 text-xs mb-2">
              Welcome back, <span className="text-brand-gold">{profile.username}</span>
            </p>
            <div className="flex justify-around">
              <div>
                <p className="text-brand-cream text-lg font-bold">{profile.wins}</p>
                <p className="text-brand-cream/40 text-[10px]">Wins</p>
              </div>
              <div>
                <p className="text-brand-cream text-lg font-bold">{profile.losses}</p>
                <p className="text-brand-cream/40 text-[10px]">Losses</p>
              </div>
              <div>
                <p className="text-brand-cream text-lg font-bold">{profile.gamesPlayed}</p>
                <p className="text-brand-cream/40 text-[10px]">Played</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Difficulty selector */}
        <div className="w-full">
          <p className="text-brand-cream/40 text-[11px] uppercase tracking-wider mb-2">Difficulty</p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  difficulty === d.key
                    ? 'bg-brand-red text-brand-cream shadow-lg shadow-brand-red/30'
                    : 'text-brand-cream/50 hover:text-brand-cream/80 border border-brand-wood/30 hover:border-brand-wood/60'
                }`}
              >
                <span className="block">{d.label}</span>
                <span className="block text-[9px] font-normal opacity-70 mt-0.5">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <motion.button
          onClick={startGame}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-4 rounded-2xl font-bold text-brand-cream text-lg tracking-wide
                     shadow-xl shadow-brand-red/30 transition-colors"
          style={{
            background: 'linear-gradient(135deg, #A52020 0%, #8B1A1A 50%, #6B1010 100%)',
            border: '1px solid rgba(201,169,110,0.3)',
          }}
        >
          Play Now
        </motion.button>

        {/* How to play */}
        <button
          onClick={() => setShowHowTo(true)}
          className="text-brand-gold/50 hover:text-brand-gold text-sm transition-colors"
        >
          How to play ↗
        </button>

        {/* Decorative bottom */}
        <ArabesquePattern className="w-64 opacity-40" />
      </motion.div>

      {/* Footer */}
      <p className="text-brand-cream/20 text-[10px] text-center">
        Shareefs Lebanese Kitchen · Sydney
      </p>

      <HowToPlay open={showHowTo} onClose={() => setShowHowTo(false)} />
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}
