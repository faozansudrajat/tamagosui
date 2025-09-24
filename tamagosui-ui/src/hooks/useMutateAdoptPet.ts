import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";

import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";

type AdoptPetParams = {
  name: string;
  capsuleId?: string;
};

export function useMutateAdoptPet() {
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async ({ name, capsuleId }: AdoptPetParams) => {
      const tx = new Transaction();

      if (capsuleId) {
        // Alur untuk adopsi Pet KEDUA dan seterusnya (Tidak berubah)
        tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::adopt_pet`,
          arguments: [
            tx.object(capsuleId),
            tx.pure.string(name),
            tx.object(CLOCK_ID),
          ],
        });
      } else {
        // Alur untuk adopsi Pet PERTAMA (Sekarang sudah SINKRON)
        // Kita memanggil satu fungsi yang sudah diperbaiki di smart contract.
        tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::create_pet_owner_capsule`,
          arguments: [
            tx.pure.string(name), // <-- Argumen pertama: name
            tx.object(CLOCK_ID), // <-- Argumen kedua: clock
          ],
        });
      }

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
