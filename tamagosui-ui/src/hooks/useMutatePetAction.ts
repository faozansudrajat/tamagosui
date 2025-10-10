import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { useQueryClient } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/constants/contract";
import { queryKeyUserPets } from "./useQueryUserPets";
import { toast } from "react-hot-toast";

type PetAction =
  | "feed_pet"
  | "play_with_pet"
  | "work_for_coins"
  | "let_pet_sleep"
  | "wake_up_pet"
  | "mint_accessory"
  | "equip_accessory"
  | "unequip_accessory"
  | "check_and_level_up";

interface PetActionParams {
  action: PetAction;
  capsuleId: string;
  petId: string;
  extraArgs?: any[];
  onSuccess?: () => void;
}

export function useMutatePetAction() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  const execute = ({
    action,
    capsuleId,
    petId,
    extraArgs = [],
    onSuccess,
  }: PetActionParams) => {
    const tx = new Transaction();

    const finalArgs: any[] = [tx.object(capsuleId), tx.object(petId)];

    if (action === "equip_accessory" && extraArgs.length > 0) {
      finalArgs.push(tx.pure.string(extraArgs[0]));
    }

    if (action === "let_pet_sleep" || action === "wake_up_pet") {
      finalArgs.push(tx.object(SUI_CLOCK_OBJECT_ID));
    }

    tx.moveCall({
      target: `${PACKAGE_ID}::tamagosui::${action}`,
      arguments: finalArgs,
    });

    signAndExecute(
      { transaction: tx },
      {
        // 1. Tambahkan 'async' di sini
        onSuccess: async () => {
          const friendlyActionName = action.replace(/_/g, " ");
          toast.success(`Action '${friendlyActionName}' successful!`);

          // Tunggu 1.5 detik sebelum menyatakan data basi
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: queryKeyUserPets(account?.address),
            });
          }, 1000); // Jeda 1500ms atau 1 detik

          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(`Action failed: ${error.message}`);
        },
      }
    );
  };

  return { execute, isPending };
}
