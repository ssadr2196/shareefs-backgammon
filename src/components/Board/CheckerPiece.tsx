import { motion } from 'framer-motion'
import type { Player } from '../../game/types'

interface CheckerPieceProps {
  player: Player
  count?: number
  selected?: boolean
  size?: number
  onClick?: () => void
}

export function CheckerPiece({ player, count = 1, selected = false, size = 32, onClick }: CheckerPieceProps) {
  const isWhite = player === 'white'

  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${player} checker${count > 1 ? ` (${count})` : ''}`}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{ width: size, height: size }}
      whileTap={onClick ? { scale: 0.92 } : {}}
      animate={selected ? { scale: [1, 1.12, 1.08] } : { scale: 1 }}
      transition={selected ? { duration: 0.3, ease: 'easeOut' } : {}}
      className={`
        relative rounded-full flex items-center justify-center flex-shrink-0
        ${onClick ? 'cursor-pointer' : ''}
        ${selected ? 'z-10' : ''}
      `}
    >
      {/* Main checker body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isWhite
            ? 'radial-gradient(circle at 35% 35%, #fff8f0 0%, #f0e0c8 40%, #d4b896 100%)'
            : 'radial-gradient(circle at 35% 35%, #5a3a20 0%, #2c1a0e 50%, #1a0e06 100%)',
          border: `2px solid ${isWhite ? '#c9a96e' : '#8b5e3c'}`,
          boxShadow: selected
            ? `0 0 0 3px #C9A96E, 0 4px 12px rgba(0,0,0,0.5)`
            : `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px ${isWhite ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
        }}
      />
      {/* Inner ring — mother-of-pearl effect */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '20%',
          border: `1px solid ${isWhite ? 'rgba(201,169,110,0.5)' : 'rgba(139,94,60,0.4)'}`,
          background: isWhite
            ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }}
      />
      {/* Stack count badge */}
      {count > 1 && (
        <span
          className="relative z-10 text-[9px] font-bold leading-none"
          style={{ color: isWhite ? '#6b4226' : '#f5e6d3' }}
        >
          {count}
        </span>
      )}
    </motion.div>
  )
}
