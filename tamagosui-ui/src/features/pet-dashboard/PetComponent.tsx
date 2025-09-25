import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { usePetDashboard } from "./hooks/usePetDashboard";
import { PetStatsDisplay } from "./components/PetStatsDisplay";
import { PetActionsPanel } from "./components/PetActionsPanel";
import type { PetStruct } from "@/types/Pet";

// --- PERBAIKAN: Perbarui tipe props di sini ---
type PetComponentProps = {
  pet: PetStruct;
  onBack: () => void;
  onPetBurned: () => void; // Prop baru untuk menangani aksi burn
  isBurningPet: boolean; // Prop baru untuk status loading
};

export default function PetComponent({
  pet,
  onBack,
  onPetBurned,
  isBurningPet,
}: PetComponentProps) {
  const dashboard = usePetDashboard(pet, onBack);

  if (dashboard.isLoadingGameBalance) {
    return (
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl">Loading Game Rules...</h1>
      </div>
    );
  }

  return (
    <Card className="shadow-hard border-2 border-primary w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl">{pet.name}</CardTitle>
        <CardDescription className="text-lg">
          Level {pet.game_data.level}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <PetStatsDisplay pet={pet} displayStats={dashboard.displayStats} />
        <PetActionsPanel
          pet={pet}
          {...dashboard}
          // --- PERBAIKAN: Teruskan props baru ke panel aksi ---
          handleBurnPet={onPetBurned}
          isBurning={isBurningPet}
        />
      </CardContent>
    </Card>
  );
}
