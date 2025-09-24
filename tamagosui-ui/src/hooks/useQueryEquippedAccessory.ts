import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { getSuiObjectFields } from "@/lib/utils";
import type { SuiWrappedDynamicField, PetAccessoryStruct } from "@/types/Pet";

// SOLUSI JANGKA PANJANG 2: Ubah menjadi fungsi agar cache bisa per-pet
export const queryKeyEquippedAccessory = ({ petId }: { petId: string }) => [
  "equipped-accessory",
  petId,
];

type UseQueryEquippedAccessoryParams = {
  petId?: string;
};

export function useQueryEquippedAccessory({
  petId,
}: UseQueryEquippedAccessoryParams) {
  const suiClient = useSuiClient();

  return useQuery({
    // Gunakan fungsi untuk membuat key yang dinamis
    queryKey: queryKeyEquippedAccessory({ petId: petId ?? "" }),
    queryFn: async () => {
      if (!petId) return;

      const dynamicFields = await suiClient.getDynamicFields({
        parentId: petId,
      });
      const accessoryField = dynamicFields.data.find(
        (field) =>
          field.name.type === "0x1::string::String" &&
          field.name.value === "equipped_item"
      );

      if (!accessoryField) return null;

      const fieldObjectResponse = await suiClient.getDynamicFieldObject({
        parentId: petId,
        name: accessoryField.name,
      });

      const wrappedField =
        getSuiObjectFields<SuiWrappedDynamicField<PetAccessoryStruct>>(
          fieldObjectResponse
        );

      if (wrappedField && wrappedField.value && wrappedField.value.fields)
        return wrappedField.value.fields;

      return null;
    },
    enabled: !!petId,
  });
}
