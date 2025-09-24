// Perbaikan ada di baris impor di bawah ini

import { useMutateEquipAccessory } from "@/hooks/useMutateEquipAccessory";
import { useQueryOwnedAccessories } from "@/hooks/useQueryOwnedAccessories";
import { useMutateUnequipAccessory } from "@/hooks/useMutateUnequipAccessory";
import { useQueryUserPets } from "@/hooks/useQueryUserPets";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PetAccessoryStruct, PetStruct } from "@/types/Pet";

type WardrobeManagerProps = {
  pet: PetStruct;
  isAnyActionPending: boolean;
};

// Ini adalah komponen contoh, sesuaikan dengan UI Anda jika berbeda
export function WardrobeManager({
  pet,
  isAnyActionPending,
}: WardrobeManagerProps) {
  const { data: ownedAccessories, isLoading: isLoadingAccessories } =
    useQueryOwnedAccessories();
  const { data: userData } = useQueryUserPets();

  const { mutate: equipAccessory, isPending: isEquipping } =
    useMutateEquipAccessory();
  const { mutate: unequipAccessory, isPending: isUnequipping } =
    useMutateUnequipAccessory();

  const handleEquip = (accessoryId: string) => {
    if (!userData?.capsule) {
      toast.error("Capsule not found. Cannot equip accessory.");
      return;
    }
    equipAccessory({
      capsuleId: userData.capsule.id,
      petId: pet.id,
      accessoryId,
    });
  };

  const handleUnequip = () => {
    if (!userData?.capsule) {
      toast.error("Capsule not found. Cannot unequip accessory.");
      return;
    }
    unequipAccessory({
      capsuleId: userData.capsule.id,
      petId: pet.id,
    });
  };

  if (isLoadingAccessories) return <div>Loading wardrobe...</div>;

  return (
    <div className="p-4 border-t-2 border-primary">
      <h3 className="text-xl text-center mb-4">Wardrobe</h3>
      <div className="space-y-2">
        {ownedAccessories && ownedAccessories.length > 0 ? (
          ownedAccessories.map((acc: PetAccessoryStruct) => (
            <Button
              // PERBAIKAN DI SINI: Gunakan acc.id.id
              key={acc.id.id}
              // PERBAIKAN DI SINI: Gunakan acc.id.id
              onClick={() => handleEquip(acc.id.id)}
              disabled={isAnyActionPending || isEquipping || isUnequipping}
              className="w-full"
            >
              Equip {acc.name}
            </Button>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No accessories</p>
        )}
        <Button
          onClick={handleUnequip}
          disabled={isAnyActionPending || isEquipping || isUnequipping}
          variant="destructive"
          className="w-full"
        >
          Unequip Item
        </Button>
      </div>
    </div>
  );
}
