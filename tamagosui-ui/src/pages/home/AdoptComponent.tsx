import { useState } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutateAdoptPet } from "@/hooks/useMutateAdoptPet";
import { useQueryUserPets } from "@/hooks/useQueryUserPets";

// Props baru untuk membuat komponen ini dinamis
type AdoptComponentProps = {
  isFirstPet: boolean;
  onAdopted: () => void;
};

const INITIAL_PET_IMAGE_URL =
  "https://raw.githubusercontent.com/xfajarr/stacklend/refs/heads/main/photo_2023-04-30_12-46-11.jpg";

export default function AdoptComponent({
  isFirstPet,
  onAdopted,
}: AdoptComponentProps) {
  const [petName, setPetName] = useState("");
  const { mutate: adoptPet, isPending: isAdopting } = useMutateAdoptPet();

  // Ambil data kapsul untuk adopsi Pet kedua dan seterusnya
  const { data } = useQueryUserPets();
  const capsuleId = data?.capsule?.id;

  const handleAdoptPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      toast.error("Please give your new pet a name!");
      return;
    }

    adoptPet(
      // Logika dinamis: kirim capsuleId jika bukan Pet pertama
      { name: petName, capsuleId: isFirstPet ? undefined : capsuleId },
      {
        onSuccess: () => {
          toast.success(`Welcome, ${petName}!`);
          onAdopted(); // Panggil callback untuk kembali ke layar pemilihan
        },
        onError: (error) => {
          toast.error("Failed to adopt pet: " + error.message);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-sm text-center shadow-hard border-2 border-primary">
      <CardHeader>
        {/* Judul dan deskripsi dinamis */}
        <CardTitle className="text-3xl">
          {isFirstPet ? "ADOPT YOUR FIRST PET" : "ADOPT A NEW COMPANION"}
        </CardTitle>
        <CardDescription>
          {isFirstPet ? "A new friend awaits!" : "Expand your family!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <img
            src={INITIAL_PET_IMAGE_URL}
            alt="Your new pet"
            className="w-40 h-40 mx-auto image-rendering-pixelated bg-secondary p-2 border-2 border-primary"
          />
        </div>

        <form onSubmit={handleAdoptPet} className="space-y-4">
          <div className="space-y-2">
            <p className="text-lg">What will you name it?</p>
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
              ) : // Teks tombol dinamis
              isFirstPet ? (
                "START YOUR JOURNEY"
              ) : (
                "ADOPT NOW"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
