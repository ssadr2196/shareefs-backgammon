import { motion } from 'framer-motion'
import { CheckerPiece } from './CheckerPiece'

interface BarAreaProps {
  whiteCount: number
  blackCount: number
  barWidth: number     // computed from board width
  checkerSize: number  // computed from board width
  isSelectable: boolean
  isSelected: boolean
  onSelect: () => void
}

export function BarArea({ whiteCount, blackCount, barWidth, checkerSize, isSelectable, isSelected, onSelect }: BarAreaProps) {
  const barCheckerSize = Math.max(12, Math.min(checkerSize - 4, 28))

  return (
    <div
      className="flex flex-col items-center justify-center flex-shrink-0"
      style={{
        width: barWidth,
        background: 'linear-gradient(180deg, #4a2e18 0%, #3a2010 100%)',
        borderLeft: '2px solid #6b4226',
        borderRight: '2px solid #6b4226',
        position: 'relative',
        alignSelf: 'stretch',
      }}
      aria-label="Bar"
    >
      <span
        className="text-brand-gold/50 uppercase tracking-widest absolute"
        style={{ fontSize: Math.max(6, barWidth * 0.18), top: 4, left: 0, right: 0, textAlign: 'center' }}
      >
        Bar
      </span>

      {/* Black checkers on bar (top half) */}
      <div className="flex flex-col items-center pt-4 gap-0.5">
        {Array.from({ length: blackCount }).map((_, i) => (
          <CheckerPiece key={i} player="black" size={barCheckerSize} />
        ))}
      </div>

      {/* White checkers on bar (bottom half) */}
      <div
        className="flex flex-col items-center pb-4 gap-0.5"
        style={{ cursor: isSelectable || isSelected ? 'pointer' : 'default' }}
        onClick={isSelectable || isSelected ? onSelect : undefined}
        role={isSelectable || isSelected ? 'button' : undefined}
        aria-label={whiteCount > 0 ? `${whiteCount} white on bar — click to select` : undefined}
      >
        {Array.from({ length: whiteCount }).map((_, i) => (
          <CheckerPiece
            key={i}
            player="white"
            size={barCheckerSize}
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
