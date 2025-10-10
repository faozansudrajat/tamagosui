// src/types/Pet.ts

export interface PetStats {
  energy: number;
  happiness: number;
  hunger: number;
}

export interface PetGameData {
  coins: string;
  experience: string;
  level: number;
}

export interface Pet {
  id: string;
  name: string;
  adoptedAt: string;
  imageUrl: string;
  stats: PetStats;
  gameData: PetGameData;
  isSleeping: boolean;
  hasSunglasses: boolean;
  isSunglassesEquipped: boolean;
}

export interface PetOwnerCapsule {
  id: string;
  petCount: number;
}

export interface PetAccessory {
  id: string;
  name: string;
  imageUrl: string;
}
