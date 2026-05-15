import { motion, AnimatePresence } from 'framer-motion'

interface HowToPlayProps {
  open: boolean
  onClose: () => void
}

const sections = [
  {
    title: 'Goal',
    body: 'Be the first to move all 15 of your checkers off the board. You play White; you move from points 24→1 then bear off.',
  },
  {
    title: 'Moving',
    body: 'Roll two dice. Move checkers forward by the die values shown — you may split them between two checkers or use both on one. You must use both dice if legally possible; if only one can be used, play the higher.',
  },
  {
    title: 'Doubles',
    body: "Roll the same number on both dice? You get four moves of that value instead of two — a big advantage.",
  },
  {
    title: 'Hitting',
    body: "If you land on a point with exactly one opponent checker (a blot), it's hit and sent to the bar. Your opponent must re-enter from the bar before making any other move.",
  },
  {
    title: 'The Bar',
    body: "A checker on the bar must enter on the opponent's home board (points 19-24 for White entering). If no legal entry is possible, you forfeit that die.",
  },
  {
    title: 'Bearing Off',
    body: "Once all your checkers are on points 1–6, you can start bearing off. Roll a 3 to remove the checker on point 3. If your die is higher than any occupied point, remove from the highest occupied point.",
  },
  {
    title: 'Winning',
    body: "First to bear off all 15 checkers wins.\n• Normal win: 1 point\n• Gammon: opponent has borne off none — 2 points\n• Backgammon: gammon + opponent has a checker on the bar or in your home board — 3 points",
  },
]

export function HowToPlay({ open, onClose }: HowToPlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: '#1a0e06', border: '2px solid #6b4226', maxHeight: '85svh' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #3a2010' }}>
              <h2 className="font-display text-xl text-brand-cream">How to Play</h2>
              <button
                onClick={onClose}
                className="text-brand-gold/60 hover:text-brand-gold text-2xl leading-none transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 py-4 space-y-5" style={{ maxHeight: 'calc(85svh - 72px)' }}>
              {/* Mini board diagram */}
              <div className="rounded-lg p-3 text-center" style={{ background: '#2c1a0e', border: '1px solid #3a2010' }}>
                <p className="text-[10px] text-brand-gold/50 uppercase tracking-wider mb-2">Direction of play</p>
                <svg viewBox="0 0 300 80" className="w-full max-w-xs mx-auto">
                  {/* Board outline */}
                  <rect x="10" y="10" width="280" height="60" rx="4" fill="#3a2010" stroke="#6b4226" strokeWidth="1.5"/>
                  {/* Bar */}
                  <rect x="148" y="10" width="4" height="60" fill="#6b4226"/>
                  {/* White arrow (bottom, right to left) */}
                  <path d="M 270 55 L 40 55" stroke="#F0E0C8" strokeWidth="2.5" markerEnd="url(#wa)" fill="none"/>
                  <defs>
                    <marker id="wa" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#F0E0C8"/>
                    </marker>
                    <marker id="ba" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#2c1a0e"/>
                    </marker>
                  </defs>
                  {/* Black arrow (top, left to right) */}
                  <path d="M 40 25 L 270 25" stroke="#2c1a0e" strokeWidth="2.5" markerEnd="url(#ba)" fill="none"/>
                  {/* Labels */}
                  <text x="150" y="72" textAnchor="middle" fontSize="8" fill="#C9A96E" fontFamily="Inter,sans-serif">Bar</text>
                  <text x="25" y="22" textAnchor="middle" fontSize="7" fill="#aaa" fontFamily="Inter,sans-serif">⚫ 1</text>
                  <text x="275" y="22" textAnchor="middle" fontSize="7" fill="#aaa" fontFamily="Inter,sans-serif">24</text>
                  <text x="275" y="58" textAnchor="middle" fontSize="7" fill="#aaa" fontFamily="Inter,sans-serif">24</text>
                  <text x="25" y="58" textAnchor="middle" fontSize="7" fill="#aaa" fontFamily="Inter,sans-serif">⚪ 1</text>
                </svg>
                <p className="text-[10px] text-brand-cream/50 mt-1">White moves right→left · Black moves left→right</p>
              </div>

              {sections.map(s => (
                <div key={s.title}>
                  <h3 className="text-brand-gold font-semibold text-sm mb-1">{s.title}</h3>
                  <p className="text-brand-cream/75 text-sm leading-relaxed whitespace-pre-line">{s.body}</p>
                </div>
              ))}

              <div className="pt-2 pb-4 text-center">
                <p className="text-brand-gold/40 text-xs italic">
                  "Backgammon is the oldest recorded board game — played in Beirut cafes for centuries."
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
