import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyWakeUpPet = ["mutate", "wake-up-pet"];

// 1. UBAH PARAMETER
type UseMutateWakeUpPetParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateWakeUpPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyWakeUpPet,
    mutationFn: async ({ capsuleId, petId }: UseMutateWakeUpPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::wake_up_pet`,
        // 2. PERBARUI ARGUMEN (INGAT CLOCK_ID)
        arguments: [
          tx.object(capsuleId),
          tx.object(petId),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Good morning! Your pet is awake. Tx: ${response.digest}`);
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error waking up pet:", error);
      toast.error(`Error waking up pet: ${error.message}`);
    },
  });
}
