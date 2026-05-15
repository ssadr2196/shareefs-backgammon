import type { DiceState, DieValue } from './types'

export function rollDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue
}

export function rollDice(): DiceState {
  const a = rollDie()
  const b = rollDie()
  // Doubles: four moves available
  const remaining: DieValue[] = a === b ? [a, a, a, a] : [a, b]
  return {
    values: [a, b],
    remaining,
    rolled: true,
  }
}

export function createUnrolledDice(): DiceState {
  return {
    values: [1, 1],
    remaining: [],
    rolled: false,
  }
}

/** Remove one die from remaining after it's been used */
export function consumeDie(dice: DiceState, die: DieValue): DiceState {
  const idx = dice.remaining.indexOf(die)
  if (idx === -1) return dice
  const remaining = [...dice.remaining.slice(0, idx), ...dice.remaining.slice(idx + 1)] as DieValue[]
  return { ...dice, remaining }
}

/** True if all dice have been used */
export function diceExhausted(dice: DiceState): boolean {
  return dice.remaining.length === 0
}
