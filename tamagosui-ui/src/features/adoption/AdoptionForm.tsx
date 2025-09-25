import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Tipe props untuk komponen form
type AdoptionFormProps = {
  petName: string;
  setPetName: (name: string) => void;
  handleAdoptPet: (e: React.FormEvent) => void;
  isAdopting: boolean;
  isFirstPet: boolean;
};

const INITIAL_PET_IMAGE_URL =
  "https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidkhjpthergw2tcg6u5r344shgi2cdg5afmhgpf5bv34vqfrr7hni";

export function AdoptionForm({
  petName,
  setPetName,
  handleAdoptPet,
  isAdopting,
  isFirstPet,
}: AdoptionFormProps) {
  return (
    <div className="space-y-6 pt-4">
      <div>
        <img
          src={INITIAL_PET_IMAGE_URL}
          alt="Your new pet"
          className="w-40 h-40 mx-auto image-rendering-pixelated bg-secondary p-2 border-2 border-primary"
        />
      </div>
      <form onSubmit={handleAdoptPet} className="space-y-4">
        <div className="space-y-2">
          <p className="text-lg text-center">What will you name it?</p>
          <Input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="Enter pet's name"
            disabled={isAdopting}
            className="text-center text-lg border-2 border-primary focus:ring-2 focus:ring-offset-2 focus:ring-ring"
          />
        </div>
        <div>
          <Button
            type="submit"
            disabled={!petName.trim() || isAdopting}
            className="w-full text-lg py-6 border-2 border-primary shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            {isAdopting ? (
              <>
                <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                Adopting...
              </>
            ) : isFirstPet ? (
              "START YOUR JOURNEY"
            ) : (
              "ADOPT NOW"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
