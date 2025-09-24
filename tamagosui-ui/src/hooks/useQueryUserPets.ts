import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
// Perhatikan: Kita tidak lagi mengimpor normalizeSuiPetObject karena logika normalisasi
// untuk struktur data spesifik ini akan ditangani langsung di dalam hook.
import { normalizeSuiCapsuleObject } from "@/lib/utils";
import { PetOwnerCapsule, PetStruct } from "@/types/Pet";

// Sanity check log untuk memastikan PACKAGE_ID yang benar dimuat dari .env
console.log("MENGGUNAKAN PACKAGE ID:", PACKAGE_ID);

export const queryKeyUserPets = (address?: string) => {
  if (address) return ["user-pets", address];
  return ["user-pets"];
};

type UserPetsData = {
  capsule: PetOwnerCapsule | null;
  pets: PetStruct[];
};

export function useQueryUserPets() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyUserPets(currentAccount?.address),
    queryFn: async (): Promise<UserPetsData> => {
      try {
        if (!currentAccount) throw new Error("No connected account");

        // Step 1: Cari objek PetOwnerCapsule
        const capsuleResponse = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::${MODULE_NAME}::PetOwnerCapsule`,
          },
          options: { showContent: true },
        });

        if (capsuleResponse.data.length === 0) {
          return { capsule: null, pets: [] };
        }

        const capsuleObject = capsuleResponse.data[0];
        const normalizedCapsule = normalizeSuiCapsuleObject(capsuleObject);
        if (!normalizedCapsule)
          throw new Error("Gagal menormalisasi data kapsul.");

        // Step 2: Ambil semua dynamic fields (Pets) dari kapsul
        const petFields = await suiClient.getDynamicFields({
          parentId: normalizedCapsule.id,
        });

        const petObjectIds = petFields.data.map((field) => field.objectId);
        if (petObjectIds.length === 0) {
          return { capsule: normalizedCapsule, pets: [] };
        }

        const petObjects = await suiClient.multiGetObjects({
          ids: petObjectIds,
          options: { showContent: true },
        });

        // Step 3: Normalisasi setiap Pet dan periksa status tidurnya
        const normalizedPetsPromises = petObjects.map(async (petObject) => {
          // Type Guard: Pastikan objek ini adalah moveObject sebelum melanjutkan.
          if (petObject.data?.content?.dataType !== "moveObject") {
            console.warn("Melewatkan objek yang bukan moveObject:", petObject);
            return null;
          }

          // --- PERBAIKAN UTAMA DI SINI ---
          // Cast `fields` ke `any` untuk memberitahu TypeScript agar mempercayai
          // bahwa properti `.value` ada, berdasarkan struktur data dynamic field.
          const dynamicFieldWrapper = petObject.data.content.fields as any;
          const petDataFields = dynamicFieldWrapper?.value?.fields;

          // Jika struktur data tidak sesuai harapan, lewati objek ini
          if (
            !petDataFields ||
            !petDataFields.stats?.fields ||
            !petDataFields.game_data?.fields
          ) {
            console.warn(
              "Melewatkan objek dengan struktur tidak dikenal:",
              petObject
            );
            return null;
          }

          const normalizedPet = {
            id: petDataFields.id.id,
            name: petDataFields.name,
            image_url: petDataFields.image_url,
            adopted_at: Number(petDataFields.adopted_at),
            stats: {
              energy: petDataFields.stats.fields.energy,
              happiness: petDataFields.stats.fields.happiness,
              hunger: petDataFields.stats.fields.hunger,
            },
            game_data: {
              coins: Number(petDataFields.game_data.fields.coins),
              experience: Number(petDataFields.game_data.fields.experience),
              level: petDataFields.game_data.fields.level,
            },
          };
          // --- AKHIR PERBAIKAN ---

          const dynamicFields = await suiClient.getDynamicFields({
            parentId: normalizedPet.id,
          });

          const isSleeping = dynamicFields.data.some(
            (field) =>
              field.name.type === "0x1::string::String" &&
              field.name.value === "sleep_started_at"
          );

          return { ...normalizedPet, isSleeping };
        });

        const normalizedPets = (
          await Promise.all(normalizedPetsPromises)
        ).filter((p): p is PetStruct => p !== null);

        // Step 4: Kembalikan data yang lengkap
        return { capsule: normalizedCapsule, pets: normalizedPets };
      } catch (error) {
        console.error("Terjadi error di dalam useQueryUserPets:", error);
        throw error;
      }
    },
    enabled: !!currentAccount,
  });
}
