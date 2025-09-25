import {
  Loader2Icon,
  ChevronUpIcon,
  DrumstickIcon,
  PlayIcon,
  BriefcaseIcon,
  ZapIcon,
  BedIcon,
  SparklesIcon,
  Trash2,
} from "lucide-react";

// Komponen & Hook
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ActionButton";
// --- PERBAIKAN: Impor CardFooter dari shadcn/ui ---
import { CardFooter } from "@/components/ui/card";
import { useMutateEquipAccessory } from "@/hooks/useMutateEquipAccessory";
import { useMutateUnequipAccessory } from "@/hooks/useMutateUnequipAccessory";
import { useQueryUserPets } from "@/hooks/useQueryUserPets";
import type { PetStruct } from "@/types/Pet";

// --- Sub-komponen untuk Wardrobe ---
type WardrobeManagerProps = {
  pet: PetStruct;
  isAnyActionPending: boolean;
  hasSunglassesInWardrobe: boolean;
  isSunglassesEquipped: boolean;
};

function WardrobeManager({
  pet,
  isAnyActionPending,
  hasSunglassesInWardrobe,
  isSunglassesEquipped,
}: WardrobeManagerProps) {
  const { data: userData } = useQueryUserPets();
  const { mutate: equip, isPending: isEquipping } = useMutateEquipAccessory();
  const { mutate: unequip, isPending: isUnequipping } =
    useMutateUnequipAccessory();

  const handleEquip = () => {
    if (!userData?.capsule) return;
    equip({
      capsuleId: userData.capsule.id,
      petId: pet.id,
      itemName: "sunglasses",
    });
  };

  const handleUnequip = () => {
    if (!userData?.capsule) return;
    unequip({ capsuleId: userData.capsule.id, petId: pet.id });
  };

  const actionInProgress = isEquipping || isUnequipping;

  if (!hasSunglassesInWardrobe && !isSunglassesEquipped) {
    return null;
  }

  return (
    <div className="w-full">
      {isSunglassesEquipped ? (
        <Button
          onClick={handleUnequip}
          disabled={isAnyActionPending || actionInProgress}
          variant="outline"
          className="w-full"
        >
          {actionInProgress && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}{" "}
          Unequip Sunglasses
        </Button>
      ) : (
        <Button
          onClick={handleEquip}
          disabled={isAnyActionPending || actionInProgress}
          className="w-full"
        >
          {actionInProgress && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}{" "}
          Equip Sunglasses
        </Button>
      )}
    </div>
  );
}

// --- Komponen Panel Aksi Utama ---
type PetActionsPanelProps = {
  pet: PetStruct;
  // Status
  isAnyActionPending: boolean;
  isLevelingUp: boolean;
  isMinting: boolean;
  isBurning: boolean;
  isWakingUp: boolean;
  // Kondisi
  canLevelUp: boolean;
  canFeed: boolean;
  canPlay: boolean;
  canWork: boolean;
  // Data Wardrobe
  petHasSunglasses: boolean;
  hasSunglassesInWardrobe: boolean;
  isSunglassesEquipped: boolean;
  // Handler
  handleBurnPet: () => void;
  handleMintAccessory: () => void;
  callAction: (mutation: (args: any, options: any) => void) => void;
  mutations: any;
};

export function PetActionsPanel({
  pet,
  isAnyActionPending,
  isLevelingUp,
  isMinting,
  isBurning,
  isWakingUp,
  canLevelUp,
  canFeed,
  canPlay,
  canWork,
  petHasSunglasses,
  hasSunglassesInWardrobe,
  isSunglassesEquipped,
  handleBurnPet,
  handleMintAccessory,
  callAction,
  mutations,
}: PetActionsPanelProps) {
  return (
    <>
      <div className="pt-2">
        <Button
          onClick={() => callAction(mutations.mutateLevelUp)}
          disabled={!canLevelUp || isAnyActionPending}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLevelingUp ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ChevronUpIcon className="mr-2 h-4 w-4" />
          )}{" "}
          Level Up!
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          onClick={() => callAction(mutations.mutateFeedPet)}
          disabled={!canFeed || isAnyActionPending}
          isPending={isAnyActionPending && !isMinting && !isBurning}
          label="Feed"
          icon={<DrumstickIcon />}
        />
        <ActionButton
          onClick={() => callAction(mutations.mutatePlayWithPet)}
          disabled={!canPlay || isAnyActionPending}
          isPending={isAnyActionPending && !isMinting && !isBurning}
          label="Play"
          icon={<PlayIcon />}
        />
        <div className="col-span-2">
          <ActionButton
            onClick={() => callAction(mutations.mutateWorkForCoins)}
            disabled={!canWork || isAnyActionPending}
            isPending={isAnyActionPending && !isMinting && !isBurning}
            label="Work"
            icon={<BriefcaseIcon />}
          />
        </div>
      </div>
      <div className="col-span-2 pt-2">
        {pet.isSleeping ? (
          <Button
            onClick={() => callAction(mutations.mutateWakeUpPet)}
            disabled={isWakingUp}
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            {isWakingUp ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ZapIcon className="mr-2 h-4 w-4" />
            )}{" "}
            Wake Up!
          </Button>
        ) : (
          <Button
            onClick={() => callAction(mutations.mutateLetPetSleep)}
            disabled={isAnyActionPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAnyActionPending && !isWakingUp ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BedIcon className="mr-2 h-4 w-4" />
            )}{" "}
            Sleep
          </Button>
        )}
      </div>
      <CardFooter className="flex flex-col space-y-2 pt-4">
        <div className="w-full space-y-2 border-t-2 border-primary/20 pt-4">
          {!pet.isSleeping ? (
            <>
              {!petHasSunglasses && (
                <Button
                  onClick={handleMintAccessory}
                  disabled={isAnyActionPending}
                  className="w-full bg-pink-500 hover:bg-pink-600"
                >
                  {isMinting ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SparklesIcon className="mr-2 h-4 w-4" />
                  )}{" "}
                  Mint Sunglasses
                </Button>
              )}
              <WardrobeManager
                pet={pet}
                isAnyActionPending={isAnyActionPending || pet.isSleeping}
                hasSunglassesInWardrobe={hasSunglassesInWardrobe}
                isSunglassesEquipped={isSunglassesEquipped}
              />
            </>
          ) : (
            <div className="text-center text-gray-500 text-sm p-2 italic">
              {pet.name} is sleeping... Zzz
            </div>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Burn Pet
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently set{" "}
                <strong>{pet.name}</strong> free and remove its data from the
                blockchain.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBurnPet} disabled={isBurning}>
                {isBurning && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Yes, set {pet.name} free
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </>
  );
}
