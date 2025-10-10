// src/types/Raw.ts

export interface SuiDynamicFieldName {
  type: string;
  value: any;
}

export interface RawPetStats {
  energy: number;
  happiness: number;
  hunger: number;
}

export interface RawPetGameData {
  coins: string;
  experience: string;
  level: number;
}

export interface RawPetFields {
  id: { id: string };
  name: string;
  image_url: string;
  adopted_at: string;
  stats: { fields: RawPetStats };
  game_data: { fields: RawPetGameData };
}

export interface RawPetOwnerCapsule {
  id: { id: string };
  pet_count: string;
}

export interface RawPetAccessoryFields {
  id: { id: string };
  name: string;
  image_url: string;
}

export interface SuiWrappedDynamicField<T> {
  id: { id: string };
  name: SuiDynamicFieldName;
  value: T;
}
