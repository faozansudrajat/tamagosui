import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets"; // <-- Perhatikan import ini

const mutationKeyPlayWithPet = ["mutate", "play-with-pet"];

// 1. UBAH PARAMETER
type UseMutatePlayWithPetParams = {
  capsuleId: string;
  petId: string;
};

export function useMutatePlayWithPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyPlayWithPet,
    mutationFn: async ({ capsuleId, petId }: UseMutatePlayWithPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::play_with_pet`,
        // 2. PERBARUI ARGUMEN
        arguments: [
          tx.object(capsuleId), // Argumen pertama
          tx.object(petId), // Argumen kedua
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Played with your pet! Tx: ${response.digest}`);
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error playing with pet:", error);
      toast.error(`Error playing with pet: ${error.message}`);
    },
  });
}
