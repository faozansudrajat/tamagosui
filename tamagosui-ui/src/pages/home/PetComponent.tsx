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
} from "lucide-react";
import { toast } from "sonner";

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
import { WardrobeManager } from "./components/Wardrobe";

import { useMutateCheckAndLevelUp } from "@/hooks/useMutateCheckLevel";
import { useMutateFeedPet } from "@/hooks/useMutateFeedPet";
import { useMutateLetPetSleep } from "@/hooks/useMutateLetPetSleep";
import { useMutatePlayWithPet } from "@/hooks/useMutatePlayWithPet";
import { useMutateWakeUpPet } from "@/hooks/useMutateWakeUpPet";
import { useMutateWorkForCoins } from "@/hooks/useMutateWorkForCoins";
import { useQueryGameBalance } from "@/hooks/useQueryGameBalance";
import { useQueryUserPets } from "@/hooks/useQueryUserPets"; // <-- BARU: Untuk mendapatkan capsuleId
import { useMutateBurnPet } from "@/hooks/useMutateBurnPet"; // <-- BARU: Untuk menghapus Pet

import type { PetStruct } from "@/types/Pet";

// --- 1. Perbarui Props untuk menerima 'onBack' ---
type PetComponentProps = {
  pet: PetStruct;
  onBack: () => void;
};

export default function PetComponent({ pet, onBack }: PetComponentProps) {
  // --- Ambil data game balance & data user (termasuk capsule) ---
  const { data: gameBalance, isLoading: isLoadingGameBalance } =
    useQueryGameBalance();
  const { data: userData } = useQueryUserPets(); // <-- BARU

  // State lokal untuk animasi stat
  const [displayStats, setDisplayStats] = useState(pet.stats);

  // --- Hooks untuk Aksi Pet ---
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
  const { mutate: burnPet, isPending: isBurning } = useMutateBurnPet(); // <-- BARU

  // Efek untuk memperbarui stat di UI
  useEffect(() => {
    setDisplayStats(pet.stats);
  }, [pet.stats]);

  // Efek untuk animasi stat saat tidur (tidak berubah)
  useEffect(() => {
    if (pet.isSleeping && !isWakingUp && gameBalance) {
      const intervalId = setInterval(() => {
        setDisplayStats((prev) => {
          const energyPerSecond =
            1000 / Number(gameBalance.sleep_energy_gain_ms);
          const hungerLossPerSecond =
            1000 / Number(gameBalance.sleep_hunger_loss_ms);
          const happinessLossPerSecond =
            1000 / Number(gameBalance.sleep_happiness_loss_ms);

          return {
            energy: Math.min(
              gameBalance.max_stat,
              prev.energy + energyPerSecond
            ),
            hunger: Math.max(0, prev.hunger - hungerLossPerSecond),
            happiness: Math.max(0, prev.happiness - happinessLossPerSecond),
          };
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [pet.isSleeping, isWakingUp, gameBalance]);

  // --- Fungsi untuk menghapus Pet ---
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
          onBack(); // Kembali ke layar pemilihan setelah berhasil
        },
        onError: (error) => {
          toast.error("Failed to burn pet: " + error.message);
        },
      }
    );
  };

  // Tampilkan loading jika game balance belum siap
  if (isLoadingGameBalance || !gameBalance)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl">Loading Game Rules...</h1>
      </div>
    );

  // Logika UI (tidak berubah)
  const isAnyActionPending =
    isFeeding || isPlaying || isSleeping || isWorking || isLevelingUp;

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

  // --- Helper untuk memanggil mutasi dengan capsuleId ---
  const callAction = (mutation: (args: any) => void) => {
    if (!userData?.capsule) return;
    mutation({ capsuleId: userData.capsule.id, petId: pet.id });
  };

  return (
    <TooltipProvider>
      {/* --- 2. Tambahkan tombol Kembali/Switch Pet --- */}
      <div className="w-full max-w-sm mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 border-2 border-primary shadow-hard-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Switch Pet
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
            {/* ... Bagian tombol aksi ... */}
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
          {/* --- 3. Tambahkan Tombol Burn Pet dengan Dialog Konfirmasi --- */}
          <CardFooter className="flex flex-col space-y-2">
            <WardrobeManager
              pet={pet}
              isAnyActionPending={isAnyActionPending || pet.isSleeping}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Burn Pet
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
