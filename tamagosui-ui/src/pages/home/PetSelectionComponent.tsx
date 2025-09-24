import { PetStruct } from "@/types/Pet";
import { Button } from "@/components/ui/button";

type PetSelectionComponentProps = {
  pets: PetStruct[];
  onSelectPet: (petId: string) => void;
  onAdoptNew: () => void;
};

export default function PetSelectionComponent({
  pets,
  onSelectPet,
  onAdoptNew,
}: PetSelectionComponentProps) {
  return (
    <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000] w-full max-w-md">
      <h2 className="text-4xl uppercase mb-6">Choose Your Pet</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => onSelectPet(pet.id)}
            className="p-4 border-2 border-primary bg-secondary hover:bg-primary/20 transition-colors flex flex-col items-center gap-2"
          >
            <img
              src={pet.image_url}
              alt={pet.name}
              className="w-24 h-24 object-cover border-2 border-primary"
            />
            <span className="text-lg font-semibold uppercase">{pet.name}</span>
            <span className="text-sm">Lvl. {pet.game_data.level}</span>
          </button>
        ))}
      </div>
      <Button onClick={onAdoptNew} size="lg" className="w-full">
        Adopt a New Pet
      </Button>
    </div>
  );
}
