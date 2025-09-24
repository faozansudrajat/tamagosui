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
import { queryKeyPetWardrobe } from "./useQueryPetWardrobe"; // <-- Import baru

const mutationKey = ["mutate", "equip-accessory"];

// PERUBAHAN: Parameter sekarang menerima `itemName`, bukan `accessoryId`.
type EquipAccessoryParams = {
  capsuleId: string;
  petId: string;
  itemName: string;
};

export function useMutateEquipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKey,
    mutationFn: async ({
      capsuleId,
      petId,
      itemName,
    }: EquipAccessoryParams) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::equip_accessory`,
        // PERUBAHAN: Kirim capsuleId, petId (sebagai objek), dan itemName (sebagai string).
        arguments: [
          tx.object(capsuleId),
          tx.object(petId),
          tx.pure.string(itemName),
        ],
      });
      return signAndExecute({ transaction: tx });
    },
    onSuccess: (data, variables) => {
      toast.success(`Equipped ${variables.itemName}!`);
      // Invalidate semua query yang relevan setelah berhasil.
      queryClient.invalidateQueries({
        queryKey: queryKeyUserPets(currentAccount?.address),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyEquippedAccessory({ petId: variables.petId }),
      });
      // PERUBAHAN: Invalidate juga query wardrobe untuk memperbarui isinya.
      queryClient.invalidateQueries({
        queryKey: queryKeyPetWardrobe({ petId: variables.petId }),
      });
    },
    onError: (error) => {
      toast.error("Failed to equip accessory: " + error.message);
    },
  });
}
