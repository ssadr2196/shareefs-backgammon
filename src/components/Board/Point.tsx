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
  pointWidth: number   // computed from board width
  checkerSize: number  // computed from board width
  halfHeight: number   // computed from board width
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
  pointWidth,
  checkerSize,
  halfHeight,
  onSelect,
  onMoveTo,
}: PointProps) {
  const isLight = index % 2 === 0
  const pointColor = isLight ? '#C9A96E' : '#8B1A1A'

  const handleClick = () => {
    if (isValidDest) onMoveTo()
    else if (isSelectable || isSelected) onSelect()
  }

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
      className="relative flex flex-col items-center cursor-pointer select-none flex-shrink-0"
      style={{ width: pointWidth, height: halfHeight }}
    >
      {/* Triangle spike — SVG fills the container */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <polygon
          points={isTop ? '50,6 4,96 96,96' : '4,4 96,4 50,94'}
          fill={pointColor}
          opacity={isSelected ? 0.5 : isValidDest ? 0.3 : 0.85}
        />
      </svg>

      {/* Point number label */}
      <div
        className="absolute w-full flex justify-center"
        style={{
          [isTop ? 'bottom' : 'top']: 1,
          fontSize: Math.max(7, Math.min(10, checkerSize * 0.33)),
          color: 'rgba(245,230,211,0.45)',
          zIndex: 1,
          lineHeight: 1,
          pointerEvents: 'none',
        }}
      >
        {index}
      </div>

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
        className={`relative flex flex-col items-center z-10 ${
          isTop ? 'pt-1' : 'pb-1 justify-end flex-col-reverse'
        }`}
        style={{ flex: 1, width: '100%', gap: 1 }}
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
