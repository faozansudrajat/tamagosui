import { Pet } from "@/types/Pet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Definisikan tipe aksi agar komponen ini "tahu" nama-nama aksi yang ada
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

// Definisikan tipe untuk handleAction yang diterima dari parent
type ActionHandler = (action: any, extraArgs?: any[]) => void;

interface WardrobeComponentProps {
  pet: Pet | null; // Pet bisa null jika belum ada
  onAction: ActionHandler;
  isActionPending: boolean;
  pendingAction: PetAction | null;
}

export function WardrobeComponent({
  pet,
  onAction,
  isActionPending,
  pendingAction,
}: WardrobeComponentProps) {
  if (!pet) return null; // Jangan render apa-apa jika tidak ada pet aktif

  const petOwnsSunglasses = pet.hasSunglasses || pet.isSunglassesEquipped;

  return (
    <div className="glass-style p-8 rounded-lg flex flex-col items-center text-center">
      <h3 className="text-2xl font-bold text-gray-700 mb-4">Wardrobe</h3>

      {pet.hasSunglasses && !pet.isSunglassesEquipped ? (
        <img
          src="https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreigyivmq45od3jkryryi3w6t5j65hcnfh5kgwpi2ex7llf2i6se7de"
          alt="Sunglasses"
          className="w-32 h-32 object-contain mb-4 border-4 border-white p-1 rounded-lg shadow-lg"
        />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center text-gray-400 mb-4 bg-gray-100/20 rounded-lg border border-dashed border-gray-400">
          {pet.isSunglassesEquipped ? "Equipped" : "Empty"}
        </div>
      )}

      <div className="mt-auto w-full space-y-2">
        {!petOwnsSunglasses ? (
          <Button
            onClick={() => onAction("mint_accessory")}
            disabled={isActionPending}
            className="w-full"
          >
            {pendingAction === "mint_accessory" ? (
              <>
                Minting
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Mint Sunglasses"
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => onAction("equip_accessory", ["sunglasses"])}
              disabled={
                isActionPending || pet.isSunglassesEquipped || pet.isSleeping
              }
              className="w-full"
            >
              {pendingAction === "equip_accessory" ? (
                <>
                  Equipping
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Equip"
              )}
            </Button>
            <Button
              onClick={() => onAction("unequip_accessory")}
              disabled={
                isActionPending || !pet.isSunglassesEquipped || pet.isSleeping
              }
              className="w-full"
              variant="outline"
            >
              {pendingAction === "unequip_accessory" ? (
                <>
                  Unequipping
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Unequip"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
