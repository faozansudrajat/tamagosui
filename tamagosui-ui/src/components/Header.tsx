// src/components/Header.tsx

import { ConnectButton } from "@mysten/dapp-kit";

export default function Header() {
  return (
    <header
      className={`
        sticky top-4 left-0 right-0 z-1
        w-[calc(100%-3rem)] mx-auto
        glass-style
        py-4
        border-amber-200"
      `}
    >
      <div className="container mx-auto flex h-16 items-between justify-between px-4">
        <div
          className={`
            p-3
            mr-auto
            flex items-center
          `}
        >
          <img
            src="/favicon.png"
            alt="Logo Tamagosui"
            className="h-10 w-10 mr-2"
          />
          <h1
            className="
              text-4xl font-extrabold tracking-tight uppercase 
              text-gray-700
              transition-all duration-200 ease-in-out
            "
          >
            TAMAGO
            <span className="text-[#6A9BF8]">SUI</span>
          </h1>
        </div>

        <ConnectButton />
      </div>
    </header>
  );
}
