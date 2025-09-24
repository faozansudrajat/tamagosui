import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import {
  normalizeSuiCapsuleObject,
  normalizeDynamicPetField,
} from "@/lib/utils";
import { PetOwnerCapsule, PetStruct } from "@/types/Pet";

// Mengubah nama query key agar lebih deskriptif
export const queryKeyUserPets = (address?: string) => {
  if (address) return ["user-pets", address];
  return ["user-pets"];
};

/**
 * Hook ini menggantikan useQueryOwnedPet.
 * Fungsinya adalah:
 * 1. Mencari PetOwnerCapsule milik user.
 * 2. Jika ada, mengambil semua objek Pet dari dynamic fields kapsul tersebut.
 * 3. Memeriksa status (seperti isSleeping) untuk setiap Pet.
 */
export function useQueryUserPets() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    // Gunakan query key yang baru
    queryKey: queryKeyUserPets(currentAccount?.address),
    queryFn: async (): Promise<{
      capsule: PetOwnerCapsule | null;
      pets: PetStruct[];
    }> => {
      if (!currentAccount) throw new Error("No connected account");

      // Langkah 1: Cari objek PetOwnerCapsule
      const capsuleResponse = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAME}::PetOwnerCapsule`,
        },
        options: { showContent: true },
      });

      // Jika tidak ada kapsul, user belum punya apa-apa.
      if (capsuleResponse.data.length === 0) {
        return { capsule: null, pets: [] };
      }

      const capsuleObject = capsuleResponse.data[0];
      const normalizedCapsule = normalizeSuiCapsuleObject(capsuleObject);

      if (!normalizedCapsule) {
        // Ini seharusnya tidak terjadi jika data.length > 0, tapi sebagai pengaman
        return { capsule: null, pets: [] };
      }

      // Langkah 2: Ambil semua Pet dari dynamic fields kapsul
      const petFields = await suiClient.getDynamicFields({
        parentId: normalizedCapsule.id,
      });

      // Normalisasi setiap dynamic field menjadi objek PetStruct
      const normalizedPets = petFields.data
        .map((field) => normalizeDynamicPetField(field as any))
        .filter((pet): pet is PetStruct => pet !== null);

      // Langkah 3: Cek status isSleeping untuk setiap Pet secara paralel
      const petDynamicFieldsPromises = normalizedPets.map((pet) =>
        suiClient.getDynamicFields({ parentId: pet.id })
      );

      const petDynamicFieldsResponses = await Promise.all(
        petDynamicFieldsPromises
      );

      const petsWithStatus = normalizedPets.map((pet, index) => {
        const fields = petDynamicFieldsResponses[index].data;
        const isSleeping = fields.some(
          (field) =>
            field.name.type === "0x1::string::String" &&
            field.name.value === "sleep_started_at"
        );
        return { ...pet, isSleeping };
      });

      // Langkah 4: Kembalikan data yang lengkap
      return { capsule: normalizedCapsule, pets: petsWithStatus };
    },
    enabled: !!currentAccount,
  });
}
