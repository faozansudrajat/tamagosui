import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Hooks
import { useMutateCheckAndLevelUp } from "@/hooks/useMutateCheckLevel";
import { useMutateFeedPet } from "@/hooks/useMutateFeedPet";
import { useMutateLetPetSleep } from "@/hooks/useMutateLetPetSleep";
import { useMutatePlayWithPet } from "@/hooks/useMutatePlayWithPet";
import { useMutateWakeUpPet } from "@/hooks/useMutateWakeUpPet";
import { useMutateWorkForCoins } from "@/hooks/useMutateWorkForCoins";
import { useMutateBurnPet } from "@/hooks/useMutateBurnPet";
import { useMutateMintAccessory } from "@/hooks/useMutateMintAccessory";
import { useQueryGameBalance } from "@/hooks/useQueryGameBalance";
import { useQueryUserPets, queryKeyUserPets } from "@/hooks/useQueryUserPets";
import { useQueryEquippedAccessory } from "@/hooks/useQueryEquippedAccessory";
import {
  useQueryPetWardrobe,
  queryKeyPetWardrobe,
} from "@/hooks/useQueryPetWardrobe";

import type { PetStruct } from "@/types/Pet";

/**
 * Custom hook ini menampung semua logika bisnis untuk dasbor Pet.
 */
export function usePetDashboard(pet: PetStruct, onBack: () => void) {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();

  // --- 1. PENGAMBILAN DATA ---
  const { data: gameBalance, isLoading: isLoadingGameBalance } =
    useQueryGameBalance();
  const { data: userData } = useQueryUserPets();
  const { data: equippedAccessory } = useQueryEquippedAccessory({
    petId: pet.id,
  });
  const { data: wardrobeItems } = useQueryPetWardrobe({
    capsuleId: userData?.capsule?.id,
    petId: pet.id,
  });

  // --- 2. STATE LOKAL ---
  const [displayStats, setDisplayStats] = useState(pet.stats);

  // --- 3. MUTASI (AKSI) ---
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

  // --- 4. EFEK SAMPING ---
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

  // --- 5. FUNGSI HANDLER ---
  const handleBurnPet = () => {
    if (!userData?.capsule) return;
    burnPet(
      { capsuleId: userData.capsule.id, petId: pet.id },
      {
        onSuccess: () => {
          toast.success(`${pet.name} has been set free.`);
          onBack();
        },
        onError: (error) => toast.error("Failed to burn pet: " + error.message),
      }
    );
  };

  const handleMintAccessory = () => {
    if (!userData?.capsule) return;
    mintAccessory(
      { capsuleId: userData.capsule.id, petId: pet.id },
      {
        onSuccess: () => {
          toast.success("Sunglasses are now in the wardrobe!");
          queryClient.invalidateQueries({
            queryKey: queryKeyPetWardrobe({ petId: pet.id }),
          });
        },
        onError: (error) => toast.error("Failed to mint: " + error.message),
      }
    );
  };

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

  // --- 6. KALKULASI & DATA TURUNAN ---
  const isAnyActionPending =
    isFeeding ||
    isPlaying ||
    isSleeping ||
    isWorking ||
    isLevelingUp ||
    isMinting;

  // PERBAIKAN: Gunakan `!!` untuk memastikan nilai selalu boolean (true/false)
  const canFeed = !!(
    !pet.isSleeping &&
    gameBalance &&
    pet.stats.hunger < gameBalance.max_stat &&
    pet.game_data.coins >= Number(gameBalance.feed_coins_cost)
  );
  const canPlay = !!(
    !pet.isSleeping &&
    gameBalance &&
    pet.stats.energy >= gameBalance.play_energy_loss &&
    pet.stats.hunger >= gameBalance.play_hunger_loss
  );
  const canWork = !!(
    !pet.isSleeping &&
    gameBalance &&
    pet.stats.energy >= gameBalance.work_energy_loss &&
    pet.stats.happiness >= gameBalance.work_happiness_loss &&
    pet.stats.hunger >= gameBalance.work_hunger_loss
  );
  const canLevelUp = !!(
    !pet.isSleeping &&
    gameBalance &&
    pet.game_data.experience >=
      pet.game_data.level * Number(gameBalance.exp_per_level)
  );

  const isSunglassesEquipped = equippedAccessory?.name === "cool glasses";
  const hasSunglassesInWardrobe =
    wardrobeItems?.includes("sunglasses") ?? false;
  const petHasSunglasses = isSunglassesEquipped || hasSunglassesInWardrobe;

  // --- 7. KEMBALIKAN SEMUA YANG DIBUTUHKAN UI ---
  return {
    isLoadingGameBalance,
    displayStats,
    petHasSunglasses,
    hasSunglassesInWardrobe,
    isSunglassesEquipped,
    isAnyActionPending,
    isLevelingUp,
    isMinting,
    isBurning,
    isWakingUp,
    canFeed,
    canPlay,
    canWork,
    canLevelUp,
    handleBurnPet,
    handleMintAccessory,
    callAction,
    mutations: {
      mutateFeedPet,
      mutatePlayWithPet,
      mutateWorkForCoins,
      mutateLetPetSleep,
      mutateWakeUpPet,
      mutateLevelUp,
    },
  };
}
