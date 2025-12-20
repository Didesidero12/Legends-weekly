

"use client";

import { useState, useMemo, useContext } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Player, RosterSlot } from '@/lib/types';
import { RosterContext } from '@/context/RosterContext';
import { firestore } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import { TeamHelmet } from '@/components/team-helmet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PlayerDetailSheet } from '@/components/player-detail-sheet';
import { useParams } from 'next/navigation';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useUser } from '@/firebase';

const ROSTER_SIZE = 15; // 9 starters + 6 bench

function deepCleanObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(deepCleanObject).filter(item => item !== null);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = deepCleanObject(obj[key]);
        if (value !== null) {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }
  return obj;
}

function PlayerStatus({ status }: { status: Player['status'] }) {
    if (status === 'Healthy' || status === 'Bye') return null;

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

export default function PlayersPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [playerToClaim, setPlayerToClaim] = useState<Player | null>(null);
  const [playerToDrop, setPlayerToDrop] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [freeAgentMode, setFreeAgentMode] = useState(false);
  
  const { leagues, updateTeamRoster, availablePlayers, setAvailablePlayers } = useContext(RosterContext);
  const params = useParams();
  const leagueId = params.leagueId as string;
  
const currentLeague = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);
const userTeam = useMemo(() => currentLeague?.teams?.find(t => t.managerId === user?.uid), [currentLeague, user]);
const roster = useMemo(() => userTeam?.roster, [userTeam]); // ← This line was missing

const isOwner = useMemo(() => user?.uid === currentLeague?.ownerId, [user, currentLeague]);

const isDraftComplete = useMemo(() => {
  if (!currentLeague?.draftDate) return false;
  const draftTime = (currentLeague.draftDate as any).toDate ? (currentLeague.draftDate as any).toDate().getTime() : new Date(currentLeague.draftDate).getTime();
  return draftTime < new Date().getTime();
}, [currentLeague]);

const isUnlocked = freeAgentMode || isDraftComplete; // Use freeAgentMode for testing

const teamRoster = useMemo(() => {
  if (!roster) return [];
  return roster.starters.concat(roster.bench).filter((p): p is Player => p !== null)
}, [roster]);

  const { toast } = useToast();

  const filteredPlayers = useMemo(() => 
    (availablePlayers || []).filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !teamRoster.some(rosterPlayer => rosterPlayer.id === p.id)
    ), [searchQuery, teamRoster, availablePlayers]);

