export enum GameEnum {
    NINETY_SEVEN = "ninety-seven"
}

export type GameSessionPlayer = {
    id: string;
    username: string;
}

export interface GamePropsData<PrivateData, PublicData> {
  privateData: PrivateData|null;
  publicData: PublicData|null;
}

export type GameData = Record<string, unknown>;

