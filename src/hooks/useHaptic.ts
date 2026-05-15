import { useCallback } from 'react'

type HapticType = 'roll' | 'place' | 'hit'

export function useHaptic() {
  return useCallback((type: HapticType) => {
    if (!navigator.vibrate) return
    switch (type) {
      case 'roll': navigator.vibrate([30, 20, 30]); break
      case 'place': navigator.vibrate(20); break
      case 'hit': navigator.vibrate([50, 30, 50]); break
    }
  }, [])
}
