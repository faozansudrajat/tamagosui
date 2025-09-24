import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
// PERUBAHAN: Kita sekarang perlu menginvalidasi data Pet, bukan data aksesori global.
import { queryKeyUserPets } from "./useQueryUserPets";

const mutationKeyMintAccessory = ["mutate", "mint-accessory-for-pet"];

// PERUBAHAN: Tipe parameter sekarang membutuhkan ID Pet spesifik.
type MintAccessoryForPetParams = {
  capsuleId: string;
  petId: string;
};

/**
 * Hook untuk menangani transaksi `mint_accessory` yang baru.
 * Fungsi ini sekarang menambahkan aksesori langsung ke Pet tertentu.
 */
export function useMutateMintAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyMintAccessory,
    mutationFn: async ({ capsuleId, petId }: MintAccessoryForPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::mint_accessory`,
        // PERUBAHAN: Kirim capsuleId dan petId ke smart contract.
        arguments: [tx.object(capsuleId), tx.object(petId)],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Successfully minted Cool Glasses! Tx: ${response.digest}`);
      // PERUBAHAN: Refresh data Pet untuk memperbarui UI (misalnya, wardrobe-nya).
      // Ini akan membuat hook `useQueryPetWardrobe` (yang akan kita buat) mengambil data baru.
      queryClient.invalidateQueries({
        queryKey: queryKeyUserPets(currentAccount?.address),
      });
    },
    onError: (error) => {
      console.error("Error minting accessory for pet:", error);
      toast.error(`Error minting accessory: ${error.message}`);
    },
  });
}
