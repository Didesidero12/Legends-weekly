'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useContext, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ArrowRightLeft, PlusCircle, AlertTriangle, Edit, FileText, Repeat, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { RosterContext } from '@/context/RosterContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Player, Roster, RosterSlot, Team, LegendaryCard, CardTier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerDetailSheet } from '@/components/player-detail-sheet';
import { TeamInfoSheet } from '@/components/team-info-sheet';
import { useParams, usePathname } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PlayerInfo } from '@/components/player-info';


type SwapCandidate = {
  player: Player;
  from: 'starters' | 'bench' | 'ir';
  to: 'starters' | 'bench' | 'ir';
  starterIndex?: number;
} | {
  player: null; // Represents an empty slot
  from: 'starters';
  to: 'bench'; // Target is bench players
  starterIndex: number;
};

const tierStyles: Record<CardTier, { badge: string; text: string; crown: string; }> = {
    Legendary: { badge: 'bg-yellow-400/10 border-yellow-400/50', text: 'text-yellow-300', crown: 'text-yellow-400' },
    Epic: { badge: 'bg-purple-400/10 border-purple-400/50', text: 'text-purple-300', crown: 'text-purple-400' },
    Rare: { badge: 'bg-blue-400/10 border-blue-400/50', text: 'text-blue-300', crown: 'text-blue-400' },
    Common: { badge: 'bg-gray-400/10 border-gray-400/50', text: 'text-gray-300', crown: 'text-gray-400' },
};

const tierGlowClasses: Record<CardTier, string> = {
    Legendary: 'animate-pulse-glow [--glow-color:theme(colors.legendary-glow)] ring-legendary-glow shadow-legendary-glow',
    Epic: 'animate-pulse-glow [--glow-color:theme(colors.epic-glow)] ring-epic-glow shadow-epic-glow',
    Rare: 'animate-pulse-glow [--glow-color:theme(colors.rare-glow)] ring-rare-glow shadow-rare-glow',
    Common: 'animate-pulse-glow [--glow-color:theme(colors.common-glow)] ring-common-glow shadow-common-glow',
};

// Helper to get points for a player in a specific slot, with legendary override
const getSlotPoints = (
  player: Player | null,
  slotIndex: number,
  cards: LegendaryCard[] | null = [],  // ← Accept null, default []
  position: string
) => {
  if (!player) return 0;

  const slotId = `${position}-${slotIndex}`;

  const safeCards = cards ?? [];  // ← Internal safe guard for null

  const activeCard = safeCards.find(c =>
    c.status === 'played' &&
    c.pendingSlotId === slotId
  );

  if (activeCard?.historicalPoints !== undefined) {
    return activeCard.historicalPoints;
  }

  return player.actualPoints ?? player.projectedPoints ?? 0;
};

const getActiveCard = (slotIndex: number, cards: LegendaryCard[] = [], position: string) => {
  const slotId = `${position}-${slotIndex}`;
  return cards.find(c =>
    c.status === 'played' &&
    c.pendingSlotId === slotId
  );
};


function PlayerStatus({ status }: { status: Player['status']}) {
    if (status === 'Healthy') return null;
    
    if (status === 'Bye') {
        return (
             <Badge variant="outline" className="px-2 py-0.5 text-xs">BYE</Badge>
        );
    }

    const statusMap: Record<Exclude<Player['status'], 'Healthy' | 'Bye'>, { label: string; className: string }> = {
        'Questionable': { label: 'Q', className: 'bg-yellow-500 text-black' },
        'Doubtful': { label: 'D', className: 'bg-orange-500 text-white' },
        'Out': { label: 'O', className: 'bg-destructive text-destructive-foreground' },
        'IR': { label: 'IR', className: 'bg-destructive text-destructive-foreground' },
    };

    const { label, className } = statusMap[status];

    return (
        <Badge className={cn("w-5 h-5 p-0 justify-center rounded-sm text-[10px] font-bold", className)}>
            {label}
        </Badge>
    );
}

const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-red-500';
    if (rank >= 21) return 'text-green-500';
    return '';
};


