import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";

import { PACKAGE_ID, MODULE_NAME } from "@/constants/contract";

// BCS Schema untuk hasil dari smart contract (sebuah vektor/array dari string)
const StringVecBCS = bcs.vector(bcs.string());

export const queryKeyPetWardrobe = ({ petId }: { petId: string }) => [
  "pet-wardrobe",
  petId,
];

type UseQueryPetWardrobeParams = {
  capsuleId?: string;
  petId?: string;
};

/**
 * Hook untuk membaca isi dari lemari (wardrobe) milik Pet tertentu.
 * Memanggil fungsi view `get_pet_wardrobe_items`.
 */
export function useQueryPetWardrobe({
  capsuleId,
  petId,
}: UseQueryPetWardrobeParams) {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useQuery({
    queryKey: queryKeyPetWardrobe({ petId: petId || "" }),
    queryFn: async () => {
      if (!currentAccount || !capsuleId || !petId) return [];

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::get_pet_wardrobe_items`,
        arguments: [tx.object(capsuleId), tx.pure.id(petId)],
      });

      const result = await suiClient.devInspectTransactionBlock({
        sender: currentAccount.address,
        transactionBlock: tx,
      });

      const returnValues = result.results?.[0]?.returnValues;
      if (!returnValues || returnValues.length === 0) {
        return []; // Lemari kosong
      }

      const [returnValue] = returnValues;
      const bytes = new Uint8Array(returnValue[0]);

      // Parse hasil BCS menjadi array string, contoh: ["sunglasses"]
      try {
        const parsedItems = StringVecBCS.parse(bytes);
        return parsedItems;
      } catch (error) {
        console.error("Gagal mem-parsing hasil BCS dari wardrobe:", error);
        return [];
      }
    },
    enabled: !!currentAccount && !!capsuleId && !!petId,
  });
}
