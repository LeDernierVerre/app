import type { Card } from "../cards"
import type { GameData, GameSessionPlayer } from "../games";

export interface NinetySeventyTurnResult {
  id: string
  playedPlayer: GameSessionPlayer
  announcedTotal: number
  realTotal: number
  penalty: number
  isCorrect: boolean
}

export type NinetySeventyTurnResultOverlayData = {
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

export interface NinetySeventyPublicData extends GameData {
  discardPile?: Card[];
  currentPlayerIdx?: number;
  direction?: -1 | 1;

  players?: GameSessionPlayer[];  
  lastTurnResult?: NinetySeventyTurnResult;

  isFinished?: boolean;
  gameResult?: NinetySevenGameResult | null;
}
export interface NinetySeventyPrivateData extends GameData {
  cards?: Card[];
  drawnCard?: Card;
}

export type NinetySevenGameResult = {
    loser: {
        id: string;
        username: string;
    };
};

export type NinetySeventyAction = 'play-card'

export const NINETY_SEVENTY_MIN_GUESS = 0;
export const NINETY_SEVENTY_MAX_GUESS = 97;
