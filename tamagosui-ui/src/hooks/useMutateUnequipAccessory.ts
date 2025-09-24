import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyUnequipAccessory = ["mutate", "unequip-accessory"];

// 1. UBAH PARAMETER
type UseMutateUnequipAccessoryParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateUnequipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyUnequipAccessory,
    mutationFn: async ({
      capsuleId,
      petId,
    }: UseMutateUnequipAccessoryParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::unequip_accessory`,
        // 2. PERBARUI ARGUMEN
        arguments: [tx.object(capsuleId), tx.object(petId)],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Accessory unequipped! Tx: ${response.digest}`);
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error unequipping accessory:", error);
      toast.error(`Error unequipping accessory: ${error.message}`);
    },
  });
}
