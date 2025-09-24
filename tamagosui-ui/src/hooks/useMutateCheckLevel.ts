import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyCheckLevel = ["mutate", "check-level"];

// 1. UBAH PARAMETER
type UseMutateCheckAndLevelUpParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateCheckAndLevelUp() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyCheckLevel,
    mutationFn: async ({
      capsuleId,
      petId,
    }: UseMutateCheckAndLevelUpParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::check_and_level_up`,
        // 2. PERBARUI ARGUMEN
        arguments: [tx.object(capsuleId), tx.object(petId)],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(
        `Level Up! Your pet is stronger now. Tx: ${response.digest}`
      );
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error leveling up:", error);
      toast.error(`Error leveling up: ${error.message}`);
    },
  });
}
