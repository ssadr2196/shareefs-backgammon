import { Point } from './Point'
import { BarArea } from './BarArea'
import { CheckerPiece } from './CheckerPiece'
import { useGameStore } from '../../store/gameStore'
import { pipCount } from '../../game/board'

/**
 * Board layout (portrait mobile, white plays from top to bottom):
 *
 * Points 13-24 run left→right across the top (black's outer → black's home)
 * Points 12-1  run left→right across the bottom (white's outer → white's home)
 * Bar runs vertically in the centre.
 *
 * White moves: enters at 24 side, travels right-to-left on bottom (toward 1), bears off bottom-right.
 * Black moves: enters at 1 side, travels left-to-right on top (toward 24), bears off top-right.
 *
 * Rendered as two rows of 6 points each side of the bar:
 *   Top:    [13,14,15,16,17,18] | bar | [19,20,21,22,23,24]
 *   Bottom: [12,11,10, 9, 8, 7] | bar | [ 6, 5, 4, 3, 2, 1]
 */

interface BoardProps {
  onPlaySound: (t: 'dice' | 'place' | 'hit' | 'win') => void
}

function getPipLabel(n: number) {
  return n === 1 ? '1 pip' : `${n} pips`
}

export function Board({ onPlaySound }: BoardProps) {
  const {
    gameState,
    selectedPoint,
    validDests,
    selectablePts,
    selectPoint,
    moveTo,
  } = useGameStore()

  if (!gameState) return null
  const { board, currentPlayer } = gameState

  const whitePip = pipCount(board, 'white')
  const blackPip = pipCount(board, 'black')

  // Top row: points 13–24 (left to right)
  const topLeft = [13, 14, 15, 16, 17, 18]
  const topRight = [19, 20, 21, 22, 23, 24]
  // Bottom row: points 12–1 (left to right, reversed)
  const botLeft = [12, 11, 10, 9, 8, 7]
  const botRight = [6, 5, 4, 3, 2, 1]

  const handlePointClick = (pt: number) => {
    if (validDests.includes(pt)) {
      moveTo(pt)
      onPlaySound(board.points[pt]?.player && board.points[pt].player !== currentPlayer ? 'hit' : 'place')
    } else if (selectablePts.includes(pt)) {
      selectPoint(pt)
    } else if (selectedPoint === pt) {
      selectPoint(pt) // deselect
    }
  }

  const handleBarClick = () => {
    if (selectablePts.includes(0)) selectPoint(0)
  }

  const handleBearOff = () => {
    if (validDests.includes(25)) {
      moveTo(25)
      onPlaySound('place')
    }
  }

  const ptProps = (idx: number, isTop: boolean) => ({
    index: idx,
    count: board.points[idx]?.count ?? 0,
    player: board.points[idx]?.player ?? null,
    isTop,
    isSelected: selectedPoint === idx,
    isValidDest: validDests.includes(idx),
    isSelectable: selectablePts.includes(idx),
    onSelect: () => handlePointClick(idx),
    onMoveTo: () => handlePointClick(idx),
  })

  const boardBg = {
    background: 'linear-gradient(180deg, #3d2410 0%, #2c1a0e 50%, #3d2410 100%)',
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-lg mx-auto px-2">
      {/* Pip counts */}
      <div className="flex justify-between text-[11px] text-brand-gold/60 px-2">
        <span>⚫ Black: {getPipLabel(blackPip)}</span>
        <span>⚪ White: {getPipLabel(whitePip)}</span>
      </div>

      {/* Board outer frame */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '3px solid #6B4226',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(201,169,110,0.3)',
        }}
      >
        {/* Inner board */}
        <div style={boardBg}>
          {/* Top bear-off zone (black) */}
          <div className="flex justify-end items-center px-3 py-1 border-b border-brand-wood/30">
            <div
              className="flex flex-col items-center gap-1 px-2 py-1 rounded"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #3a2010' }}
            >
              <span className="text-[9px] text-brand-gold/50 uppercase tracking-wider">Off</span>
              <div className="flex flex-wrap gap-0.5 justify-center" style={{ maxWidth: 80 }}>
                {Array.from({ length: board.off.black }).map((_, i) => (
                  <CheckerPiece key={i} player="black" size={14} />
                ))}
              </div>
            </div>
          </div>

          {/* Top row of points (13-24) + bar */}
          <div className="flex" style={{ height: 168 }}>
            {/* Left quadrant top: 13-18 */}
            <div className="flex flex-1 justify-around items-start px-1 pt-1">
              {topLeft.map(i => <Point key={i} {...ptProps(i, true)} />)}
            </div>
            {/* Bar */}
            <BarArea
              whiteCount={board.bar.white}
              blackCount={board.bar.black}
              currentPlayer={currentPlayer}
              isSelectable={selectablePts.includes(0)}
              isSelected={selectedPoint === 0}
              onSelect={handleBarClick}
            />
            {/* Right quadrant top: 19-24 */}
            <div className="flex flex-1 justify-around items-start px-1 pt-1">
              {topRight.map(i => <Point key={i} {...ptProps(i, true)} />)}
            </div>
          </div>

          {/* Mid rail */}
          <div
            className="h-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(90deg, #2c1a0e, #4a2e18, #2c1a0e)' }}
          >
            <div className="w-full h-px" style={{ background: '#6b4226' }} />
          </div>

          {/* Bottom row of points (12-1) + bar */}
          <div className="flex" style={{ height: 168 }}>
            {/* Left quadrant bottom: 12-7 */}
            <div className="flex flex-1 justify-around items-end px-1 pb-1">
              {botLeft.map(i => <Point key={i} {...ptProps(i, false)} />)}
            </div>
            {/* Bar (continued) */}
            <div
              style={{
                minWidth: 44,
                background: 'linear-gradient(180deg, #3a2010 0%, #4a2e18 100%)',
                borderLeft: '2px solid #6b4226',
                borderRight: '2px solid #6b4226',
              }}
            />
            {/* Right quadrant bottom: 6-1 */}
            <div className="flex flex-1 justify-around items-end px-1 pb-1">
              {botRight.map(i => <Point key={i} {...ptProps(i, false)} />)}
            </div>
          </div>

          {/* Bottom bear-off zone (white) */}
          <div className="flex justify-end items-center px-3 py-1 border-t border-brand-wood/30">
            <div
              className="flex flex-col items-center gap-1 px-2 py-1 rounded cursor-pointer"
              style={{
                background: validDests.includes(25) ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.3)',
                border: validDests.includes(25) ? '1px solid #C9A96E' : '1px solid #3a2010',
              }}
              onClick={handleBearOff}
              role={validDests.includes(25) ? 'button' : undefined}
              aria-label="Bear off zone"
            >
              <span className="text-[9px] text-brand-gold/50 uppercase tracking-wider">Off</span>
              <div className="flex flex-wrap gap-0.5 justify-center" style={{ maxWidth: 80 }}>
                {Array.from({ length: board.off.white }).map((_, i) => (
                  <CheckerPiece key={i} player="white" size={14} />
                ))}
              </div>
              {validDests.includes(25) && (
                <span className="text-[8px] text-brand-gold animate-pulse">Bear off ↑</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
