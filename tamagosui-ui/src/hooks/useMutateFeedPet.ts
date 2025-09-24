import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets"; // <-- IMPORT BARU

const mutationKeyFeedPet = ["mutate", "feed-pet"];

// --- PARAMETER BARU ---
type UseMutateFeedPetParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateFeedPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyFeedPet,
    mutationFn: async ({ capsuleId, petId }: UseMutateFeedPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::feed_pet`,
        arguments: [
          // --- ARGUMEN BARU SESUAI SMART CONTRACT ---
          tx.object(capsuleId), // 1. Objek Kapsul
          tx.object(petId), // 2. Objek Pet
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Fed your pet successfully! Tx: ${response.digest}`);
      // --- INVALIDASI QUERY BARU ---
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error feeding pet: ${error.message}`);
    },
  });
}
