/** Decorative arabesque/geometric border SVG — used sparingly as accent */
export function ArabesquePattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {Array.from({ length: 20 }).map((_, i) => {
        const x = i * 20 + 10
        return (
          <g key={i} transform={`translate(${x}, 12)`}>
            <polygon points="0,-7 4,-2 0,3 -4,-2" fill="none" stroke="#C9A96E" strokeWidth="0.8" opacity="0.6" />
            <circle cx="0" cy="0" r="1.5" fill="#C9A96E" opacity="0.5" />
          </g>
        )
      })}
    </svg>
  )
}
