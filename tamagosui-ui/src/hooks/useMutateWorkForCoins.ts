import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyWorkForCoins = ["mutate", "work-for-coins"];

// 1. UBAH PARAMETER
type UseMutateWorkForCoinsParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateWorkForCoins() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyWorkForCoins,
    mutationFn: async ({ capsuleId, petId }: UseMutateWorkForCoinsParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::work_for_coins`,
        // 2. PERBARUI ARGUMEN
        arguments: [tx.object(capsuleId), tx.object(petId)],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Your pet worked hard! Tx: ${response.digest}`);
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error working for coins:", error);
      toast.error(`Error working for coins: ${error.message}`);
    },
  });
}
