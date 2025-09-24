import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

type BurnPetParams = {
  capsuleId: string;
  petId: string;
};

export function useMutateBurnPet() {
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ capsuleId, petId }: BurnPetParams) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::burn_pet`,
        arguments: [tx.object(capsuleId), tx.object(petId)],
      });

      return signAndExecuteTransaction({
        transaction: tx,
        chain: "sui:testnet",
      });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeyUserPets(),
      });
    },
  });
}
