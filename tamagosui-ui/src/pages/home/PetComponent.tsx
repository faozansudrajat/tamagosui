import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CoinsIcon,
  HeartIcon,
  StarIcon,
  Loader2Icon,
  BatteryIcon,
  DrumstickIcon,
  PlayIcon,
  BedIcon,
  BriefcaseIcon,
  ZapIcon,
  ChevronUpIcon,
  Trash2,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Komponen UI
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatDisplay } from "./components/StatDisplay";
import { ActionButton } from "./components/ActionButton";

// Hooks Mutasi
import { useMutateCheckAndLevelUp } from "@/hooks/useMutateCheckLevel";
import { useMutateFeedPet } from "@/hooks/useMutateFeedPet";
import { useMutateLetPetSleep } from "@/hooks/useMutateLetPetSleep";
import { useMutatePlayWithPet } from "@/hooks/useMutatePlayWithPet";
import { useMutateWakeUpPet } from "@/hooks/useMutateWakeUpPet";
import { useMutateWorkForCoins } from "@/hooks/useMutateWorkForCoins";
import { useMutateBurnPet } from "@/hooks/useMutateBurnPet";
import { useMutateMintAccessory } from "@/hooks/useMutateMintAccessory";
import { useMutateEquipAccessory } from "@/hooks/useMutateEquipAccessory";
import { useMutateUnequipAccessory } from "@/hooks/useMutateUnequipAccessory";

// Hooks Query
import { useQueryGameBalance } from "@/hooks/useQueryGameBalance";
import { useQueryUserPets, queryKeyUserPets } from "@/hooks/useQueryUserPets";
import {
  useQueryEquippedAccessory,
  queryKeyEquippedAccessory,
} from "@/hooks/useQueryEquippedAccessory";
import {
  useQueryPetWardrobe,
  queryKeyPetWardrobe,
} from "@/hooks/useQueryPetWardrobe";

import type { PetStruct } from "@/types/Pet";

// ===============================================================================
// --- Komponen WardrobeManager ---
// Didefinisikan di sini untuk kemudahan, bisa dipindah ke file terpisah
// ===============================================================================
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
      itemName: "sunglasses", // Kirim nama item
    });
  };

  const handleUnequip = () => {
    if (!userData?.capsule) return;
    unequip({
      capsuleId: userData.capsule.id,
      petId: pet.id,
    });
  };

  const actionInProgress = isEquipping || isUnequipping;

  // Hanya tampilkan jika kacamata ada di lemari (tapi tidak dipakai) ATAU sedang dipakai
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
          )}
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
          )}
          Equip Sunglasses
        </Button>
      )}
    </div>
  );
}
// ===============================================================================

type PetComponentProps = {
  pet: PetStruct;
  onBack: () => void;
};

