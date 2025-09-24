import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";
import { queryKeyEquippedAccessory } from "./useQueryEquippedAccessory";
import { queryKeyPetWardrobe } from "./useQueryPetWardrobe";

const mutationKey = ["mutate", "unequip-accessory"];

// PERBAIKAN: Parameter tidak lagi memerlukan info spesifik item
type UnequipAccessoryParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateUnequipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKey,
    mutationFn: async ({ capsuleId, petId }: UnequipAccessoryParams) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::unequip_accessory`,
        // PERBAIKAN: Hanya kirim capsuleId dan petId
        arguments: [tx.object(capsuleId), tx.object(petId)],
      });
      return signAndExecute({ transaction: tx });
    },
    onSuccess: (data, variables) => {
      toast.success("Accessory unequipped!");
      // Invalidate semua query yang relevan
      queryClient.invalidateQueries({
        queryKey: queryKeyUserPets(currentAccount?.address),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyEquippedAccessory({ petId: variables.petId }),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyPetWardrobe({ petId: variables.petId }),
      });
    },
    onError: (error) => {
      toast.error("Failed to unequip accessory: " + error.message);
    },
  });
}
