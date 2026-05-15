import { useRef, useCallback } from 'react'

type SoundType = 'dice' | 'place' | 'hit' | 'win'

function createOscillator(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

function playDiceSound(ctx: AudioContext) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.setValueAtTime(80 + Math.random() * 120, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    }, i * 80)
  }
}

function playPlaceSound(ctx: AudioContext) {
  createOscillator(ctx, 440, 0.12, 'sine', 0.25)
}

function playHitSound(ctx: AudioContext) {
  createOscillator(ctx, 220, 0.2, 'sawtooth', 0.3)
  setTimeout(() => createOscillator(ctx, 180, 0.15, 'sawtooth', 0.2), 80)
}

function playWinSound(ctx: AudioContext) {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    setTimeout(() => createOscillator(ctx, freq, 0.4, 'sine', 0.35), i * 120)
  })
}

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback((type: SoundType) => {
    if (!enabled) return
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext()
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      switch (type) {
        case 'dice': playDiceSound(ctx); break
        case 'place': playPlaceSound(ctx); break
        case 'hit': playHitSound(ctx); break
        case 'win': playWinSound(ctx); break
      }
    } catch {
      // AudioContext unavailable — silent fallback
    }
  }, [enabled])

  return play
}
