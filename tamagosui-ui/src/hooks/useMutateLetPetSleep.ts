import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyLetPetSleep = ["mutate", "let-pet-sleep"];

// 1. UBAH PARAMETER
type UseMutateLetPetSleepParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateLetPetSleep() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyLetPetSleep,
    mutationFn: async ({ capsuleId, petId }: UseMutateLetPetSleepParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::let_pet_sleep`,
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
      toast.info(`Zzz... Your pet is now sleeping. Tx: ${response.digest}`);
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error letting pet sleep:", error);
      toast.error(`Error letting pet sleep: ${error.message}`);
    },
  });
}
