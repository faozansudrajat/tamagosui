import { Pet } from "@/types/Pet";
import { Button } from "@/components/ui/button";
import { StatBar } from "./components/StatBar";
import { Loader2 } from "lucide-react";

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

interface PetComponentProps {
  pet: Pet;
  onAction: (action: PetAction, extraArgs?: any[]) => void;
  isActionPending: boolean;
  pendingAction: PetAction | null;
}

export default function PetComponent({
  pet,
  onAction,
  isActionPending,
  pendingAction,
}: PetComponentProps) {
  const handleSleepToggle = () => {
    onAction(pet.isSleeping ? "wake_up_pet" : "let_pet_sleep");
  };

  const PLAY_COST = { energy: 15, hunger: 15 };
  const FEED_COST = { coins: 5 };
  const WORK_COST = { energy: 20, happiness: 20, hunger: 20 };
  const EXP_PER_LEVEL = 100;

  const canFeed = Number(pet.gameData.coins) >= FEED_COST.coins;
  const canPlay =
    pet.stats.energy >= PLAY_COST.energy &&
    pet.stats.hunger >= PLAY_COST.hunger;
  const canWork =
    pet.stats.energy >= WORK_COST.energy &&
    pet.stats.happiness >= WORK_COST.happiness &&
    pet.stats.hunger >= WORK_COST.hunger;

  const requiredExp = pet.gameData.level * EXP_PER_LEVEL;
  const canLevelUp = Number(pet.gameData.experience) >= requiredExp;

  return (
    <div className="glass-style p-8 rounded-lg flex flex-col items-center">
      {/* --- 1. Buat Wadah Posisi --- */}
      <div className="relative mb-6">
        <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* --- 2. Pindahkan Tombol Level Up ke Sini --- */}
        {canLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center left-30 top-30">
            <Button
              onClick={() => onAction("check_and_level_up")}
              disabled={isActionPending || pet.isSleeping}
              className="bg-purple-500 hover:bg-purple-600 text-white animate-pulse"
            >
              Level Up!
            </Button>
          </div>
        )}
      </div>

      {/* ... Sisa kode tidak berubah ... */}
      <h2 className="text-4xl font-bold text-gray-800">{pet.name}</h2>
      <p
        className={`mt-2 text-sm font-semibold ${
          pet.isSleeping ? "text-blue-500" : "text-green-500"
        }`}
      >
        {pet.isSleeping ? "Zzz... (Sleeping)" : "Awake & Active"}
      </p>

      <div className="w-full max-w-xs space-y-4 mt-6">
        <div className="flex gap-6 mt-4 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <p className="text-sm">
              Lvl: {pet.gameData.level} (EXP: {pet.gameData.experience})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <p className="text-sm">Coins: {pet.gameData.coins}</p>
          </div>
        </div>
        <StatBar
          icon="⚡"
          label="Energy"
          value={pet.stats.energy}
          className="[&>div]:bg-yellow-400"
        />
        <StatBar
          icon="😊"
          label="Happiness"
          value={pet.stats.happiness}
          className="[&>div]:bg-green-400"
        />
        <StatBar
          icon="🍔"
          label="Hunger"
          value={pet.stats.hunger}
          className="[&>div]:bg-orange-400"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button
          onClick={() => onAction("feed_pet")}
          disabled={!canFeed || isActionPending || pet.isSleeping}
        >
          {pendingAction === "feed_pet" ? (
            <>
              Feeding
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Feed"
          )}
        </Button>
        <Button
          onClick={() => onAction("play_with_pet")}
          disabled={!canPlay || isActionPending || pet.isSleeping}
        >
          {pendingAction === "play_with_pet" ? (
            <>
              Playing
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Play"
          )}
        </Button>
        <Button
          onClick={() => onAction("work_for_coins")}
          disabled={!canWork || isActionPending || pet.isSleeping}
        >
          {pendingAction === "work_for_coins" ? (
            <>
              Working
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            "Work"
          )}
        </Button>
        <Button
          onClick={handleSleepToggle}
          variant="outline"
          disabled={isActionPending}
        >
          {pendingAction === "let_pet_sleep" ||
          pendingAction === "wake_up_pet" ? (
            <>
              Please wait
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : pet.isSleeping ? (
            "Wake Up"
          ) : (
            "Sleep"
          )}
        </Button>
      </div>

      {/* --- Bagian Tombol Level Up yang lama sudah dihapus dari sini --- */}
    </div>
  );
}
