'use client';
import Image from 'next/image';
import type { Matchup } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export function MatchupCarousel({
  matchups,
  selectedMatchup,
  onSelectMatchup,
  selectedWeek = 16,  // Add this prop
}: {
  matchups: Matchup[];
  selectedMatchup: Matchup | null;
  onSelectMatchup: (matchup: Matchup) => void;
  selectedWeek?: number;
}) {
  const getTeamWeekScore = (team: Matchup['userTeam']) => {
    let score = 0;
    team.roster.starters.forEach((player: any) => {
      if (!player || !player.gameLog) return;

      // Check for legendary override
      const slotIndex = team.roster.starters.indexOf(player);
      const slotId = `STARTER-${slotIndex}`; // Adjust if your slot naming is different
      // Note: We don't have cards here — but since reveal updates gameLog.fpts, it's already in there!
      // If you want full override, pass cards to carousel later.

      const weekLog = player.gameLog.find((g: any) => g.week === selectedWeek);
      if (weekLog) score += weekLog.fpts || 0;
    });
    return score.toFixed(1);
  };

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2">
        {matchups.map(matchup => {
          const userScore = getTeamWeekScore(matchup.userTeam);
          const opponentScore = getTeamWeekScore(matchup.opponentTeam);

          return (
            <CarouselItem 
              key={`${matchup.userTeam.id}-vs-${matchup.opponentTeam.id}`} 
              className="basis-auto pl-2"
            >
              <div
                className="w-48 cursor-pointer"
                onClick={() => onSelectMatchup(matchup)}
              >
                <Card
                  className={cn(
                    'transition-colors',
                    selectedMatchup?.userTeam.id === matchup.userTeam.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border'
                  )}
                >
                  <CardContent className="flex flex-col items-center justify-center p-3 gap-2">
                    <div className="flex w-full justify-around items-center">
                      <div className="flex flex-col items-center gap-1">
                        <Image
                          src={matchup.userTeam.logoUrl}
                          alt={matchup.userTeam.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <span className="text-lg font-bold text-primary">
                          {userScore}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">vs</span>
                      <div className="flex flex-col items-center gap-1">
                        <Image
                          src={matchup.opponentTeam.logoUrl}
                          alt={matchup.opponentTeam.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <span className="text-lg font-bold text-primary">
                          {opponentScore}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex -left-4" />
      <CarouselNext className="hidden sm:flex -right-4" />
    </Carousel>
  );
}