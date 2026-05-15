import type { Difficulty } from '../game/types'
import type { AIContext } from './types'
import type { Move } from '../game/types'
import { easyChooseTurn } from './easy'
import { mediumChooseTurn } from './medium'
import { hardChooseTurn } from './hard'

export function chooseAITurn(ctx: AIContext, difficulty: Difficulty): Move[] {
  switch (difficulty) {
    case 'easy': return easyChooseTurn(ctx)
    case 'medium': return mediumChooseTurn(ctx)
    case 'hard': return hardChooseTurn(ctx)
  }
}

export type { AIContext }
