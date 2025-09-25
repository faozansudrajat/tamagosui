import {
  CoinsIcon,
  StarIcon,
  BatteryIcon,
  HeartIcon,
  DrumstickIcon,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatDisplay } from "@/components/StatDisplay";
import type { PetStruct } from "@/types/Pet";

type PetStatsDisplayProps = {
  pet: PetStruct;
  displayStats: PetStruct["stats"];
};

export function PetStatsDisplay({ pet, displayStats }: PetStatsDisplayProps) {
  return (
    <TooltipProvider>
      <div className="flex justify-center">
        <img
          src={pet.image_url}
          alt={pet.name}
          className="w-36 h-36 rounded-full border-4 border-primary/20 object-cover"
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-lg">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2">
              <CoinsIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{pet.game_data.coins}</span>
            </TooltipTrigger>
            <TooltipContent>Coins</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2">
              <span className="font-bold">{pet.game_data.experience}</span>
              <StarIcon className="w-5 h-5 text-purple-500" />
            </TooltipTrigger>
            <TooltipContent>Experience Points (XP)</TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-2">
          <StatDisplay
            icon={<BatteryIcon className="text-green-500" />}
            label="Energy"
            value={displayStats.energy}
          />
          <StatDisplay
            icon={<HeartIcon className="text-pink-500" />}
            label="Happiness"
            value={displayStats.happiness}
          />
          <StatDisplay
            icon={<DrumstickIcon className="text-orange-500" />}
            label="Hunger"
            value={displayStats.hunger}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
