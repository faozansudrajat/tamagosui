import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyEquipAccessory = ["mutate", "equip-accessory"];

// 1. UBAH PARAMETER (BUTUH accessoryId)
type UseMutateEquipAccessoryParams = {
  capsuleId: string;
  petId: string;
  accessoryId: string;
};

export function useMutateEquipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyEquipAccessory,
    mutationFn: async ({
      capsuleId,
      petId,
      accessoryId,
    }: UseMutateEquipAccessoryParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::equip_accessory`,
        // 2. PERBARUI ARGUMEN (3 ARGUMEN)
        arguments: [
          tx.object(capsuleId),
          tx.object(petId),
          tx.object(accessoryId),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Accessory equipped! Tx: ${response.digest}`);
      // 3. PERBARUI INVALIDASI QUERY
      queryClient.invalidateQueries({ queryKey: queryKeyUserPets() });
    },
    onError: (error) => {
      console.error("Error equipping accessory:", error);
      toast.error(`Error equipping accessory: ${error.message}`);
    },
  });
}
