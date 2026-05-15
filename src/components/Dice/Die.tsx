import { motion } from 'framer-motion'
import type { DieValue } from '../../game/types'

const DOT_POSITIONS: Record<DieValue, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
}

interface DieProps {
  value: DieValue
  spent?: boolean
  rolling?: boolean
  size?: number
}

export function Die({ value, spent = false, rolling = false, size = 56 }: DieProps) {
  return (
    <motion.div
      style={{ width: size, height: size }}
      className={`relative rounded-xl select-none flex-shrink-0 ${
        spent
          ? 'opacity-35 scale-90'
          : 'shadow-lg shadow-black/50'
      }`}
      animate={rolling ? {
        rotate: [0, 180, 360, 540, 720],
        scale: [1, 1.15, 0.9, 1.1, 1],
      } : {}}
      transition={rolling ? { duration: 0.5, ease: 'easeOut' } : {}}
    >
      {/* Die face — wood-inlay style */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: spent
            ? 'linear-gradient(135deg, #4a3020 0%, #2c1a0e 100%)'
            : 'linear-gradient(135deg, #f5e6d3 0%, #e8c99a 50%, #d4a96e 100%)',
          border: `2px solid ${spent ? '#3a2010' : '#a07840'}`,
          boxShadow: spent ? 'none' : 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.3)',
        }}
      />
      {/* Dots */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        aria-label={`Die showing ${value}`}
      >
        {DOT_POSITIONS[value].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={8}
            fill={spent ? '#6b4226' : '#8B1A1A'}
          />
        ))}
      </svg>
      {/* Spent overlay X */}
      {spent && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-brand-wood opacity-60">✓</span>
        </div>
      )}
    </motion.div>
  )
}
