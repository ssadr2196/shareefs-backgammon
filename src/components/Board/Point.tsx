import { motion } from 'framer-motion'
import { CheckerPiece } from './CheckerPiece'
import type { Player } from '../../game/types'

interface PointProps {
  index: number        // 1–24
  count: number
  player: Player | null
  isTop: boolean       // top half of board (points 13-24)
  isSelected: boolean
  isValidDest: boolean
  isSelectable: boolean
  onSelect: () => void
  onMoveTo: () => void
}

const MAX_VISIBLE = 5

export function Point({
  index,
  count,
  player,
  isTop,
  isSelected,
  isValidDest,
  isSelectable,
  onSelect,
  onMoveTo,
}: PointProps) {
  const isLight = index % 2 === 0 // alternating colors
  const pointColor = isLight ? '#C9A96E' : '#8B1A1A'
  const checkerSize = 30

  const handleClick = () => {
    if (isValidDest) onMoveTo()
    else if (isSelectable || isSelected) onSelect()
  }

  // Stack: show up to MAX_VISIBLE checkers, badge shows real count
  const displayCount = Math.min(count, MAX_VISIBLE)
  const checkers = player && count > 0
    ? Array.from({ length: displayCount }, (_, i) => i)
    : []

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Point ${index}${count > 0 && player ? `, ${count} ${player}` : ', empty'}`}
      onClick={handleClick}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      className="relative flex flex-col items-center cursor-pointer select-none"
      style={{ width: checkerSize + 8, minHeight: 160 }}
    >
      {/* Triangle spike */}
      <svg
        viewBox="0 0 38 160"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <polygon
          points={isTop ? '19,8 2,152 36,152' : '2,8 36,8 19,152'}
          fill={pointColor}
          opacity={isSelected ? 0.5 : isValidDest ? 0.3 : 0.85}
        />
        {/* Point number */}
        <text
          x="19"
          y={isTop ? 155 : 5}
          textAnchor="middle"
          dominantBaseline={isTop ? 'auto' : 'hanging'}
          fontSize="8"
          fill="#f5e6d3"
          opacity="0.5"
          fontFamily="Inter, sans-serif"
        >
          {index}
        </text>
      </svg>

      {/* Valid destination highlight */}
      {isValidDest && (
        <motion.div
          className="absolute inset-0 rounded"
          style={{
            background: 'rgba(201,169,110,0.25)',
            border: '2px solid #C9A96E',
            zIndex: 1,
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Checkers */}
      <div
        className={`relative flex flex-col items-center gap-[2px] z-10 ${isTop ? 'pt-2' : 'pb-2 justify-end flex-col-reverse'}`}
        style={{ flex: 1, width: '100%', paddingLeft: 4, paddingRight: 4 }}
      >
        {checkers.map((_, i) => (
          <CheckerPiece
            key={i}
            player={player!}
            count={i === 0 ? count : undefined}
            selected={isSelected}
            size={checkerSize}
          />
        ))}
      </div>

      {/* Selectable pulse ring */}
      {isSelectable && !isSelected && (
        <motion.div
          className="absolute inset-0"
          style={{
            border: '2px solid rgba(201,169,110,0.7)',
            borderRadius: 4,
            zIndex: 2,
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}
