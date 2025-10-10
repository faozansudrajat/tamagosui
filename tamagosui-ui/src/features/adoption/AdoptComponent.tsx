// src/features/adoption/AdoptComponent.tsx

import { useState } from "react";
import { useMutateAdoptPet } from "@/hooks/useMutateAdoptPet";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Kita tidak perlu DialogHeader/Title lagi
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdoptComponentProps {
  isFirstPet: boolean;
  onAdopted: () => void;
  isModal?: boolean;
  capsuleId?: string;
}

export default function AdoptComponent({
  isFirstPet,
  onAdopted,
  isModal = false,
  capsuleId,
}: AdoptComponentProps) {
  const [petName, setPetName] = useState("");
  const { adopt, isPending } = useMutateAdoptPet();

  const handleAdopt = () => {
    adopt({
      petName,
      isFirstPet,
      capsuleId,
      onSuccess: onAdopted,
    });
  };

  const content = (
    <div className="flex flex-col items-center gap-6 p-8 text-center glass-style ">
      {/* 1. Tampilan Visual Pet */}
      <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
        {/* Gunakan gambar dari smart contract */}
        <img
          src={
            "https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidkhjpthergw2tcg6u5r344shgi2cdg5afmhgpf5bv34vqfrr7hni"
          }
          alt={"pet"}
          className="w-full h-full object-cover"
        />
      </div>

      {isFirstPet ? (
        <>
          <h2 className="text-3xl font-bold text-gray-800">
            Adopt Your First Pet!
          </h2>
          <p className="text-gray-600 -mt-4">Give your new pet a name</p>
          <Input
            type="text"
            placeholder="e.g. John Doe"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="text-center placeholder:text-gray-600 border-white"
            disabled={isPending}
          />
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-white">Adopt a New Pet!</h2>
          <p className="text-white -mt-4">Give your new pet a name</p>
          <Input
            type="text"
            placeholder="e.g. John Doe"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="text-center placeholder:text-gray-300 border-white"
            disabled={isPending}
          />
        </>
      )}

      <Button
        onClick={handleAdopt}
        disabled={isPending || !petName.trim()}
        className="w-full"
      >
        {isPending ? "Processing..." : "Adopt Now"}
      </Button>
    </div>
  );

  if (isModal) {
    return (
      <Dialog open={true} onOpenChange={onAdopted}>
        <DialogContent
          className="
        bg-transparent border-none shadow-none p-0 
        
        /* Posisi & Lapisan Tombol */
        [&>button]:absolute
        [&>button]:right-128
        [&>button]:-top-4
        
        /* Ukuran & Bentuk Tombol */
        [&>button]:h-8
        [&>button]:w-8
        [&>button]:rounded-full
        
        /* Efek Glass & Border */
        [&>button]:bg-white/10
        [&>button]:backdrop-blur-xl
        [&>button]:border
        [&>button]:border-white/40
        
        /* Centering Ikon 'X' */
        [&>button]:flex
        [&>button]:items-center
        [&>button]:justify-center

        /* Teks & Interaksi Hover */
        [&>button]:text-white
        [&>button]:opacity-70
        [&>button]:transition-all
        [&>button]:duration-200
        [&>button]:hover:opacity-100
        [&>button]:hover:bg-red-500/50
        [&>button]:hover:border-red-500/70
      "
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}
