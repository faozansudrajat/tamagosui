// src/lib/mappers.ts

import type { SuiObjectResponse } from "@mysten/sui/client";
import { getSuiObjectFields } from "./sui";
import type { PetOwnerCapsule, Pet } from "@/types/Pet";
import type { RawPetFields, RawPetOwnerCapsule } from "@/types/Raw";

export function mapToPetOwnerCapsule(
  object: SuiObjectResponse
): PetOwnerCapsule | null {
  const fields = getSuiObjectFields<RawPetOwnerCapsule>(object);
  if (!fields) return null;

  return {
    id: fields.id.id,
    petCount: Number(fields.pet_count),
  };
}

export function mapToPet(
  rawObject: { fields: RawPetFields } | null
): Omit<Pet, "isSleeping" | "hasSunglasses" | "isSunglassesEquipped"> | null {
  const rawPetFields = rawObject?.fields;

  if (
    !rawPetFields?.id ||
    !rawPetFields.stats?.fields ||
    !rawPetFields.game_data?.fields
  ) {
    return null;
  }

  const stats = rawPetFields.stats.fields;
  const gameData = rawPetFields.game_data.fields;

  return {
    id: rawPetFields.id.id,
    name: rawPetFields.name,
    imageUrl: rawPetFields.image_url,
    adoptedAt: rawPetFields.adopted_at,
    stats: {
      energy: stats.energy,
      happiness: stats.happiness,
      hunger: stats.hunger,
    },
    gameData: {
      coins: gameData.coins,
      experience: gameData.experience,
      level: gameData.level,
    },
  };
}
