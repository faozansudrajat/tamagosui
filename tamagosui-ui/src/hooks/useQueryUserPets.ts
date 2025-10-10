// src/hooks/useQueryUserPets.ts

import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { getSuiObjectFields } from "@/lib/sui";
import { mapToPetOwnerCapsule, mapToPet } from "@/lib/mappers";
import type { Pet, PetOwnerCapsule } from "@/types/Pet";
import type { RawPetFields } from "@/types/Raw";
import {
  PET_OWNER_CAPSULE_TYPE,
  SLEEP_STARTED_AT_KEY,
} from "@/constants/contract";

export const queryKeyUserPets = (address: string | undefined) => [
  "user-pets",
  address,
];

interface UserPetsData {
  capsule: PetOwnerCapsule | null;
  pets: Pet[];
}

export function useQueryUserPets() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const { data, isPending } = useQuery({
    queryKey: queryKeyUserPets(account?.address),
    enabled: !!account?.address,
    queryFn: async (): Promise<UserPetsData> => {
      try {
        const address = account!.address;

        const ownedCapsules = await suiClient.getOwnedObjects({
          owner: address,
          filter: { StructType: PET_OWNER_CAPSULE_TYPE },
          options: { showContent: true },
        });

        const capsuleResponse = ownedCapsules.data[0];
        if (!capsuleResponse) {
          return { capsule: null, pets: [] };
        }

        const capsule = mapToPetOwnerCapsule(capsuleResponse);
        if (!capsule) {
          throw new Error("Failed to map PetOwnerCapsule.");
        }

        const petDynamicFields = await suiClient.getDynamicFields({
          parentId: capsule.id,
        });
        if (petDynamicFields.data.length === 0) {
          return { capsule, pets: [] };
        }

        const petProcessingPromises = petDynamicFields.data.map(
          async (dfInfo): Promise<Pet | null> => {
            try {
              const petObjectResponse = await suiClient.getDynamicFieldObject({
                parentId: capsule.id,
                name: dfInfo.name,
              });

              if (!petObjectResponse?.data) return null;

              const rawPetObject = getSuiObjectFields<{ fields: RawPetFields }>(
                petObjectResponse
              );

              const petPartial = mapToPet(rawPetObject);

              if (!petPartial) return null;

              const sunglassesDF = await suiClient.getDynamicFieldObject({
                parentId: petPartial.id,
                name: {
                  type: "0x1::string::String",
                  value: "sunglasses",
                },
              });
              const hasSunglasses = sunglassesDF.error === undefined;

              const equippedDF = await suiClient.getDynamicFieldObject({
                parentId: petPartial.id,
                name: {
                  type: "0x1::string::String",
                  value: "equipped_item",
                },
              });

              const isSunglassesEquipped = equippedDF.error === undefined;

              const sleepDF = await suiClient.getDynamicFieldObject({
                parentId: petPartial.id,
                name: {
                  type: "0x1::string::String",
                  value: SLEEP_STARTED_AT_KEY,
                },
              });

              const isSleeping = sleepDF.error === undefined;

              return {
                ...petPartial,
                isSleeping,
                hasSunglasses,
                isSunglassesEquipped,
              };
            } catch (innerError) {
              console.error(
                `Failed to process one pet: ${dfInfo.objectId}`,
                innerError
              );
              return null;
            }
          }
        );

        const pets = (await Promise.all(petProcessingPromises)).filter(
          (pet): pet is Pet => pet !== null
        );

        return { capsule, pets };
      } catch (error) {
        console.error("Critical error in useQueryUserPets:", error);
        return { capsule: null, pets: [] };
      }
    },
  });

  return { data, isPending };
}
