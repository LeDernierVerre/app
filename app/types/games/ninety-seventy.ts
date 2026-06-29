import type { Card } from "../cards"
import type { GameData, GameSessionPlayer } from "../games";

export interface NinetySevenTurnResult {
  id: string
  playedPlayer: GameSessionPlayer
  announcedTotal: number
  realTotal: number
  penalty: number
  isCorrect: boolean
}

export type NinetySevenTurnResultOverlayData = {
  isSelf: boolean
  playerName: string
  announcedTotal: number
  realTotal: number
  penalty: number
  isCorrect: boolean
}

export type NinetySevenPenaltyData = {
  isSelf: boolean
  playerName: string
  penalty?: number
}

export interface NinetySevenPublicData extends GameData {
  discardPile?: Card[];
  currentPlayerIdx?: number;
  direction?: -1 | 1;

  players?: GameSessionPlayer[];  
  lastTurnResult?: NinetySevenTurnResult;

  isFinished?: boolean;
  gameResult?: NinetySevenGameResult | null;
}
export interface NinetySevenPrivateData extends GameData {
  cards?: Card[];
  drawnCard?: Card;
}

export type NinetySevenGameResult = {
    loser: {
        id: string;
        username: string;
    };
};

export type NinetySevenAction = 'play-card'

export const NINETY_SEVEN_MIN_GUESS = 0;
export const NINETY_SEVEN_MAX_GUESS = 97;
