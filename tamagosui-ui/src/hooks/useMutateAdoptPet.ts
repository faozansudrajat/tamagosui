// src/hooks/useMutateAdoptPet.ts

import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { useQueryClient } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";
import { toast } from "react-hot-toast";

interface AdoptPetParams {
  petName: string;
  isFirstPet: boolean;
  capsuleId?: string;
  onSuccess?: () => void;
}

export function useMutateAdoptPet() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  const adopt = ({
    petName,
    isFirstPet,
    capsuleId,
    onSuccess,
  }: AdoptPetParams) => {
    if (!petName.trim()) {
      toast.error("Please give your new pet a name!");
      return;
    }
    if (!isFirstPet && !capsuleId) {
      toast.error("Capsule ID is missing for adopting a new pet.");
      return;
    }

    const tx = new Transaction();

    if (isFirstPet) {
      tx.moveCall({
        target: `${PACKAGE_ID}::tamagosui::create_pet_owner_capsule`,
        arguments: [tx.pure.string(petName), tx.object(SUI_CLOCK_OBJECT_ID)],
      });
    } else {
      tx.moveCall({
        target: `${PACKAGE_ID}::tamagosui::adopt_pet`,
        arguments: [
          tx.object(capsuleId!),
          tx.pure.string(petName),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    }

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          toast.success(`Welcome, ${petName}!`);
          queryClient.invalidateQueries({
            queryKey: queryKeyUserPets(account?.address),
          });
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(`Adoption failed: ${error.message}`);
        },
      }
    );
  };

  return { adopt, isPending };
}