export default function PetComponent({ pet, onBack }: PetComponentProps) {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();
  const { data: gameBalance, isLoading: isLoadingGameBalance } =
    useQueryGameBalance();
  const { data: userData } = useQueryUserPets();
  const { data: equippedAccessory } = useQueryEquippedAccessory({
    petId: pet.id,
  });
  // Gunakan hook baru untuk membaca lemari Pet
  const { data: wardrobeItems } = useQueryPetWardrobe({
    capsuleId: userData?.capsule?.id,
    petId: pet.id,
  });

  const [displayStats, setDisplayStats] = useState(pet.stats);
  const { mutate: mutateFeedPet, isPending: isFeeding } = useMutateFeedPet();
  const { mutate: mutatePlayWithPet, isPending: isPlaying } =
    useMutatePlayWithPet();
  const { mutate: mutateWorkForCoins, isPending: isWorking } =
    useMutateWorkForCoins();
  const { mutate: mutateLetPetSleep, isPending: isSleeping } =
    useMutateLetPetSleep();
  const { mutate: mutateWakeUpPet, isPending: isWakingUp } =
    useMutateWakeUpPet();
  const { mutate: mutateLevelUp, isPending: isLevelingUp } =
    useMutateCheckAndLevelUp();
  const { mutate: burnPet, isPending: isBurning } = useMutateBurnPet();
  const { mutate: mintAccessory, isPending: isMinting } =
    useMutateMintAccessory();

  useEffect(() => {
    setDisplayStats(pet.stats);
  }, [pet.stats]);
  useEffect(() => {
    if (pet.isSleeping && !isWakingUp && gameBalance) {
      const intervalId = setInterval(() => {
        setDisplayStats((prev) => ({
          energy: Math.min(
            gameBalance.max_stat,
            prev.energy + 1000 / Number(gameBalance.sleep_energy_gain_ms)
          ),
          hunger: Math.max(
            0,
            prev.hunger - 1000 / Number(gameBalance.sleep_hunger_loss_ms)
          ),
          happiness: Math.max(
            0,
            prev.happiness - 1000 / Number(gameBalance.sleep_happiness_loss_ms)
          ),
        }));
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [pet.isSleeping, isWakingUp, gameBalance]);

  const handleBurnPet = () => {
    if (!userData?.capsule) {
      toast.error("Capsule not found. Cannot burn pet.");
      return;
    }
    burnPet(
      { capsuleId: userData.capsule.id, petId: pet.id },
      {
        onSuccess: () => {
          toast.success(`${pet.name} has been set free.`);
          onBack();
        },
        onError: (error) => {
          toast.error("Failed to burn pet: " + error.message);
        },
      }
    );
  };

  const handleMintAccessory = () => {
    if (!userData?.capsule) return;
    mintAccessory(
      {
        capsuleId: userData.capsule.id,
        petId: pet.id,
      },
      {
        onSuccess: () => {
          // Toast sudah ada di dalam hook, tapi invalidasi di sini penting
          queryClient.invalidateQueries({
            queryKey: queryKeyPetWardrobe({ petId: pet.id }),
          });
        },
      }
    );
  };

  if (isLoadingGameBalance || !gameBalance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl">Loading Game Rules...</h1>
      </div>
    );
  }

  const isAnyActionPending =
    isFeeding ||
    isPlaying ||
    isSleeping ||
    isWorking ||
    isLevelingUp ||
    isMinting;
  const canFeed =
    !pet.isSleeping &&
    pet.stats.hunger < gameBalance.max_stat &&
    pet.game_data.coins >= Number(gameBalance.feed_coins_cost);
  const canPlay =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.play_energy_loss &&
    pet.stats.hunger >= gameBalance.play_hunger_loss;
  const canWork =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.work_energy_loss &&
    pet.stats.happiness >= gameBalance.work_happiness_loss &&
    pet.stats.hunger >= gameBalance.work_hunger_loss;
  const canLevelUp =
    !pet.isSleeping &&
    pet.game_data.experience >=
      pet.game_data.level * Number(gameBalance.exp_per_level);

  // Logika kepemilikan yang benar dan final
  const isSunglassesEquipped = equippedAccessory?.name === "cool glasses";
  const hasSunglassesInWardrobe =
    wardrobeItems?.includes("sunglasses") ?? false;
  // Pet dianggap "memiliki" kacamata jika ada di lemari ATAU sedang dipakai.
  const petHasSunglasses = isSunglassesEquipped || hasSunglassesInWardrobe;

  const callAction = (mutation: (args: any, options: any) => void) => {
    if (!userData?.capsule) return;
    mutation(
      { capsuleId: userData.capsule.id, petId: pet.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: queryKeyUserPets(currentAccount?.address),
          });
        },
      }
    );
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-sm mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 border-2 border-primary shadow-hard-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Switch Pet
        </Button>
        <Card className="shadow-hard border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">{pet.name}</CardTitle>
            <CardDescription className="text-lg">
              Level {pet.game_data.level}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... Bagian gambar, stats, dan data game (tidak berubah) ... */}
            <div className="flex justify-center">
              <img
                src={pet.image_url}
                alt={pet.name}
                className="w-36 h-36 rounded-full border-4 border-primary/20 object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <CoinsIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold">{pet.game_data.coins}</span>
                  </TooltipTrigger>
                  <TooltipContent>Coins</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <span className="font-bold">
                      {pet.game_data.experience}
                    </span>
                    <StarIcon className="w-5 h-5 text-purple-500" />
                  </TooltipTrigger>
                  <TooltipContent>Experience Points (XP)</TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <StatDisplay
                  icon={<BatteryIcon className="text-green-500" />}
                  label="Energy"
                  value={displayStats.energy}
                />
                <StatDisplay
                  icon={<HeartIcon className="text-pink-500" />}
                  label="Happiness"
                  value={displayStats.happiness}
                />
                <StatDisplay
                  icon={<DrumstickIcon className="text-orange-500" />}
                  label="Hunger"
                  value={displayStats.hunger}
                />
              </div>
            </div>
            {/* ... Bagian tombol aksi (tidak berubah) ... */}
            <div className="pt-2">
              <Button
                onClick={() => callAction(mutateLevelUp)}
                disabled={!canLevelUp || isAnyActionPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLevelingUp && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!isLevelingUp && <ChevronUpIcon className="mr-2 h-4 w-4" />}
                Level Up!
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                onClick={() => callAction(mutateFeedPet)}
                disabled={!canFeed || isAnyActionPending}
                isPending={isFeeding}
                label="Feed"
                icon={<DrumstickIcon />}
              />
              <ActionButton
                onClick={() => callAction(mutatePlayWithPet)}
                disabled={!canPlay || isAnyActionPending}
                isPending={isPlaying}
                label="Play"
                icon={<PlayIcon />}
              />
              <div className="col-span-2">
                <ActionButton
                  onClick={() => callAction(mutateWorkForCoins)}
                  disabled={!canWork || isAnyActionPending}
                  isPending={isWorking}
                  label="Work"
                  icon={<BriefcaseIcon />}
                />
              </div>
            </div>
            <div className="col-span-2 pt-2">
              {pet.isSleeping ? (
                <Button
                  onClick={() => callAction(mutateWakeUpPet)}
                  disabled={isWakingUp}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  {isWakingUp && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!isWakingUp && <ZapIcon className="mr-2 h-4 w-4" />} Wake Up!
                </Button>
              ) : (
                <Button
                  onClick={() => callAction(mutateLetPetSleep)}
                  disabled={isAnyActionPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSleeping && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!isSleeping && <BedIcon className="mr-2 h-4 w-4" />} Sleep
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 pt-4">
            <div className="w-full space-y-2 border-t-2 border-primary/20 pt-4">
              {/* --- PERBAIKAN UTAMA DI SINI --- */}
              {/* Sembunyikan semua aksi wardrobe jika Pet sedang tidur */}
              {!pet.isSleeping ? (
                <>
                  {/* Tombol Mint hanya muncul jika Pet belum punya kacamata */}
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
                      )}
                      Mint Sunglasses
                    </Button>
                  )}
                  {/* Wardrobe Manager hanya akan menampilkan Equip/Unequip jika relevan */}
                  <WardrobeManager
                    pet={pet}
                    isAnyActionPending={isAnyActionPending}
                    hasSunglassesInWardrobe={hasSunglassesInWardrobe}
                    isSunglassesEquipped={isSunglassesEquipped}
                  />
                </>
              ) : (
                // Tampilkan pesan saat Pet tidur
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
                    <strong>{pet.name}</strong> free and remove its data from
                    the blockchain.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBurnPet}
                    disabled={isBurning}
                  >
                    {isBurning && (
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Yes, set {pet.name} free
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}
