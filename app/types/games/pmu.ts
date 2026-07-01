import type { Card } from '../cards'
import { CardSuit } from '../cards'
import type { GameData, GameSessionPlayer } from '../games'

export interface PmuHandicap {
  step: number
  card: Card | null
}

export interface PmuPublicData extends GameData {
  stepNumber?: number
  maxNumberReach?: number
  position?: Record<CardSuit, number>
  handicaps?: PmuHandicap[]
  lastDrawnCard?: Card | null
  started?: boolean
  isFinished?: boolean
  winner?: CardSuit | null
  choices?: Record<string, CardSuit>
  players?: GameSessionPlayer[]
  hostId?: string | null
}

export interface PmuPrivateData extends GameData {
  choice?: CardSuit | null
}

export type PmuAction = 'make-choice' | 'play-round'

export type PmuSuitMeta = {
  suit: CardSuit
  symbol: string
  label: string
  color: string
}

export const PMU_SUITS: readonly [PmuSuitMeta, ...PmuSuitMeta[]] = [
  { suit: CardSuit.HEARTS, symbol: '♥', label: 'Cœur', color: '#ef4444' },
  { suit: CardSuit.SPADES, symbol: '♠', label: 'Pique', color: '#111827' },
  { suit: CardSuit.DIAMONDS, symbol: '♦', label: 'Carreau', color: '#ef4444' },
  { suit: CardSuit.CLUBS, symbol: '♣', label: 'Trèfle', color: '#111827' }
]

export const getSuitMeta = (suit: CardSuit): PmuSuitMeta => {
  return PMU_SUITS.find(entry => entry.suit === suit) ?? PMU_SUITS[0]
}
