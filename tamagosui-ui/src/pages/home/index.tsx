import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Komponen & Hook
import Header from "@/components/Header";
import AdoptComponent from "@/features/adoption/AdoptComponent";
import PetComponent from "@/features/pet-dashboard/PetComponent";
import { PetSidebar } from "@/features/adoption/PetSidebar";
import { useQueryUserPets, queryKeyUserPets } from "@/hooks/useQueryUserPets";
import { useMutateBurnPet } from "@/hooks/useMutateBurnPet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();
  const { data, isPending: isUserPetsLoading } = useQueryUserPets();
  const { capsule, pets } = data || { capsule: null, pets: [] };

  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [isAdopting, setIsAdopting] = useState(false);
  const { mutate: burnPet, isPending: isBurning } = useMutateBurnPet();

  // --- PERBAIKAN 2: Buat useEffect menjadi lebih "pintar" ---
  useEffect(() => {
    // Cek apakah Pet yang aktif saat ini masih ada di dalam daftar Pet yang baru.
    const activePetStillExists = pets.some((p) => p.id === activePetId);

    if (activePetId && activePetStillExists) {
      // Jika Pet aktif masih ada, tidak perlu melakukan apa-apa.
      return;
    }

    // Jika Pet aktif sudah tidak ada (karena dihapus) atau belum ada yang dipilih,
    // pilih Pet pertama dari daftar yang tersisa.
    if (pets && pets.length > 0) {
      setActivePetId(pets[0].id);
    } else {
      // Jika tidak ada Pet tersisa, kosongkan pilihan.
      setActivePetId(null);
    }
  }, [pets, activePetId]); // <-- Jalankan efek ini setiap kali daftar `pets` berubah.

  const selectedPet = pets.find((p) => p.id === activePetId);

  // --- PERBAIKAN 1: Sederhanakan onSuccess di dalam handler ---
  const handlePetBurned = (petToBurnId: string) => {
    if (!capsule) return;

    burnPet(
      { capsuleId: capsule.id, petId: petToBurnId },
      {
        onSuccess: () => {
          toast.success("Your pet has been set free.");
          // Tugasnya sekarang hanya meminta data baru.
          // useEffect di atas akan menangani sisanya setelah data tiba.
          queryClient.invalidateQueries({
            queryKey: queryKeyUserPets(currentAccount?.address),
          });
        },
        onError: (error) => {
          toast.error("Failed to burn pet: " + error.message);
        },
      }
    );
  };

  const handleSelectPet = (petId: string) => {
    setActivePetId(petId);
    setIsAdopting(false);
  };

  const handleAdoptNew = () => {
    setIsAdopting(true);
  };

  const handleAdopted = () => {
    setIsAdopting(false);
  };

  const handleCancelAdopt = () => {
    setIsAdopting(false);
  };

  const renderContent = () => {
    if (isUserPetsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]">
            <h2 className="text-4xl uppercase">Loading Your Pets...</h2>
          </div>
        </div>
      );
    }

    if (!capsule) {
      return (
        <div className="flex items-center justify-center h-full">
          <AdoptComponent isFirstPet={true} onAdopted={() => {}} />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl">
        <div className="md:col-span-1">
          <PetSidebar
            pets={pets}
            activePetId={activePetId}
            onSelectPet={handleSelectPet}
            onAdoptNew={handleAdoptNew}
          />
        </div>
        <div className="md:col-span-3">
          {selectedPet ? (
            <PetComponent
              pet={selectedPet}
              onBack={() => {}}
              onPetBurned={() => handlePetBurned(selectedPet.id)}
              isBurningPet={isBurning}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8 border-4 border-dashed border-primary/50 bg-background/50 rounded-lg">
              <p className="text-xl text-gray-500">
                Select a pet from the left, <br /> or adopt a new one!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 pt-10 md:pt-10">
        {!currentAccount ? (
          <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]">
            <h2 className="text-4xl uppercase">Please Connect Wallet</h2>
          </div>
        ) : (
          renderContent()
        )}
      </main>
      <Dialog open={isAdopting} onOpenChange={setIsAdopting}>
        <DialogContent className="w-full max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">
              Adopt a New Pet
            </DialogTitle>
            <DialogDescription className="text-center">
              Expand your family!
            </DialogDescription>
          </DialogHeader>
          <AdoptComponent isFirstPet={false} onAdopted={handleAdopted} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
