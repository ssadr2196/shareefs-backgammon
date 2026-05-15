import { useRef, useEffect, useState } from 'react'
import { Point } from './Point'
import { BarArea } from './BarArea'
import { CheckerPiece } from './CheckerPiece'
import { useGameStore } from '../../store/gameStore'
import { pipCount } from '../../game/board'

/**
 * Board layout — portrait mobile, full-width:
 *   Top:    [13,14,15,16,17,18] | bar | [19,20,21,22,23,24]
 *   Bottom: [12,11,10, 9, 8, 7] | bar | [ 6, 5, 4, 3, 2, 1]
 *
 * All sizing is derived from the board's measured pixel width via
 * ResizeObserver, so nothing overflows at any viewport width.
 */

interface BoardProps {
  onPlaySound: (t: 'dice' | 'place' | 'hit' | 'win') => void
  /** Available vertical space in px — passed from GameScreen so board can scale */
  availableHeight?: number
}

/**
 * Compute board geometry.
 * chkSize is constrained by pointWidth (from innerW) and by available height
 * (passed in from GameScreen so the board expands to fill vertical space on
 * wider/taller screens without overflowing on either axis).
 *
 * Height model: totalBoardH ≈ 12.4·c + 24  (two trays + two halves + rail)
 */
function computeSizes(innerW: number, availH: number) {
  const barW     = Math.max(24, Math.round(innerW * 0.082))
  const pointW   = (innerW - barW) / 12
  const chkFromW = Math.floor(pointW) - 3
  // How large can checkers be so the board fits vertically?
  const chkFromH = availH > 60 ? Math.floor((availH - 24) / 12.4) : 40
  const chkSize  = Math.max(16, Math.min(chkFromW, chkFromH, 40))
  const halfH    = chkSize * 5 + 10
  const railH    = Math.max(8, Math.round(chkSize * 0.35))
  const trayH    = Math.round(chkSize * 0.9)
  return { barW, pointW, chkSize, halfH, railH, trayH }
}

