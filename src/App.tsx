import { useGameStore } from './store/gameStore'
import { Lobby } from './components/Lobby/Lobby'
import { GameScreen } from './components/GameScreen/GameScreen'
import { EndGame } from './components/EndGame/EndGame'

export default function App() {
  const { screen } = useGameStore()

  switch (screen) {
    case 'lobby': return <Lobby />
    case 'game':  return <GameScreen />
    case 'end':   return <EndGame />
    default:      return <Lobby />
  }
}
