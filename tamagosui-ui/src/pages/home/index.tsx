import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

import { useQueryUserPets } from "@/hooks/useQueryUserPets"; // <-- Ganti hook
import Header from "@/components/Header";
import AdoptComponent from "./AdoptComponent";
import PetComponent from "./PetComponent";
import PetSelectionComponent from "./PetSelectionComponent"; // <-- Komponen baru

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  // Gunakan hook baru dan ambil data capsule & pets
  const { data, isPending: isUserPetsLoading } = useQueryUserPets();
  const { capsule, pets } = data || { capsule: null, pets: [] };

  // State untuk melacak Pet yang sedang dipilih, atau mode 'adopsi'
  const [activeView, setActiveView] = useState<"select" | "adopt" | string>(
    "select"
  );

  // Cari objek Pet yang lengkap berdasarkan ID yang aktif
  const selectedPet = pets.find((p) => p.id === activeView);

  const renderContent = () => {
    // 1. Tampilkan loading jika wallet terhubung tapi data belum siap
    if (isUserPetsLoading) {
      return (
        <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]">
          <h2 className="text-4xl uppercase">Loading Your Pets...</h2>
        </div>
      );
    }

    // 2. Jika tidak ada kapsul, user ini baru. Paksa adopsi pertama.
    if (!capsule) {
      return <AdoptComponent isFirstPet={true} onAdopted={() => {}} />;
    }

    // 3. Jika ada Pet yang dipilih, tampilkan komponen interaksinya
    if (selectedPet) {
      return (
        <PetComponent
          pet={selectedPet}
          // Tambahkan prop onBack agar user bisa kembali ke pemilihan
          onBack={() => setActiveView("select")}
        />
      );
    }

    // 4. Jika sedang dalam mode 'adopsi'
    if (activeView === "adopt") {
      return (
        <AdoptComponent
          isFirstPet={false}
          // Setelah adopsi, kembali ke layar pemilihan
          onAdopted={() => setActiveView("select")}
        />
      );
    }

    // 5. Tampilan default: layar pemilihan Pet
    return (
      <PetSelectionComponent
        pets={pets}
        onSelectPet={(petId) => setActiveView(petId)}
        onAdoptNew={() => setActiveView("adopt")}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pt-24">
        {!currentAccount ? (
          <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]">
            <h2 className="text-4xl uppercase">Please Connect Wallet</h2>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}
