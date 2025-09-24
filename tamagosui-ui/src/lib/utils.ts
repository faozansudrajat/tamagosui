import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { SuiObjectResponse } from "@mysten/sui/client";
import type {
  RawPetStructFields,
  PetStruct,
  RawPetOwnerCapsule, // <--- TAMBAHAN: Import tipe baru
  PetOwnerCapsule, // <--- TAMBAHAN: Import tipe baru
  SuiWrappedDynamicField, // <--- TAMBAHAN: Import tipe baru
} from "@/types/Pet";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSuiObjectFields<T>(object: SuiObjectResponse): T | null {
  if (
    object.error ||
    !object.data ||
    object.data.content?.dataType !== "moveObject" ||
    !object.data.content.fields
  )
    return null;

  return object.data.content.fields as T;
}

// TAMBAHAN: Fungsi baru untuk menormalisasi objek PetOwnerCapsule.
// Ini akan menjadi objek utama yang kita cari untuk setiap user.
export function normalizeSuiCapsuleObject(
  object: SuiObjectResponse
): PetOwnerCapsule | null {
  const fields = getSuiObjectFields<RawPetOwnerCapsule>(object);
  if (!fields) return null;

  return {
    id: fields.id.id,
    petCount: Number(fields.pet_count),
  };
}

// TAMBAHAN: Fungsi baru untuk menormalisasi Pet dari dalam dynamic field.
// Inputnya bukan lagi SuiObjectResponse, tapi struktur dynamic field.
export function normalizeDynamicPetField(
  dynamicField: SuiWrappedDynamicField<RawPetStructFields>
): PetStruct | null {
  const fields = dynamicField.value.fields;
  if (!fields) return null;

  return {
    id: fields.id.id,
    name: fields.name,
    image_url: fields.image_url,
    adopted_at: Number(fields.adopted_at),
    stats: {
      energy: fields.stats.fields.energy,
      happiness: fields.stats.fields.happiness,
      hunger: fields.stats.fields.hunger,
    },
    game_data: {
      coins: Number(fields.game_data.fields.coins),
      experience: Number(fields.game_data.fields.experience),
      level: fields.game_data.fields.level,
    },
    // isSleeping akan kita tambahkan nanti secara terpisah
    isSleeping: false,
  };
}

/**
 * @deprecated Fungsi ini masih bisa digunakan jika mengambil 1 objek Pet
 * langsung via ID-nya, tapi tidak lagi menjadi alur utama
 * untuk mendapatkan data Pet milik user.
 * Gunakan normalizeDynamicPetField untuk alur utama.
 */
export function normalizeSuiPetObject(
  object: SuiObjectResponse
): PetStruct | null {
  const fields = getSuiObjectFields<RawPetStructFields>(object);
  if (!fields) return null;

  return {
    id: fields.id.id,
    name: fields.name,
    image_url: fields.image_url,
    adopted_at: Number(fields.adopted_at),
    stats: {
      energy: fields.stats.fields.energy,
      happiness: fields.stats.fields.happiness,
      hunger: fields.stats.fields.hunger,
    },
    game_data: {
      coins: Number(fields.game_data.fields.coins),
      experience: Number(fields.game_data.fields.experience),
      level: fields.game_data.fields.level,
    },
  } as PetStruct;
}

export function getTimeSinceAdoption(adoptedAt: number) {
  if (!adoptedAt) return "Just adopted";

  const now = new Date();
  const adopted = new Date(adoptedAt); // Already milliseconds in Sui

  const diff = now.getTime() - adopted.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getSuiExplorerUrl(type: "tx" | "object", id: string) {
  return `https://suiscan.xyz/testnet/${type}/${id}`;
}
