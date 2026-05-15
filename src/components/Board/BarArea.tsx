import { motion } from 'framer-motion'
import { CheckerPiece } from './CheckerPiece'
import type { Player } from '../../game/types'

interface BarAreaProps {
  whiteCount: number
  blackCount: number
  currentPlayer?: Player
  isSelectable: boolean
  isSelected: boolean
  onSelect: () => void
}

export function BarArea({ whiteCount, blackCount, isSelectable, isSelected, onSelect }: BarAreaProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-1"
      style={{
        minWidth: 44,
        background: 'linear-gradient(180deg, #4a2e18 0%, #3a2010 100%)',
        borderLeft: '2px solid #6b4226',
        borderRight: '2px solid #6b4226',
        position: 'relative',
      }}
      aria-label="Bar"
    >
      <span className="text-[8px] text-brand-gold/50 uppercase tracking-widest absolute top-1">Bar</span>

      {/* Black checkers on bar (top half) */}
      <div className="flex flex-col gap-1 items-center pt-4">
        {Array.from({ length: blackCount }).map((_, i) => (
          <CheckerPiece key={i} player="black" size={28} />
        ))}
      </div>

      {/* White checkers on bar (bottom half) */}
      <div
        className="flex flex-col gap-1 items-center pb-4 cursor-pointer"
        onClick={isSelectable || isSelected ? onSelect : undefined}
        role={isSelectable || isSelected ? 'button' : undefined}
        aria-label={whiteCount > 0 ? `${whiteCount} white on bar — click to select` : undefined}
      >
        {Array.from({ length: whiteCount }).map((_, i) => (
          <CheckerPiece
            key={i}
            player="white"
            size={28}
            selected={isSelected}
          />
        ))}
      </div>

      {isSelectable && (
        <motion.div
          className="absolute inset-0"
          style={{ border: '2px solid rgba(201,169,110,0.7)', pointerEvents: 'none' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </div>
  )
}