function RosterTable({ 
  title, 
  players, 
  starterSlots,
  isStarters,
  onMovePlayer,
  onFillSlot,
  onDropPlayer,
  onPlayerClick,
  cards = []
}: { 
  title: string, 
  players: RosterSlot[], 
  starterSlots?: string[],
  isStarters?: boolean,
  onMovePlayer: (player: Player) => void,
  onFillSlot: (starterIndex: number) => void;
  onDropPlayer: (player: Player) => void;
  onPlayerClick: (player: Player) => void;
  cards?: LegendaryCard[];
}) {
  const params = useParams();
  const leagueId = params.leagueId as string;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {players && players.map((player, index) => {
                const slotId = isStarters && starterSlots ? `${starterSlots?.[index] || 'FLEX'}-${index}` : null;
                const pendingCard = slotId 
                  ? cards?.find(c => c.status === 'pending' && c.pendingSlotId === slotId)
                  : undefined;

                const activeCard = slotId 
                  ? cards?.find(c => c.status === 'played' && c.pendingSlotId === slotId)
                  : undefined;
                const activeTierStyles = pendingCard ? tierStyles[pendingCard.tier] : activeCard ? tierStyles[activeCard.tier] : null;
                const glowClass = activeTierStyles ? tierGlowClasses[pendingCard?.tier || activeCard?.tier] : '';

                return (
                <TableRow key={player?.id ?? `empty-${title}-${index}`} className={cn(glowClass && 'rounded-md ring-2', glowClass)}>
                    <TableCell>
                      <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-1 h-auto font-semibold">
                                {isStarters && starterSlots ? starterSlots[index] : title.toUpperCase().startsWith('BE') ? 'BE' : 'IR'}
                            </Button>
                            </DropdownMenuTrigger>
                            {player && (
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onMovePlayer(player)}>
                                    Move Player
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onDropPlayer(player)} className="text-destructive">Drop Player</DropdownMenuItem>
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    
                    {player ? (
                    <>
                        <TableCell>
                             <div className="flex items-center gap-3">
                                <PlayerInfo 
                                    player={player} 
                                    onClick={() => onPlayerClick(player)} 
                                    overrideName={activeCard?.playerName}
secondaryInfo={
  <>
    <div className="flex items-center gap-2">
      <PlayerStatus status={player.status} />
      {activeTierStyles && (
        <Badge variant="secondary" className={cn(activeTierStyles.badge, activeTierStyles.text)}>
          <Crown className={cn("w-3 h-3 mr-1.5", activeTierStyles.crown)} />
          {pendingCard ? `${pendingCard.tier} Pending` : `${activeCard?.tier} Active`}
        </Badge>
      )}
      {title === 'Injured Reserve' && player.status !== 'IR' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Player is not on IR and must be moved.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className="flex items-center gap-x-2 whitespace-nowrap text-[11px] text-muted-foreground -mt-0.5">
      <span>{player.rosterPercentage ?? 0}% Rost</span>
      <span className='ml-2'>{player.startPercentage ?? 0}% Start</span>
    </div>
    <div className={cn("flex items-center gap-x-2 whitespace-nowrap text-[11px] text-muted-foreground -mt-0.5")}>
      <span>{player.gameTime ?? '--'}</span>
      <span className={cn('ml-2', getRankColor(player.opponent?.rank ?? 0))}>
        {player.opponent?.team ?? '--'} ({player.opponent?.rank ?? '-'})
      </span>
    </div>
  </>
}
                                />
                            </div>
                        </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-medium">
                          {getSlotPoints(
                            player, 
                            index, 
                            cards, 
                            starterSlots?.[index] || 'UNKNOWN'
                          ).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Proj: {player?.projectedPoints?.toFixed(2) ?? '--'}
                          </div>
                          {activeCard && (
                            <Badge variant="secondary" className="mt-1">
                              <Crown className="w-3 h-3 mr-1" />
                              {activeCard.playerName} ({activeCard.historicalYear})
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </>
                    ) : (
                        <>
                        <TableCell colSpan={1} className="text-muted-foreground italic">
                            <div className="flex items-center gap-2">
                                Empty
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                        {isStarters ? (
                            <Button variant="outline" size="sm" onClick={() => onFillSlot(index)}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Fill Slot
                            </Button>
                        ) : (title.toUpperCase().startsWith('BE')) && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/league/${leagueId}/players`}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Add Player
                                </Link>
                            </Button>
                        )}
                        </TableCell>
                        </>
                    )}
                </TableRow>
                )})}
            </TableBody>
            </Table>
        </div>
        <div className="md:hidden space-y-1">
            {players.map((player, index) => {
                const slotId = isStarters && starterSlots ? `${starterSlots?.[index] || 'FLEX'}-${index}` : null;
                const pendingCard = slotId 
                  ? cards?.find(c => c.status === 'pending' && c.pendingSlotId === slotId)
                  : undefined;

                const activeCard = slotId 
                  ? cards?.find(c => c.status === 'played' && c.pendingSlotId === slotId)
                  : undefined;
                const activeTierStyles = pendingCard ? tierStyles[pendingCard.tier] : activeCard ? tierStyles[activeCard.tier] : null;
                const glowClass = activeTierStyles ? tierGlowClasses[pendingCard?.tier || activeCard?.tier] : '';
                const slotLabel = isStarters && starterSlots ? starterSlots[index] : title.toUpperCase().startsWith('BE') ? 'BE' : 'IR';
                
                return (
                    <div key={player?.id ?? `mobile-empty-${title}-${index}`} className={cn('flex items-center gap-2 p-2 border-b last:border-b-0', glowClass && 'rounded-md ring-2', glowClass)}>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="w-14">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full h-8 font-bold text-xs">
                                        {slotLabel}
                                    </Button>
                                    </DropdownMenuTrigger>
                                    {player && (
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onSelect={() => onMovePlayer(player)}>
                                            Move Player
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onDropPlayer(player)} className="text-destructive">Drop Player</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    )}
                                </DropdownMenu>
                            </div>
                        
                            {player ? (
                                <PlayerInfo 
                                    player={player} 
                                    onClick={() => onPlayerClick(player)} 
                                    overrideName={activeCard?.playerName}
secondaryInfo={
  <>
    <div className="flex items-center gap-1.5">
      <PlayerStatus status={player.status} />
      {activeTierStyles && (
        <Badge variant="secondary" className={cn("text-xs", activeTierStyles.badge, activeTierStyles.text)}>
          <Crown className={cn("w-3 h-3 mr-1.5", activeTierStyles.crown)} />
          {pendingCard ? `${pendingCard.tier} Pending` : `${activeCard?.tier} Active`}
        </Badge>
      )}
    </div>
    <div className="flex items-center gap-x-2 text-[10px] text-muted-foreground">
      <span>{player.rosterPercentage ?? 0}% Rost</span>
      <span>{player.startPercentage ?? 0}% Start</span>
    </div>
    <div className={cn("flex items-center gap-x-1.5 text-[10px] text-muted-foreground")}>
      <span>{player.gameTime ?? '--'}</span>
      <span className={cn(getRankColor(player.opponent?.rank ?? 0))}>
        {player.opponent?.team ?? '--'} ({player.opponent?.rank ?? '-'})
      </span>
    </div>
  </>
}
                                />
                            ) : (
                                <div className="flex-1 flex justify-start">
                                    {isStarters ? (
                                        <Button variant="outline" size="sm" onClick={() => onFillSlot(index)}>
                                            Fill
                                        </Button>
                                    ) : (slotLabel === 'BE') && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/league/${leagueId}/players`}>
                                            Add
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                      {player && (
                        <div className="text-right w-16 flex-shrink-0">
                        <div className="font-semibold text-sm">
                          {getSlotPoints(
                            player, 
                            index, 
                            cards, 
                            starterSlots?.[index] || 'UNKNOWN'
                          ).toFixed(2)}
                        </div>
                          <div className="text-xs text-muted-foreground">
                            Proj: {player.projectedPoints.toFixed(2)}
                          </div>
                          {activeCard && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              {activeCard.playerName}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const params = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { leagues, setLeagues, updateTeamRoster, availablePlayers, setAvailablePlayers } = useContext(RosterContext);
  
  const leagueId = params.leagueId as string;
  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);
  const userTeam = useMemo(() => league?.teams?.find(t => t.managerId === user?.uid), [league, user]);
  const roster = useMemo(() => userTeam?.roster, [userTeam]);

  console.log("TeamPage - leagueId from params:", leagueId);
  console.log("TeamPage - current user UID:", user?.uid);
  console.log("TeamPage - all leagues from context:", leagues);
  console.log("TeamPage - found league:", league);
  console.log("TeamPage - league teams:", league?.teams);
  console.log("TeamPage - userTeam:", userTeam);
  console.log("TeamPage - roster:", roster);

  const cardsRef = useMemoFirebase(() => {
      if (!firestore || !leagueId || !userTeam?.id) return null;
      return collection(firestore, 'leagues', leagueId, 'teams', userTeam.id, 'cards');
  }, [firestore, leagueId, userTeam?.id]);

  const { data: cards } = useCollection<LegendaryCard>(cardsRef);

  const { starterSlots, benchSize, irSize } = useMemo(() => {
    if (!league?.rosterSettings) {
        return { starterSlots: [], benchSize: 0, irSize: 0 };
    }
    const slots = league.rosterSettings
        .filter(s => s.starters > 0 && s.abbr !== 'BE' && s.abbr !== 'IR')
        .flatMap(s => Array(s.starters).fill(s.abbr));

    const bSize = league.rosterSettings.find(s => s.abbr === 'BE')?.starters ?? 0;
    const iSize = league.rosterSettings.find(s => s.abbr === 'IR')?.starters ?? 0;

    return { starterSlots: slots, benchSize: bSize, irSize: iSize };
  }, [league]);

  
  const [isTeamInfoSheetOpen, setTeamInfoSheetOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const totalWeeks = 17;

  useEffect(() => {
    if (userTeam && roster && roster.starters.length < starterSlots.length) {
        const newRoster = {
            ...roster,
            starters: [...roster.starters, ...Array(starterSlots.length - roster.starters.length).fill(null)]
        };
        updateTeamRoster(leagueId, userTeam.id, newRoster);
    }
  }, [userTeam, roster, starterSlots, leagueId, updateTeamRoster]);
  
  const handleTeamInfoSave = (updatedTeam: Partial<Team>) => {
    if (!user) return;
    setLeagues(prevLeagues => 
        prevLeagues.map(l => {
            if (l.id === leagueId) {
                const newTeams = l.teams?.map((t) => {
                    if (t.managerId === user.uid) { // Find by managerId
                        return { ...t, ...updatedTeam };
                    }
                    return t;
                });
                return { ...l, teams: newTeams };
            }
            return l;
        })
    );
};


  const [swapCandidate, setSwapCandidate] = useState<SwapCandidate | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null); // For swapping with an existing starter
  const [targetSlot, setTargetSlot] = useState<number | null>(null); // For filling an empty slot or moving to bench/IR
  const [playerToDrop, setPlayerToDrop] = useState<Player | null>(null);
  const [moveFromIrRequiresDrop, setMoveFromIrRequiresDrop] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const { toast } = useToast();


  const handleMovePlayer = (playerToMove: Player) => {
    if (!roster) return;
    const isStarter = roster.starters.some(p => p?.id === playerToMove.id);
    const isOnBench = roster.bench.some(p => p.id === playerToMove.id);
    const isOnIr = roster.ir.some(p => p.id === playerToMove.id);
    const starterIndex = roster.starters.findIndex(p => p?.id === playerToMove.id);

    let from: 'starters' | 'bench' | 'ir' = 'bench';
    if (isStarter) from = 'starters';
    if (isOnIr) from = 'ir';

    let to: 'starters' | 'bench' | 'ir' = 'bench';
    // Logic to determine 'to' will be handled by the dialog
    if (from === 'starters') to = 'bench';
    if (from === 'bench') to = 'starters';
    if (from === 'ir') to = 'bench'; // Default target from IR is bench
    
    setSwapCandidate({
        player: playerToMove,
        from,
        to, // This is a bit ambiguous now, dialog will clarify
        starterIndex: isStarter ? starterIndex : undefined
    });
  };

  const handleFillSlot = (starterIndex: number) => {
    setSwapCandidate({
      player: null,
      from: 'starters',
      to: 'bench', // We are filling from the bench
      starterIndex: starterIndex,
    });
  };

  const handleDropPlayer = (player: Player) => {
    setPlayerToDrop(player);
  };

const handleConfirmDrop = (droppedPlayerArg?: Player) => {
  if (!roster || !userTeam || !leagueId) return;

  // Use a different name for the local variable
  const playerBeingDropped = droppedPlayerArg || playerToDrop;

  if (!playerBeingDropped || !playerBeingDropped.sleeperId) return;

  try {
    let newStarters: RosterSlot[] = [...roster.starters];
    let newBench: Player[] = [...roster.bench];
    let newIr: Player[] = [...roster.ir];

    // Match using sleeperId (real ID)
    const starterIndex = newStarters.findIndex(p => p?.sleeperId === playerBeingDropped.sleeperId);
    if (starterIndex > -1) {
      newStarters[starterIndex] = null;
    } else {
      newBench = newBench.filter(p => p.sleeperId !== playerBeingDropped.sleeperId);
    }

    newIr = newIr.filter(p => p.sleeperId !== playerBeingDropped.sleeperId);

    const updatedRoster = {
      ...roster,
      starters: newStarters,
      bench: newBench,
      ir: newIr,
    };

    updateTeamRoster(leagueId, userTeam.id, updatedRoster);

    setAvailablePlayers(prev => {
      if (prev?.some(p => p.sleeperId === playerBeingDropped.sleeperId)) {
        return prev;
      }
      return [...(prev || []), playerBeingDropped];
    });

    toast({
      title: "Player Dropped",
      description: `${playerBeingDropped.name} has been dropped and is now a free agent.`,
    });

  } catch (error) {
    console.error("Failed to drop player:", error);
    toast({
      variant: "destructive",
      title: "Drop Failed",
      description: "Something went wrong. Please try again.",
    });
  } finally {
    setPlayerToDrop(null);
    setMoveFromIrRequiresDrop(null);
  }
};

  const executeSwap = () => {
    if (!swapCandidate || !roster || !setAvailablePlayers || !userTeam) return;
  
    let newStarters: RosterSlot[] = [...roster.starters];
    let newBench: Player[] = [...roster.bench];
    let newIr: Player[] = [...roster.ir];
  
    const { player: playerToMove } = swapCandidate;

    // This must happen first
    if (moveFromIrRequiresDrop) {
        const playerToDrop = moveFromIrRequiresDrop;
        const starterIndex = newStarters.findIndex(p => p?.id === playerToDrop.id);
        if (starterIndex > -1) {
            newStarters[starterIndex] = null;
        } else {
            newBench = newBench.filter(p => p.id !== playerToDrop.id);
        }

        setAvailablePlayers(prev => {
            if (!prev?.some(p => p.id === playerToDrop.id)) {
                return [...(prev || []), playerToDrop as Player];
            }
            return prev || [];
        });

        toast({
            title: "Player Dropped",
            description: `${playerToDrop.name} has been removed to make roster room.`,
        });
    }
  
    if (playerToMove && swapCandidate.from === 'starters' && targetPlayer) { // STARTER -> BENCH (SWAP)
      const { starterIndex } = swapCandidate;
      if (starterIndex === undefined) return;

      const benchIndex = newBench.findIndex(p => p.id === targetPlayer.id);
      if (benchIndex === -1) return;

      newStarters[starterIndex] = targetPlayer;
      newBench[benchIndex] = playerToMove;

      toast({ title: "Roster Updated", description: `${playerToMove.name} and ${targetPlayer.name} have been swapped.` });

    } else if (playerToMove && swapCandidate.from === 'starters' && targetSlot === -1) { // STARTER -> BENCH (MOVE TO OPEN SLOT)
        const { starterIndex } = swapCandidate;
        if (starterIndex === undefined) return;

        newStarters[starterIndex] = null;
        newBench.push(playerToMove);
        newBench.sort((a, b) => a.name.localeCompare(b.name));

        toast({ title: "Roster Updated", description: `${playerToMove.name} moved to bench.` });
    
    } else if (playerToMove && swapCandidate.from === 'bench' && targetPlayer) { // BENCH -> STARTER (SWAP)
      const targetStarterIndex = newStarters.findIndex(p => p?.id === targetPlayer.id);
      if (targetStarterIndex === -1) return;
  
      const benchIndex = newBench.findIndex(p => p.id === playerToMove.id);
      if (benchIndex === -1) return;
      
      const playerAtTargetSlot = newStarters[targetStarterIndex];

      if (!playerAtTargetSlot) return; // Should not happen
  
      newStarters[targetStarterIndex] = playerToMove;
      newBench[benchIndex] = playerAtTargetSlot; 
  
      toast({ title: "Roster Updated", description: `${playerToMove.name} and ${playerAtTargetSlot.name} have been swapped.` });

    } else if (playerToMove && swapCandidate.from === 'bench' && targetSlot !== null && targetSlot > -1) { // BENCH -> STARTER (FILL EMPTY SLOT)
      const benchIndex = newBench.findIndex(p => p.id === playerToMove.id);
      if (benchIndex === -1 || newStarters[targetSlot] !== null) return;

      newStarters[targetSlot] = playerToMove;
      newBench.splice(benchIndex, 1);

      toast({ title: "Roster Updated", description: `${playerToMove.name} moved to starters.` });

    } else if (swapCandidate.player === null && targetPlayer) { // EMPTY STARTER -> BENCH (FILL FROM BENCH)
        const { starterIndex } = swapCandidate;
        if (starterIndex === undefined) return;
        const benchIndex = newBench.findIndex(p => p.id === targetPlayer.id);
        
        newStarters[starterIndex] = targetPlayer;
        newBench.splice(benchIndex, 1);
        
        toast({ title: "Roster Updated", description: `${targetPlayer.name} has been moved to starters.` });
    } else if (playerToMove && (swapCandidate.from === 'bench' || swapCandidate.from === 'starters') && targetSlot === -2) { // To IR
        if (playerToMove.status !== 'IR') {
            toast({ variant: 'destructive', title: "Invalid Move", description: `${playerToMove.name} cannot be moved to IR without an 'IR' status.` });
            handleDialogCancel();
            return;
        }

        if (swapCandidate.from === 'starters') {
            const { starterIndex } = swapCandidate;
            if (starterIndex === undefined) return;
            newStarters[starterIndex] = null;
        } else { // from bench
            newBench = newBench.filter(p => p.id !== playerToMove.id);
        }
        newIr.push(playerToMove);
        toast({ title: "Roster Updated", description: `${playerToMove.name} moved to Injured Reserve.` });
    } else if (playerToMove && swapCandidate.from === 'ir' && (targetSlot === -1 || moveFromIrRequiresDrop)) { // From IR to Bench
        newIr = newIr.filter(p => p.id !== playerToMove.id);
        newBench.push(playerToMove);
        toast({ title: "Roster Updated", description: `${playerToMove.name} moved from IR to Bench.` });
    }
  
    updateTeamRoster(leagueId, userTeam.id, { starters: newStarters, bench: newBench.filter((p): p is Player => p !== null), ir: newIr });
    handleDialogCancel();
  };
  
  const isEligibleForSlot = (player: Player, slotPositionAbbr: string) => {
  // Normalize for D/ST variations
  const playerPos = player.position === 'D/ST' || player.position === 'DST' ? 'DEF' : player.position;
  const slotPos = slotPositionAbbr === 'D/ST' || slotPositionAbbr === 'DST' ? 'DEF' : slotPositionAbbr;

  // Direct match
  if (playerPos === slotPos) return true;

  // FLEX
  if (slotPos === 'FLEX') {
    return ['RB', 'WR', 'TE'].includes(playerPos);
  }

  // Other flex variants
  if (slotPos === 'RB/WR') return ['RB', 'WR'].includes(playerPos);
  if (slotPos === 'WR/TE') return ['WR', 'TE'].includes(playerPos);
  if (slotPos === 'OP') return ['QB', 'RB', 'WR', 'TE'].includes(playerPos);

  return false;
};

 const getEligibleTargets = () => {
    if (!swapCandidate || !roster || !starterSlots) return { players: [], slots: [], allowMoveToBench: false, allowMoveToIr: false };
  
    const { player: playerToMove, from } = swapCandidate;
  


    if (from === 'ir') { // Moving a player FROM IR...
      if (!playerToMove) return { players: [], slots: [], allowMoveToBench: false, allowMoveToIr: false };

      const rosterIsFull = (roster.starters.filter(p => p !== null).length + roster.bench.length) >= (starterSlots.length + benchSize);
      
      // If roster is full, a drop is required to activate ANYONE from IR.
      if (rosterIsFull) {
        const allActivePlayers = [...roster.starters, ...roster.bench].filter((p): p is Player => p !== null && p.id !== playerToMove.id);
        return { players: allActivePlayers, slots: [], allowMoveToBench: false, allowMoveToIr: false, requiresDrop: true }
      }

      // If roster has space, they can move to bench.
       return { players: [], slots: [], allowMoveToBench: true, allowMoveToIr: false };

    } else if (from === 'bench') { // Moving a player FROM BENCH...
        if (!playerToMove) return { players: [], slots: [], allowMoveToBench: false, allowMoveToIr: false };
    
        // Find eligible EXISTING STARTERS to swap with
        const eligiblePlayers = roster.starters.filter((starter): starter is Player => {
            if (!starter) return false;
            const starterSlotPosition = starterSlots[roster.starters.indexOf(starter)];
            
            // Check if bench player can go into starter slot AND starter can go on bench (always true for bench)
            return isEligibleForSlot(playerToMove, starterSlotPosition);
        });

        // Find eligible EMPTY SLOTS to fill
        const eligibleSlots = roster.starters
            .map((slot, index) => (slot === null ? index : -1))
            .filter(index => {
            if (index === -1) return false;
            const emptySlotPosition = starterSlots[index];
            return isEligibleForSlot(playerToMove, emptySlotPosition);
            });
        
        const allowMoveToIr = playerToMove.status === 'IR' && roster.ir.length < irSize;

        return { players: eligiblePlayers, slots: eligibleSlots, allowMoveToBench: false, allowMoveToIr };
    
    } else if (from === 'starters' && swapCandidate.player !== null) { // Moving a player FROM STARTERS...
        const playerToMove = swapCandidate.player;
        if (!playerToMove || swapCandidate.starterIndex === undefined) return { players: [], slots: [], allowMoveToBench: false, allowMoveToIr: false };
        const starterSlotPosition = starterSlots[swapCandidate.starterIndex];

        // Find bench players eligible to swap into the starter's slot
        const eligibleBenchPlayers = roster.bench.filter(benchPlayer => {
            return isEligibleForSlot(benchPlayer, starterSlotPosition);
        });
        
        // A starter can always be moved to the bench, potentially overfilling it.
        const allowMoveToBench = true;
        const allowMoveToIr = playerToMove.status === 'IR' && roster.ir.length < irSize;

       return { players: eligibleBenchPlayers, slots: [], allowMoveToBench, allowMoveToIr };

    } else if (from === 'starters' && swapCandidate.player === null) { // Filling an EMPTY STARTER slot from the BENCH
      if (swapCandidate.starterIndex === undefined) return { players: [], slots: [], allowMoveToBench: false, allowMoveToIr: false };
      const emptySlotPosition = starterSlots[swapCandidate.starterIndex];
      const eligibleBenchPlayers = roster.bench.filter(benchPlayer => {
        return isEligibleForSlot(benchPlayer, emptySlotPosition)
      })
      return { players: eligibleBenchPlayers, slots: [], allowMoveToBench: false, allowMoveToIr: false };
    }
    return { players: [], slots: [], allowMoveToBench: false, allowMoveToIr: false };
  };

  const { players: eligiblePlayers, slots: eligibleSlots, allowMoveToBench, allowMoveToIr, requiresDrop } = getEligibleTargets();

  const getSwapDialogTitle = () => {
    if (!swapCandidate || !starterSlots) return '';
    const { player, from, starterIndex } = swapCandidate;

    if (requiresDrop && player) {
        return `Your roster is full. Select a player to drop to activate ${player.name} from IR.`
    }

    if (player === null && starterIndex !== undefined) {
      const pos = starterSlots[starterIndex];
      return `Select a player from your bench to fill the empty ${pos} slot.`;
    }
    
    if (from === 'bench' && player) {
        return `Select a starter to swap with ${player.name}, choose an empty slot, or move to IR.`;
    }

    if (from === 'starters' && player) {
        return `Select a bench player to swap with ${player.name}, move to an open bench slot, or move to IR.`;
    }

     if (from === 'ir' && player) {
        if(player.status !== 'IR') {
            return `${player.name} must be activated. Your roster is full. Select a player to drop to make room.`
        }
        return `Activate ${player.name} from Injured Reserve.`;
    }

    return 'Move Player';
  };
  
  const handleDialogCancel = () => {
    setSwapCandidate(null);
    setTargetPlayer(null);
    setTargetSlot(null);
    setMoveFromIrRequiresDrop(null);
  };

  // Prepare display arrays first
  const displayStarters = useMemo(() => {
    const starters = roster?.starters ?? [];
    const desiredLength = starterSlots.length;
    if (starters.length < desiredLength) {
        return [...starters, ...Array(desiredLength - starters.length).fill(null)];
    }
    return starters.slice(0, desiredLength);
  }, [roster, starterSlots]);

  const displayBench = useMemo(() => {
    const bench = roster?.bench ?? [];
    return Array(Math.max(benchSize, bench.length)).fill(null).map((_, i) => bench[i] || null);
  }, [roster, benchSize]);
  
  const displayIR = useMemo(() => {
    const ir = roster?.ir ?? [];
    return Array(irSize).fill(null).map((_, i) => ir[i] || null);
  }, [roster, irSize]);

  const isHealthyPlayerOnIR = useMemo(() => {
      if (!roster?.ir) return false;
      return roster.ir.some(p => p.status !== 'IR');
  }, [roster]);

  // Now calculate totals using displayStarters
const totalActualPoints = useMemo(() => {
  return displayStarters.reduce((sum, player, index) => {
    if (!player) return sum;
    const position = starterSlots?.[index] || 'FLEX';
    return sum + getSlotPoints(player, index, cards ?? [], position);  // ← Add ?? []
  }, 0);
}, [displayStarters, starterSlots, cards]);

  const totalProjectedPoints = useMemo(() => {
    if (!roster?.starters) return 0;
    return roster.starters.reduce((sum, p) => sum + (p?.projectedPoints ?? 0), 0);
  }, [roster]);

  const handlePreviousWeek = () => {
    setSelectedWeek(week => Math.max(1, week - 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(week => Math.min(totalWeeks, week + 1));
  };

  if (!league || !userTeam) {
    return (
      <div className="p-8 text-center">
        <div>Loading team data...</div>
        <div className="text-sm text-muted-foreground mt-4">
          Debug: leagueId={leagueId}, foundLeague={!!league}, foundTeam={!!userTeam}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        
<div className="flex items-center justify-between">
  <div className='flex items-center gap-4'>
    <Image 
      src={userTeam.logoUrl || 'https://picsum.photos/seed/team-fallback/64/64'} 
      alt={`${userTeam.name} logo`} 
      width={64} 
      height={64} 
      className="rounded-full" 
    />
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">{userTeam.name}</h1>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTeamInfoSheetOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{userTeam.owner} - {userTeam.record}</p>
    </div>
  </div>
  <div className="text-right">
    <div className="text-2xl font-bold">{totalActualPoints.toFixed(2)}</div>
    <div className="text-xs text-muted-foreground">
      Proj: {totalProjectedPoints.toFixed(2)}
    </div>
  </div>
</div>

        <Card>
            <CardContent className="p-0">
                <div className="flex divide-x">
                    <Button variant="ghost" className="flex-1 flex-col h-auto p-3">
                        <div className="flex items-center gap-2">
                           <FileText className="h-4 w-4 text-muted-foreground"/>
                           <span className="font-semibold">Claims</span>
                        </div>
                        <span className="text-sm text-muted-foreground">0 Pending</span>
                    </Button>
                    <Button variant="ghost" className="flex-1 flex-col h-auto p-3">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-muted-foreground"/>
                            <span className="font-semibold">Trades</span>
                        </div>
                        <span className="text-sm text-muted-foreground">0 Offers</span>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePreviousWeek} disabled={selectedWeek === 1}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <div className="font-semibold">Week {selectedWeek}</div>
                <div className="text-xs text-muted-foreground">Matchup vs. Opponent</div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextWeek} disabled={selectedWeek === totalWeeks}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

         {isHealthyPlayerOnIR && (
             <Card className="border-yellow-500 bg-yellow-500/10">
                <CardHeader className='flex-row items-center gap-4 space-y-0'>
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                        <CardTitle className="text-yellow-600 text-base">Invalid IR Player</CardTitle>
                        <CardDescription className="text-yellow-700">
                            A player on your Injured Reserve is no longer eligible. You must move them to your active roster.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )}

        <div className="space-y-4">
          <RosterTable 
            title="Starters" 
            players={displayStarters} 
            isStarters={true} 
            starterSlots={starterSlots} 
            onMovePlayer={handleMovePlayer} 
            onFillSlot={handleFillSlot} 
            onDropPlayer={handleDropPlayer} 
            onPlayerClick={setSelectedPlayer} 
            cards={cards ?? []}  // ← Add this safe fallback
          />
          <RosterTable 
            title="Bench" 
            players={displayBench} 
            onMovePlayer={handleMovePlayer} 
            onFillSlot={() => {}} 
            onDropPlayer={handleDropPlayer} 
            onPlayerClick={setSelectedPlayer} 
            cards={cards ?? []}  // ← Add this
          />
          <RosterTable 
            title="Injured Reserve" 
            players={displayIR} 
            onMovePlayer={handleMovePlayer} 
            onFillSlot={() => {}} 
            onDropPlayer={handleDropPlayer} 
            onPlayerClick={setSelectedPlayer} 
            cards={cards ?? []}  // ← Add this
          />
        </div>
      </div>
      {swapCandidate && (
        <AlertDialog open={!!swapCandidate} onOpenChange={(isOpen) => !isOpen && handleDialogCancel()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getSwapDialogTitle()}</AlertDialogTitle>
              <AlertDialogDescription>
                 {swapCandidate.from === 'ir' && !requiresDrop && 'Select a destination for this player.'}
                 {swapCandidate.from !== 'ir' && swapCandidate.player && `Select an action for ${swapCandidate.player.name}.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-60 overflow-y-auto p-1">
              <div className="space-y-2">
                {eligibleSlots.length > 0 && (
                    <Card 
                      onClick={() => { setTargetSlot(eligibleSlots[0]); setTargetPlayer(null); }} 
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${targetSlot === eligibleSlots[0] ? 'bg-primary/20 border-primary' : 'hover:bg-secondary/50'}`}
                    >
                      <div className="font-medium italic">Move to Empty {starterSlots[eligibleSlots[0]]} Slot</div>
                       <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    </Card>
                )}
                 {allowMoveToBench && (
                    <Card 
                      onClick={() => { setTargetSlot(-1); setTargetPlayer(null); setMoveFromIrRequiresDrop(null); }} 
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${targetSlot === -1 ? 'bg-primary/20 border-primary' : 'hover:bg-secondary/50'}`}
                    >
                      <div className="font-medium italic">Move to Bench</div>
                       <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    </Card>
                 )}
                 {allowMoveToIr && (
                     <Card 
                      onClick={() => { setTargetSlot(-2); setTargetPlayer(null); }} 
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${targetSlot === -2 ? 'bg-primary/20 border-primary' : 'hover:bg-secondary/50'}`}
                    >
                      <div className="font-medium italic">Move to Injured Reserve</div>
                       <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    </Card>
                 )}
                {eligiblePlayers.length > 0 ? (
                  eligiblePlayers.map(p => {
                    const starterIndex = roster.starters.findIndex(s => s?.id === p.id);
                    const slot = (swapCandidate.to === 'starters' || (swapCandidate.player === null)) && starterIndex > -1 ? starterSlots[starterIndex] : 'BE';

                    return (
 <Card 
  key={p.id} 
  onClick={() => { 
    if (requiresDrop) {
      setMoveFromIrRequiresDrop(p);
      setTargetPlayer(null);
    } else {
      setTargetPlayer(p);
    }
    setTargetSlot(null); 
  }} 
  className={cn(
    "flex items-center justify-between p-3 cursor-pointer transition-colors",
    targetPlayer?.id === p.id ? 'bg-primary/20 border-primary' : 'hover:bg-secondary/50',
    moveFromIrRequiresDrop?.id === p.id && 'bg-destructive/20 border-destructive'
  )}
>
<div className="flex items-center gap-3">
  {p ? (
    <>
      <Image 
        src={p.headshotUrl || 'https://picsum.photos/seed/fallback/64/64'} 
        alt={p.name} 
        width={40} 
        height={40} 
        className="rounded-full object-cover"
      />
      <div>
        <div className="flex items-center gap-2">
          <div className="font-medium">{p.name}</div>
          {slot !== 'BE' && <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">{slot}</span>}
        </div>
        <div className="text-xs text-muted-foreground">{p.nflTeam} - {p.position}</div>
      </div>
    </>
  ) : (
    <>
      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
        <span className="text-muted-foreground text-xs">—</span>
      </div>
      <div>
        <div className="font-medium italic text-muted-foreground">Empty Slot</div>
      </div>
    </>
  )}
</div>
  <ArrowRightLeft className={cn("h-5 w-5 text-muted-foreground", requiresDrop && "text-destructive")} />
</Card>
                    )
                  })
                ) : (
                  (eligibleSlots.length === 0 && !allowMoveToBench && !allowMoveToIr && <p className="text-sm text-muted-foreground text-center py-4">No eligible players or slots for this move.</p>)
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDialogCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={executeSwap} 
                disabled={!targetPlayer && targetSlot === null && !moveFromIrRequiresDrop}
                className={cn(moveFromIrRequiresDrop && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              >
                {moveFromIrRequiresDrop ? `Drop ${moveFromIrRequiresDrop.name}` : 'Confirm Move'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {playerToDrop && !moveFromIrRequiresDrop && (
        <AlertDialog open={!!playerToDrop} onOpenChange={() => setPlayerToDrop(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Drop {playerToDrop.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to drop {playerToDrop.name}? This action cannot be undone. They will be placed on waivers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPlayerToDrop(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleConfirmDrop()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Drop Player
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      <PlayerDetailSheet 
        player={selectedPlayer}
        open={!!selectedPlayer}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedPlayer(null);
            }
        }}
        onDropPlayer={(player) => {
            setSelectedPlayer(null); // Close sheet
            setTimeout(() => handleDropPlayer(player), 100); // Open drop dialog
        }}
      />
      <TeamInfoSheet
        open={isTeamInfoSheetOpen}
        onOpenChange={setTeamInfoSheetOpen}
        team={userTeam}
        onSave={handleTeamInfoSave}
      />
    </>
  );
}