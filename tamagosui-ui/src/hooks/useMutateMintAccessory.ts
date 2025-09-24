import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";

const mutateKeyMintAccessory = ["mutate", "mint-accessory"];

export function useMutateMintAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyMintAccessory,
    mutationFn: async () => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::mint_accessory`,
        arguments: [],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (response) => {
      toast.success(`Accessory minted successfully! Tx: ${response.digest}`);

      // 2. HAPUS TANDA KURUNG () KARENA INI BUKAN FUNGSI
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
    },
    onError: (error) => {
      console.error("Error minting accessory:", error);
      toast.error(`Error minting accessory: ${error.message}`);
    },
  });
}
