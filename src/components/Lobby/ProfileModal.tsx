import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { PlayerProfile } from '../../game/types'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile, setProfile, clearProfile } = useGameStore()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [error, setError] = useState('')

  const handleSave = () => {
    const name = username.trim()
    if (!name) { setError('Enter a username'); return }
    if (name.length > 24) { setError('Max 24 characters'); return }
    const p: PlayerProfile = profile
      ? { ...profile, username: name }
      : { username: name, wins: 0, losses: 0, gamesPlayed: 0, createdAt: Date.now() }
    setProfile(p)
    onClose()
  }

  const handleDelete = () => {
    clearProfile()
    setUsername('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#1a0e06', border: '2px solid #6b4226' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="font-display text-xl text-brand-cream">
              {profile ? 'Edit Profile' : 'Create Profile'}
            </h2>
            <p className="text-brand-cream/50 text-sm">
              Your stats are saved locally on this device.
            </p>

            <div>
              <label className="text-brand-gold/80 text-xs uppercase tracking-wider block mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                maxLength={24}
                className="w-full rounded-lg px-4 py-2.5 text-brand-cream text-sm outline-none
                           border border-brand-wood focus:border-brand-gold transition-colors"
                style={{ background: '#2c1a0e' }}
                placeholder="e.g. Habib"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              {error && <p className="text-brand-red text-xs mt-1">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-brand-cream
                           bg-brand-red hover:bg-brand-red-dark transition-colors"
              >
                Save
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-brand-cream/60
                           border border-brand-wood hover:border-brand-gold transition-colors"
              >
                Cancel
              </button>
            </div>

            {profile && (
              <button
                onClick={handleDelete}
                className="w-full py-2 rounded-lg text-xs text-brand-cream/30 hover:text-brand-cream/60 transition-colors"
              >
                Delete profile & stats
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
