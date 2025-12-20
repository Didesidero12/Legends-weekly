'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, UserPlus, Calendar, Trash2 } from 'lucide-react';
import type { League } from '@/lib/types';

type LeagueCarouselCardProps = {
  league: League;
  onInvite?: (league: League) => void;
  onSchedule?: (league: League) => void;
  onDelete?: (league: League) => void;
};

export function LeagueCarouselCard({ 
  league, 
  onInvite, 
  onSchedule, 
  onDelete 
}: LeagueCarouselCardProps) {
  const userTeam = league.teams?.[0] || { name: 'Your Team', logoUrl: '/placeholder.svg' }; 
  const opponentTeam = league.teams?.[1] || { name: 'Opponent', logoUrl: '/placeholder.svg' }; 
  
  if (!userTeam || !opponentTeam) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline">{league.name}</CardTitle>
          <CardDescription>Waiting for more teams to join.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const initialUserScore = useMemo(() => {
    if (!userTeam || !('roster' in userTeam)) return 0;
    return userTeam.roster.starters.reduce((sum, p) => sum + (p?.actualPoints ?? 0), 0);
  }, [userTeam]);

  const initialOpponentScore = useMemo(() => {
    if (!opponentTeam || !('roster' in opponentTeam)) return 0;
    return opponentTeam.roster.starters.reduce((sum, p) => sum + (p?.actualPoints ?? 0), 0);
  }, [opponentTeam]);

  const [userScore, setUserScore] = useState(initialUserScore);
  const [opponentScore, setOpponentScore] = useState(initialOpponentScore);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        setUserScore(prev => prev + Math.random() * 2);
        setOpponentScore(prev => prev + Math.random() * 2);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const userProjected = ('roster' in userTeam) 
    ? userTeam.roster.starters.reduce((sum, p) => sum + (p?.projectedPoints ?? 0), 0)
    : 0;

  const opponentProjected = ('roster' in opponentTeam)
    ? opponentTeam.roster.starters.reduce((sum, p) => sum + (p?.projectedPoints ?? 0), 0)
    : 0;

  const winProbability = useMemo(() => {
    const totalScore = userScore + opponentScore;
    if (totalScore === 0) {
      const totalProjected = userProjected + opponentProjected;
      if (totalProjected === 0) return 50;
      return (userProjected / totalProjected) * 100;
    }
    return (userScore / totalScore) * 100;
  }, [userScore, opponentScore, userProjected, opponentProjected]);

  return (
    <Card className="w-full relative">
      {/* 3-Dot Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onInvite?.(league)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Managers
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSchedule?.(league)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Draft
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive" 
            onSelect={() => onDelete?.(league)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete League
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline">{league.name}</CardTitle>
            <CardDescription>Week 1</CardDescription>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-3">
            <Image src={userTeam.logoUrl} alt={userTeam.name} width={40} height={40} className="rounded-lg" />
            <div className="text-3xl font-bold">{userScore.toFixed(2)}</div>
          </div>
          <div className="text-muted-foreground text-xl">vs</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">{opponentScore.toFixed(2)}</div>
            <Image src={opponentTeam.logoUrl} alt={opponentTeam.name} width={40} height={40} className="rounded-lg" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="font-semibold text-primary">{winProbability.toFixed(1)}%</span>
              <span className="text-xs font-medium text-muted-foreground">Win Probability</span>
              <span className="font-semibold text-primary">{(100 - winProbability).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Progress value={winProbability} className="h-2 w-full" />
              <Progress value={100 - winProbability} className="h-2 w-full rotate-180" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm">
              <div className="font-semibold">{userTeam.name}</div>
              <div className="text-xs text-muted-foreground">
                {'owner' in userTeam ? `${userTeam.owner} (${userTeam.record})` : 'Your Team'}
              </div>
            </div>
            <div className="text-sm text-right">
              <div className="font-semibold">{opponentTeam.name}</div>
              <div className="text-xs text-muted-foreground text-right">
                {'owner' in opponentTeam ? `${opponentTeam.owner} (${opponentTeam.record})` : 'Opponent'}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" asChild>
              <Link href={`/league/${league.id}/team`}>My Team</Link>
            </Button>
            <Button variant="secondary" className="flex-1" asChild>
              <Link href={`/league/${league.id}/matchup`}>Matchup</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}