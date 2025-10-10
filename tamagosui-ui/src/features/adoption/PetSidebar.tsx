import React from "react";
import { Pet } from "@/types/Pet"; // Mengimpor tipe Pet yang sudah bersih

interface PetSidebarProps {
  pets: Pet[];
  activePetId: string | null;
  onSelectPet: (petId: string) => void;
  onAdoptNew: () => void;
}

export function PetSidebar({
  pets,
  activePetId,
  onSelectPet,
  onAdoptNew,
}: PetSidebarProps) {
  return (
    <div className="glass-style p-4 rounded-xl space-y-4 h-full">
      <h3 className="text-xl font-bold text-gray-700">
        My Pets: {pets.length}
      </h3>

      {pets.length === 0 ? (
        <p className="text-gray-500">No pets yet. Adopt now!</p>
      ) : (
        <ul className="space-y-2">
          {pets.map((pet) => {
            return (
              <li
                key={pet.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  pet.id === activePetId
                    ? "bg-blue-100/30 font-semibold"
                    : "hover:bg-white/50"
                }`}
                onClick={() => onSelectPet(pet.id)}
              >
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-white/50"
                />
                <span>
                  {pet.name} (Lvl {pet.gameData.level})
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={onAdoptNew}
        className="w-full bg-green-500 text-white py-2 rounded-lg mt-4"
      >
        + Adopt New Pet
      </button>
    </div>
  );
}
