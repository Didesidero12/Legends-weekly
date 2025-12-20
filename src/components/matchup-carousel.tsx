
'use client';
import Image from 'next/image';
import type { Matchup, Roster, Team } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const EMPTY_ROSTER: Roster = { starters: [], bench: [], ir: [] };

function getScore(team: Team) {
    if (!team) return 0;
    const roster = team.roster ?? EMPTY_ROSTER;
    return (roster.starters || []).reduce((sum: number, p: any) => sum + (p?.actualPoints ?? 0), 0);
}


export function MatchupCarousel({
  matchups,
  selectedMatchup,
  onSelectMatchup,
}: {
  matchups: Matchup[];
  selectedMatchup: Matchup | null;
  onSelectMatchup: (matchup: Matchup) => void;
}) {

  // We need local state for scores to mock real-time updates
  const [localScores, setLocalScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialScores: Record<string, number> = {};
    matchups.forEach(m => {
        initialScores[m.userTeam.id] = getScore(m.userTeam);
        if (m.opponentTeam) {
          initialScores[m.opponentTeam.id] = getScore(m.opponentTeam);
        }
    });
    setLocalScores(initialScores);

    if (typeof window !== 'undefined') {
        const interval = setInterval(() => {
            setLocalScores(prevScores => {
                const newScores = { ...prevScores };
                Object.keys(newScores).forEach(teamId => {
                    newScores[teamId] += Math.random() * 0.5;
                });
                return newScores;
            });
        }, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }
  }, [matchups]);


  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2">
        {matchups.map(matchup => (
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
                      <span className="text-lg font-bold">
                        {(localScores[matchup.userTeam.id] ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">vs</span>
                    <div className="flex flex-col items-center gap-1">
                      <Image
                        src={matchup.opponentTeam.logoUrl}
                        alt={matchup.opponentTeam.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span className="text-lg font-bold">
                        {(localScores[matchup.opponentTeam.id] ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
       <CarouselPrevious className="hidden sm:flex -left-4" />
       <CarouselNext className="hidden sm:flex -right-4" />
    </Carousel>
  );
}