export function Board({ onPlaySound, availableHeight = 400 }: BoardProps) {
  const { gameState, selectedPoint, validDests, selectablePts, selectPoint, moveTo } = useGameStore()

  // Measure the board's actual rendered inner width
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerW, setInnerW] = useState(348)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setInnerW(Math.floor(entry.contentRect.width))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!gameState) return null
  const { board, currentPlayer } = gameState

  const { barW, pointW, chkSize, halfH, railH, trayH } = computeSizes(innerW, availableHeight)

  const whitePip = pipCount(board, 'white')
  const blackPip = pipCount(board, 'black')

  const topLeft  = [13, 14, 15, 16, 17, 18]
  const topRight = [19, 20, 21, 22, 23, 24]
  const botLeft  = [12, 11, 10,  9,  8,  7]
  const botRight = [ 6,  5,  4,  3,  2,  1]

  const handlePointClick = (pt: number) => {
    if (validDests.includes(pt)) {
      moveTo(pt)
      onPlaySound(board.points[pt]?.player && board.points[pt].player !== currentPlayer ? 'hit' : 'place')
    } else if (selectablePts.includes(pt) || selectedPoint === pt) {
      selectPoint(pt)
    }
  }

  const ptProps = (idx: number, isTop: boolean) => ({
    index: idx,
    count:       board.points[idx]?.count  ?? 0,
    player:      board.points[idx]?.player ?? null,
    isTop,
    isSelected:  selectedPoint === idx,
    isValidDest: validDests.includes(idx),
    isSelectable: selectablePts.includes(idx),
    pointWidth:  pointW,
    checkerSize: chkSize,
    halfHeight:  halfH,
    onSelect:  () => handlePointClick(idx),
    onMoveTo:  () => handlePointClick(idx),
  })

  const rowStyle = { height: halfH }
  const quadStyle = { display: 'flex', flex: 1, alignItems: 'flex-start' } as const

  return (
    <div className="w-full flex flex-col">
      {/* Pip counts — compact single line */}
      <div className="flex justify-between text-[10px] text-brand-gold/50 px-1 pb-0.5">
        <span>⚫ {blackPip}p</span>
        <span>⚪ {whitePip}p</span>
      </div>

      {/* Board frame — full width, no horizontal padding */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{
          border: '3px solid #6B4226',
          boxShadow: '0 6px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(201,169,110,0.3)',
        }}
      >
        {/* Measured inner div — this is what ResizeObserver watches */}
        <div
          ref={innerRef}
          style={{ background: 'linear-gradient(180deg, #3d2410 0%, #2c1a0e 50%, #3d2410 100%)' }}
        >

          {/* ── Bear-off tray: black (top-right corner) ── */}
          <div
            className="flex items-center justify-end px-2 border-b border-brand-wood/30"
            style={{ height: trayH }}
          >
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid #3a2010',
                fontSize: 9,
                color: 'rgba(201,169,110,0.5)',
              }}
            >
              <span className="uppercase tracking-wider mr-1">Off</span>
              {Array.from({ length: board.off.black }).map((_, i) => (
                <CheckerPiece key={i} player="black" size={Math.max(10, chkSize - 14)} />
              ))}
            </div>
          </div>

          {/* ── Top point row (13–24) ── */}
          <div className="flex" style={rowStyle}>
            <div style={{ ...quadStyle, paddingTop: 2 }}>
              {topLeft.map(i => <Point key={i} {...ptProps(i, true)} />)}
            </div>
            <BarArea
              whiteCount={board.bar.white}
              blackCount={board.bar.black}
              barWidth={barW}
              checkerSize={chkSize}
              isSelectable={selectablePts.includes(0)}
              isSelected={selectedPoint === 0}
              onSelect={() => { if (selectablePts.includes(0)) selectPoint(0) }}
            />
            <div style={{ ...quadStyle, paddingTop: 2 }}>
              {topRight.map(i => <Point key={i} {...ptProps(i, true)} />)}
            </div>
          </div>

          {/* ── Mid rail ── */}
          <div
            className="flex items-center"
            style={{
              height: railH,
              background: 'linear-gradient(90deg, #2c1a0e, #4a2e18, #2c1a0e)',
            }}
          >
            <div className="w-full" style={{ height: 1, background: '#6b4226' }} />
          </div>

          {/* ── Bottom point row (12–1) ── */}
          <div className="flex" style={rowStyle}>
            <div style={{ ...quadStyle, alignItems: 'flex-end', paddingBottom: 2 }}>
              {botLeft.map(i => <Point key={i} {...ptProps(i, false)} />)}
            </div>
            {/* Bottom bar column (visual only — interaction handled by top BarArea) */}
            <div
              style={{
                width: barW,
                flexShrink: 0,
                background: 'linear-gradient(180deg, #3a2010 0%, #4a2e18 100%)',
                borderLeft:  '2px solid #6b4226',
                borderRight: '2px solid #6b4226',
              }}
            />
            <div style={{ ...quadStyle, alignItems: 'flex-end', paddingBottom: 2 }}>
              {botRight.map(i => <Point key={i} {...ptProps(i, false)} />)}
            </div>
          </div>

          {/* ── Bear-off tray: white (bottom-right corner) ── */}
          <div
            className="flex items-center justify-end px-2 border-t border-brand-wood/30"
            style={{
              height: trayH,
              cursor: validDests.includes(25) ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (validDests.includes(25)) { moveTo(25); onPlaySound('place') }
            }}
            role={validDests.includes(25) ? 'button' : undefined}
            aria-label="Bear off zone"
          >
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
              style={{
                background: validDests.includes(25) ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.35)',
                border: validDests.includes(25) ? '1px solid #C9A96E' : '1px solid #3a2010',
                fontSize: 9,
                color: validDests.includes(25) ? '#C9A96E' : 'rgba(201,169,110,0.5)',
              }}
            >
              <span className="uppercase tracking-wider mr-1">
                {validDests.includes(25) ? 'Bear off ↑' : 'Off'}
              </span>
              {Array.from({ length: board.off.white }).map((_, i) => (
                <CheckerPiece key={i} player="white" size={Math.max(10, chkSize - 14)} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
