import { Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PetStruct } from "@/types/Pet";

// Impor komponen DropdownMenu dari shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type PetSidebarProps = {
  pets: PetStruct[];
  activePetId: string | null;
  onSelectPet: (petId: string) => void;
  onAdoptNew: () => void;
};

export function PetSidebar({
  pets,
  activePetId,
  onSelectPet,
  onAdoptNew,
}: PetSidebarProps) {
  // Cari objek Pet yang sedang aktif untuk ditampilkan
  const activePet = pets.find((p) => p.id === activePetId);

  return (
    <aside className="bg-background border-2 border-primary shadow-hard-sm p-4 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-wider">
          Your Pets
        </h3>

        {/* Jika ada Pet yang aktif, tampilkan sebagai pemicu dropdown */}
        {activePet ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-auto p-2 border-2 border-primary/50 flex flex-col items-center"
              >
                <img
                  src={activePet.image_url}
                  alt={activePet.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex items-center mt-2">
                  <span className="text-sm font-semibold truncate">
                    {activePet.name}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {/* Daftar semua Pet di dalam dropdown */}
              {pets.map((pet) => (
                <DropdownMenuItem
                  key={pet.id}
                  onClick={() => onSelectPet(pet.id)}
                  disabled={pet.id === activePetId}
                >
                  <img
                    src={pet.image_url}
                    alt={pet.name}
                    className="w-6 h-6 rounded-full object-cover mr-2"
                  />
                  <span>{pet.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Tampilan jika tidak ada Pet yang dipilih (misalnya saat memuat)
          <div className="w-full h-[108px] flex items-center justify-center text-gray-500">
            No active pet
          </div>
        )}

        {/* Tombol "Adopt a New Pet" tetap di bawah */}
        <button
          onClick={onAdoptNew}
          className="flex items-center justify-center w-20 h-20 bg-secondary border-2 border-dashed border-primary/50 rounded-full transition-all hover:bg-primary/10 hover:border-primary"
          aria-label="Adopt a new pet"
        >
          <Plus className="h-8 w-8 text-primary/80" />
        </button>
      </div>
    </aside>
  );
}
