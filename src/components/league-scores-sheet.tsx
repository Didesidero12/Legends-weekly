
'use client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Matchup, Roster, Team } from '@/lib/types';
import Image from "next/image";
import { Progress } from "./ui/progress";
import { useMemo } from "react";

const EMPTY_ROSTER: Roster = { starters: [], bench: [], ir: [] };

function ScoreboardContent({ matchups }: { matchups: Matchup[] }) {
    const getScore = (roster: Roster = EMPTY_ROSTER) => {
      return (roster.starters || []).reduce((sum, p) => sum + (p?.actualPoints ?? 0), 0);
    }
    const getProjectedScore = (roster: Roster = EMPTY_ROSTER) => {
      return (roster.starters || []).reduce((sum, p) => sum + (p?.projectedPoints ?? 0), 0);
    }
  
    const calculatedMatchups = useMemo(() => {
      return matchups.map(matchup => {
          const userScore = getScore(matchup.userTeam.roster);
          const opponentScore = getScore(matchup.opponentTeam.roster);
  
          const userProjected = getProjectedScore(matchup.userTeam.roster);
          const opponentProjected = getProjectedScore(matchup.opponentTeam.roster);
          
          let winProbability;
          const totalScore = userScore + opponentScore;
          if (totalScore > 0) {
              winProbability = (userScore / totalScore) * 100;
          } else {
              const totalProjected = userProjected + opponentProjected;
              winProbability = totalProjected > 0 ? (userProjected / totalProjected) * 100 : 50;
          }
  
          return { matchup, userScore, opponentScore, winProbability };
      });
    }, [matchups]);

    return (
        <div className="py-4 space-y-4">
        {calculatedMatchups.map(({ matchup, userScore, opponentScore, winProbability }, index) => (
          <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                      <Image src={matchup.userTeam.logoUrl} alt={matchup.userTeam.name} width={32} height={32} className="rounded-full" />
                      <div>
                          <p className="font-semibold">{matchup.userTeam.name}</p>
                          <p className="text-xs text-muted-foreground">{matchup.userTeam.record}</p>
                      </div>
                  </div>
                   <div className="font-bold text-xl">{userScore.toFixed(2)}</div>
              </div>

              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <Image src={matchup.opponentTeam.logoUrl} alt={matchup.opponentTeam.name} width={32} height={32} className="rounded-full" />
                      <div>
                          <p className="font-semibold">{matchup.opponentTeam.name}</p>
                          <p className="text-xs text-muted-foreground">{matchup.opponentTeam.record}</p>
                      </div>
                  </div>
                  <div className="font-bold text-xl">{opponentScore.toFixed(2)}</div>
              </div>
              
              <div className="mt-3">
                  <Progress value={winProbability} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">Win Probability: {winProbability.toFixed(1)}% for {matchup.userTeam.name}</p>
              </div>
          </div>
        ))}
      </div>
    )
}

export function LeagueScoresSheet({
  open,
  onOpenChange,
  matchups,
  leagueName,
  isSheetContent = true
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchups: Matchup[];
  leagueName: string;
  isSheetContent?: boolean;
}) {

  if (!isSheetContent) {
      return <ScoreboardContent matchups={matchups} />;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Week 1 Scores: {leagueName}</SheetTitle>
          <SheetDescription>
            Live look at all the matchups across the league.
          </SheetDescription>
        </SheetHeader>
        <ScoreboardContent matchups={matchups} />
      </SheetContent>
    </Sheet>
  );
}
