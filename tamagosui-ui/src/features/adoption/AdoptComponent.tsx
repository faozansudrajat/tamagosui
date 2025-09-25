import { useState } from "react";
import { toast } from "sonner";

// Komponen & Hook
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useMutateAdoptPet } from "@/hooks/useMutateAdoptPet";
import { useQueryUserPets } from "@/hooks/useQueryUserPets";
import { AdoptionForm } from "./AdoptionForm"; // <-- Impor komponen baru

type AdoptComponentProps = {
  isFirstPet: boolean;
  onAdopted: () => void;
};

export default function AdoptComponent({
  isFirstPet,
  onAdopted,
}: AdoptComponentProps) {
  const [petName, setPetName] = useState("");
  const { mutate: adoptPet, isPending: isAdopting } = useMutateAdoptPet();

  const { data } = useQueryUserPets();
  const capsuleId = data?.capsule?.id;

  const handleAdoptPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      toast.error("Please give your new pet a name!");
      return;
    }

    adoptPet(
      { name: petName, capsuleId: isFirstPet ? undefined : capsuleId },
      {
        onSuccess: () => {
          toast.success(`Welcome, ${petName}!`);
          onAdopted();
        },
        onError: (error) => {
          toast.error("Failed to adopt pet: " + error.message);
        },
      }
    );
  };

  // Siapkan props untuk diteruskan ke komponen form
  const formProps = {
    petName,
    setPetName,
    handleAdoptPet,
    isAdopting,
    isFirstPet,
  };

  if (isFirstPet) {
    return (
      <Card className="w-full max-w-sm text-center shadow-hard border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-3xl">ADOPT YOUR FIRST PET</CardTitle>
          <CardDescription>A new friend awaits!</CardDescription>
        </CardHeader>
        <CardContent>
          <AdoptionForm {...formProps} />
        </CardContent>
      </Card>
    );
  }

  return <AdoptionForm {...formProps} />;
}
