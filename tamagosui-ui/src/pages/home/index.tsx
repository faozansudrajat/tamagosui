import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useCurrentAccount } from "@mysten/dapp-kit";
import backgroundImage from "@/assets/bg.png";

import { useQueryUserPets } from "@/hooks/useQueryUserPets";
import { useMutatePetAction } from "@/hooks/useMutatePetAction";

import AdoptComponent from "@/features/adoption/AdoptComponent";
import PetComponent from "@/features/pet-dashboard/PetComponent";
import { PetSidebar } from "@/features/adoption/PetSidebar";
import { WardrobeComponent } from "@/features/wardrobe/WardrobeComponent";

// 1. TAMBAHKAN "check_and_level_up" DI SINI
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

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { data, isPending: isUserPetsLoading } = useQueryUserPets();
  const { capsule, pets } = data || { capsule: null, pets: [] };
  const { execute: performAction, isPending: isActionPending } =
    useMutatePetAction();

  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [isAdopting, setIsAdopting] = useState(false);

  // --- DEFINISIKAN PENDING ACTION STATE DI SINI ---
  const [pendingAction, setPendingAction] = useState<PetAction | null>(null);

  // Efek untuk me-reset pendingAction setelah transaksi selesai
  useEffect(() => {
    if (!isActionPending) {
      setPendingAction(null);
    }
  }, [isActionPending]);

  const handleAction = (action: PetAction, extraArgs?: any[]) => {
    if (!capsule || !activePetId) return;
    // Set aksi yang sedang berjalan
    setPendingAction(action);
    performAction({
      action,
      capsuleId: capsule.id,
      petId: activePetId,
      extraArgs,
    });
  };

  useEffect(() => {
    const activePetExists = pets.some((p) => p.id === activePetId);
    if (activePetExists) {
      return;
    }

    if (pets.length > 0) {
      setActivePetId(pets[0].id);
    } else {
      setActivePetId(null);
    }
  }, [pets, activePetId]);

  const handleAdopted = () => {
    setIsAdopting(false);
  };

  const handleAdoptNew = () => {
    setIsAdopting(true);
  };

  const handleSelectPet = (petId: string) => {
    setActivePetId(petId);
  };

  const selectedPet = pets.find((p) => p.id === activePetId) || null;

  const renderContent = () => {
    const GLASS_CONTAINER_CLASSES =
      "glass-style w-120 max_w-md p-12 flex flex-col items-center";

    if (!currentAccount) {
      return (
        <div className={GLASS_CONTAINER_CLASSES}>
          <h2 className="text-3xl font-bold text-gray-700 mb-6 drop-shadow-md">
            Connect your wallet 💳
          </h2>
          <p className="mt-4 text-sm text-gray-700 drop-shadow-sm">
            Unlock the Tamagosui experience.
          </p>
        </div>
      );
    }

    if (isUserPetsLoading || !data) {
      return (
        <div className="glass-style w-120 max_w-md text-center p-12">
          <h2 className="text-3xl font-bold text-gray-700">
            Loading Pet Data...
          </h2>
        </div>
      );
    }

    if (!capsule) {
      return (
        <div className="w-120 max-w-md">
          <AdoptComponent isFirstPet={true} onAdopted={handleAdopted} />
        </div>
      );
    }

    return (
      <div className="grid w-full max_w-7xl grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-1">
          <PetSidebar
            pets={pets}
            activePetId={activePetId}
            onSelectPet={handleSelectPet}
            onAdoptNew={handleAdoptNew}
          />
        </div>

        <div className="lg:col-span-3">
          {selectedPet ? (
            <PetComponent
              pet={selectedPet}
              onAction={handleAction}
              isActionPending={isActionPending}
              pendingAction={pendingAction}
            />
          ) : (
            <div className="glass-style p-12 text-center flex flex-col justify-center items-center h-full">
              <h3 className="text-2xl font-bold text-gray-700">No Pets Yet!</h3>
              <p className="mt-2 text-gray-600">
                Click '+ Adopt New Pet' in the sidebar to get your first friend.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <WardrobeComponent
            pet={selectedPet}
            onAction={handleAction}
            isActionPending={isActionPending}
            pendingAction={pendingAction}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />

      <main className="flex flex-grow items-center justify-center p-8">
        {renderContent()}
      </main>

      {isAdopting && capsule && (
        <AdoptComponent
          isFirstPet={false}
          onAdopted={handleAdopted}
          isModal={true}
          capsuleId={capsule.id}
        />
      )}
    </div>
  );
}