const handleAddPlayer = async (player: Player) => {  // ← ADD async HERE
  if (!roster || !userTeam || !player) return;

  if (teamRoster.length >= ROSTER_SIZE) {
    toast({ variant: "destructive", title: "Roster Full", description: "Drop a player first" });
    return;
  }

  const cleanPlayer = deepCleanObject(player);
  const newBench = [...roster.bench, cleanPlayer];
  const newRoster = deepCleanObject({ ...roster, bench: newBench });

  updateTeamRoster(leagueId, userTeam.id, newRoster);

  // Global rostered mark
  try {
    await setDoc(doc(firestore, `leagues/${leagueId}/rosteredPlayers`, player.id), {
      teamId: userTeam.id,
      addedAt: serverTimestamp(),
    });
    console.log("Marked as rostered:", player.id); // ← HERE
  } catch (err) {
    console.error("Failed to mark player as rostered globally", err);
  }

  setAvailablePlayers(prev => prev?.filter(p => p.id !== player.id) || []);
  toast({ title: "Player Added", description: `${player.name} added to your bench` });
};

  const handleClaimClick = (player: Player) => {
    setPlayerToClaim(player);
  };

 const handleConfirmClaim = async () => {  // ← ADD async HERE
  if (!playerToClaim || !roster || !userTeam || !setAvailablePlayers) return;

  const currentRosterSize = teamRoster.length;
  
  if (currentRosterSize < ROSTER_SIZE) {
      const newBench = [...roster.bench, playerToClaim];
      updateTeamRoster(leagueId, userTeam.id, { ...roster, bench: newBench });

      // Global mark for added player
    try {
      await setDoc(doc(firestore, `leagues/${leagueId}/rosteredPlayers`, playerToClaim.id), {
        teamId: userTeam.id,
        addedAt: serverTimestamp(),
      });
      console.log("Marked as rostered:", playerToClaim.id); // ← HERE
    } catch (err) {
      console.error("Failed to mark claimed player as rostered", err);
    }

      setAvailablePlayers(prev => (prev || []).filter(p => p.id !== playerToClaim.id));
      toast({
          title: "Player Added",
          description: `${playerToClaim.name} has been added to your bench.`,
      });
  } else {
        if (!playerToDrop) {
             toast({
                variant: 'destructive',
                title: "Roster Full",
                description: `You must select a player to drop to add ${playerToClaim.name}.`,
            });
            return;
        }

        let newStarters: RosterSlot[] = [...roster.starters];
        let newBench: Player[] = [...roster.bench];

        const starterIndex = roster.starters.findIndex(p => p?.id === playerToDrop!.id);
        if (starterIndex > -1) {
            newStarters[starterIndex] = null;
        } else {
            newBench = newBench.filter(p => p.id !== playerToDrop!.id);
        }
        
        newBench.push(playerToClaim);

updateTeamRoster(leagueId, userTeam.id, { ...roster, starters: newStarters, bench: newBench });

      // Global mark for added player
      try {
        await setDoc(doc(firestore, `leagues/${leagueId}/rosteredPlayers`, playerToClaim.id), {
          teamId: userTeam.id,
          addedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to mark claimed player as rostered", err);
      }

      // Global unmark for dropped player
      try {
        await deleteDoc(doc(firestore, `leagues/${leagueId}/rosteredPlayers`, playerToDrop!.id));
        console.log("Unmarked dropped player:", playerToDrop!.id); // ← Optional debug
      } catch (err) {
        console.error("Failed to unmark dropped player", err);
      }
        setAvailablePlayers(prev => {
            const withoutAdded = (prev || []).filter(p => p.id !== playerToClaim!.id);
            if (!withoutAdded.some(p => p.id === playerToDrop!.id)) {
                return [...withoutAdded, playerToDrop as Player];
            }
            return withoutAdded;
        });

        toast({
            title: "Waiver Claim Submitted",
            description: `Your claim for ${playerToClaim.name} (dropping ${playerToDrop.name}) has been placed.`,
        });
    }

    setPlayerToClaim(null);
    setPlayerToDrop(null);
  };

  const handleCancel = () => {
    setPlayerToClaim(null);
    setPlayerToDrop(null);
  }

  const playerPositions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  
  if (!roster || !currentLeague) {
      return <div>Loading players...</div>;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Available Players</CardTitle>
        <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for players..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
{/* ==== TESTING GOD MODE — VISIBLE TO EVERYONE IN DEV ==== */}
<div className="mt-4 flex items-center justify-end gap-4">
  {/* This will be hidden in production, shown in dev */}
  {process.env.NODE_ENV !== 'production' && (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-orange-600">TESTING MODE</span>
      <Button 
        onClick={() => setFreeAgentMode(!freeAgentMode)} 
        variant={freeAgentMode ? "destructive" : "outline"}
        size="sm"
        className={freeAgentMode ? "bg-green-600 hover:bg-green-700 text-white" : ""}
      >
        {freeAgentMode ? '✅ GOD MODE ON' : 'Enable God Mode'}
      </Button>
    </div>
  )}

  {/* Optional: Keep clean owner-only version for production */}
  {process.env.NODE_ENV === 'production' && isOwner && (
    <Button 
      onClick={() => setFreeAgentMode(!freeAgentMode)} 
      variant={freeAgentMode ? "default" : "outline"}
      size="sm"
    >
      {freeAgentMode ? 'Free Agent Mode ON' : 'Free Agent Mode'}
    </Button>
  )}
</div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ALL">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
            {playerPositions.map(pos => <TabsTrigger key={pos} value={pos}>{pos}</TabsTrigger>)}
          </TabsList>
          {playerPositions.map(position => (
            <TabsContent key={position} value={position}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Proj</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.filter(p => position === 'ALL' || p.position === position).map(player => (
                    <TableRow key={player.id}>
                      <TableCell>
<div className="flex items-center gap-3">
<img 
  src={player.headshotUrl || 'https://picsum.photos/seed/fallback/64/64'} 
  alt={player.name} 
  className="w-10 h-10 rounded-full object-cover"
  onError={(e) => {
    e.currentTarget.src = 'https://picsum.photos/seed/fallback/64/64';
  }}
/>
  <div>
    <div className="flex items-center gap-2">
      <button onClick={() => setSelectedPlayer(player)} className="font-medium hover:underline">{player.name}</button>
      <TeamHelmet team={player.nflTeam} className="w-4 h-4" />
      <span className="text-xs text-muted-foreground">{player.position}</span>
      <PlayerStatus status={player.status} />
    </div>
    <div className="flex items-center gap-x-2 whitespace-nowrap text-[11px] text-muted-foreground -mt-0.5">
      <span>{player.rosterPercentage ?? 0}% Rost</span>
      <span>{player.startPercentage ?? 0}% Start</span>
    </div>
    <div className={cn("flex items-center gap-x-2 whitespace-nowrap text-[11px] text-muted-foreground -mt-0.5")}>
      <span>{player.gameTime ?? '--'}</span>
      <span className={getRankColor(player.opponent?.rank ?? 32)}>
        {player.opponent?.team ?? 'BYE'} ({player.opponent?.rank ?? '--'})
      </span>
    </div>
  </div>
</div>
                      </TableCell>
                      <TableCell className="text-right">
                        {(player.projectedPoints ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(player.actualPoints ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {freeAgentMode || isUnlocked ? (
                          <Button size="sm" variant="outline" onClick={() => handleAddPlayer(player)}>
                            {freeAgentMode ? 'Add' : 'Claim'}
                          </Button>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" disabled>
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Roster moves are locked until the draft is complete.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>

    {playerToClaim && (
      <AlertDialog open={!!playerToClaim} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit claim for {playerToClaim.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Your waiver priority is <span className="font-bold text-foreground">3 of {currentLeague.totalTeams}</span>. 
                {teamRoster.length >= ROSTER_SIZE 
                    ? ` Your roster is full. Select a player to drop.`
                    : ` This player will be added to your bench.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {teamRoster.length >= ROSTER_SIZE && (
              <div className="max-h-60 overflow-y-auto p-1 space-y-2">
                  {teamRoster.map(p => (
                      <Card 
                        key={p.id} 
                        onClick={() => setPlayerToDrop(p)} 
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${playerToDrop?.id === p.id ? 'bg-destructive/20 border-destructive' : 'hover:bg-secondary/50'}`}
                      >
                        <div className="flex items-center gap-3">
<img 
  src={player.headshotUrl || 'https://picsum.photos/seed/fallback/64/64'} 
  alt={player.name} 
  className="w-10 h-10 rounded-full object-cover"
  onError={(e) => {
    e.currentTarget.src = 'https://picsum.photos/seed/fallback/64/64';
  }}
/>
                          <div>
                            <div className="font-medium">{p.name} <span className="text-xs text-muted-foreground">{p.position}</span></div>
                            <div className="text-xs text-muted-foreground">{p.nflTeam}</div>
                          </div>
                        </div>
                      </Card>
                  ))}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmClaim} disabled={teamRoster.length >= ROSTER_SIZE && !playerToDrop}>
                Submit Claim
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
            toast({
                variant: 'destructive',
                title: 'Cannot Drop Player Here',
                description: 'Please manage your roster from the "My Team" page.',
            });
        }}
    />
    </>
  );
}
