
'use client';
import { useState, useEffect, useMemo, useContext } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { Player, Team, League, Matchup, RosterSlot, LegendaryCard, CardTier } from '@/lib/types';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Crown, Swords } from 'lucide-react';
import { MatchupCarousel } from '@/components/matchup-carousel';
import { LeagueScoresSheet } from '@/components/league-scores-sheet';
import { Separator } from '@/components/ui/separator';
import { TeamHelmet } from '@/components/team-helmet';
import { RosterContext } from '@/context/RosterContext';
import { PlayerDetailSheet } from '@/components/player-detail-sheet';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlayerInfo } from '@/components/player-info';
import { collection } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';


const EMPTY_ROSTER: { starters: RosterSlot[], bench: Player[], ir: Player[] } = { starters: Array(9).fill(null), bench: [], ir: [] };

const PLACEHOLDER_TEAM: Team = {
  id: 'placeholder',
  name: 'Waiting for Opponent',
  owner: 'Open Slot',
  logoUrl: 'https://picsum.photos/seed/placeholder-logo/64/64',
  record: '0-0',
  roster: EMPTY_ROSTER,
  managerId: 'placeholder',
  leagueId: 'placeholder',
};

const tierStyles: Record<CardTier, { badge: string; text: string; crown: string; }> = {
  Legendary: { badge: 'bg-yellow-400/10 border-yellow-400/50', text: 'text-yellow-300', crown: 'text-yellow-400' },
  Epic: { badge: 'bg-purple-400/10 border-purple-400/50', text: 'text-purple-300', crown: 'text-purple-400' },
  Rare: { badge: 'bg-blue-400/10 border-blue-400/50', text: 'text-blue-300', crown: 'text-blue-400' },
  Common: { badge: 'bg-gray-400/10 border-gray-400/50', text: 'text-gray-300', crown: 'text-gray-400' },
};

// Helper to get points for a player in a specific slot, with legendary override
const getSlotPoints = (
  player: Player | null,
  slotIndex: number,
  cards: LegendaryCard[] = [],
  position: string
) => {
  if (!player) return 0;

  const slotId = `${position}-${slotIndex}`;
  const activeCard = cards.find(c => 
    c.status === 'played' && 
    c.pendingSlotId === slotId
  );

  if (activeCard?.historicalPoints !== undefined) {
    return activeCard.historicalPoints;
  }

  return player.actualPoints ?? player.projectedPoints ?? 0;
};

function PlayerRow({ 
  userPlayer, 
  opponentPlayer, 
  position, 
  onPlayerClick,
  userCards = [],
  opponentCards = [],
  slotIndex,
  selectedWeek = 16  // ← Add this with default
}: { 
  userPlayer: Player | null;
  opponentPlayer: Player | null;
  position: string; 
  onPlayerClick: (player: Player | null) => void;
  userCards: LegendaryCard[];
  opponentCards: LegendaryCard[];
  slotIndex: number;
  selectedWeek?: number;  // ← Add this
}) {
  const [userScore, setUserScore] = useState(userPlayer?.actualPoints ?? 0);
  const [opponentScore, setOpponentScore] = useState(opponentPlayer?.actualPoints ?? 0);
  const isMobile = useIsMobile();

  // Find active played card for user player
const userActiveCard = userCards?.find(c => 
  c.status === 'played' && 
  c.pendingSlotId === `${position}-${slotIndex}`
);

// Find active played card for opponent player
const opponentActiveCard = opponentCards?.find(c => 
  c.status === 'played' && 
  c.pendingSlotId === `${position}-${slotIndex}`
);

  const getPlayerWeekScore = (player: Player | null) => {
    if (!player || !player.gameLog) return 0;
    const weekLog = player.gameLog.find(g => g.week === selectedWeek);
    return weekLog?.fpts || 0;
  };

  const userDisplayName = userPlayer ? userPlayer.name : 'Empty Slot';
const opponentDisplayName = opponentPlayer ? opponentPlayer.name : 'Empty Slot';
  

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        if (userPlayer && Math.random() > 0.6) setUserScore(score => score + (Math.random() * 2));
        if (opponentPlayer && Math.random() > 0.6) setOpponentScore(score => score + (Math.random() * 2));
      }, 25000 + Math.random() * 20000);
      return () => clearInterval(interval);
    }
  }, [userPlayer, opponentPlayer]);

  const formatOpponent = (opponentString: string) => {
    return opponentString.replace('@', '').replace('vs ', '');
  };

  const renderPlayer = (player: RosterSlot, cards: LegendaryCard[] | undefined, isOpponent = false) => {
    if (!player) {
      return <div className="text-muted-foreground italic text-xs h-[40px] flex items-center">Empty</div>;
    }

    // Find ACTIVE PLAYED card (override) or pending (visual)
    const activeCard = cards?.find(c => 
      c.status === 'played' && 
      c.pendingSlotId === `${position}-${slotIndex}`
    );
    const pendingCard = cards?.find(c => c.status === 'pending' && c.pendingSlotId === `${position}-${slotIndex}`);

    const tierStylesForCard = activeCard ? tierStyles[activeCard.tier] : pendingCard ? tierStyles[pendingCard.tier] : null;

    const secondaryInfo = (
      <div className={cn("flex items-center gap-2", isOpponent && "justify-end")}>
        <div className="text-xs text-muted-foreground leading-tight">
          {player.opponent ? formatOpponent(player.opponent.team) : ''} {player.gameTime}
        </div>
        {(activeCard || pendingCard) && tierStylesForCard && (
          <Badge variant="secondary" className={cn("text-xs py-0 h-4", tierStylesForCard.badge, tierStylesForCard.text)}>
            <Crown className={cn("w-2.5 h-2.5 mr-1", tierStylesForCard.crown)} />
            {activeCard ? `${activeCard.playerName} (${activeCard.historicalYear})` : `${pendingCard?.tier} Pending`}
          </Badge>
        )}
      </div>
    );

    return (
      <PlayerInfo 
        player={player} 
        onClick={() => onPlayerClick(player)} 
        showImage={!isMobile} 
        showPosition={false} 
        layout={isOpponent ? 'right' : 'left'} 
        abbreviateName={isMobile}
        secondaryInfo={secondaryInfo}
        overrideName={activeCard ? activeCard.playerName : undefined} // Optional: show legendary name
      />
    );
  };

  if (isMobile) {
    return (
      <TableRow className="text-xs">
        <TableCell colSpan={5} className="p-0">
          <div className="flex items-center justify-between w-full p-1">
            <div className="flex-1 flex flex-col items-start text-left pr-2">
              {renderPlayer(userPlayer, userCards, false)}
            </div>
            <div className="flex-shrink-0 text-right">
            <div className="font-bold text-lg text-primary">
              {(userActiveCard?.historicalPoints ?? getPlayerWeekScore(userPlayer)).toFixed(2)}
            </div>
              <div className="text-muted-foreground text-xs">
                {userPlayer?.projectedPoints?.toFixed(2) ?? '--'}
              </div>
            </div>
            
            <div className="w-12 flex-shrink-0 text-center font-semibold text-muted-foreground self-center px-1">
              {position}
            </div>
            
            <div className="flex-shrink-0 text-left">
            </div>
            <div className="flex-1 flex flex-col items-end text-right pl-2">
              {renderPlayer(opponentPlayer, opponentCards, true)}
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="w-2/5">
        {renderPlayer(userPlayer, userCards, false)}
      </TableCell>
      <TableCell className="text-center">
      <div className="font-bold text-lg text-primary">
        {(userActiveCard?.historicalPoints ?? getPlayerWeekScore(userPlayer)).toFixed(2)}
      </div>
        <div className="text-xs text-muted-foreground">
          {userPlayer?.projectedPoints?.toFixed(2) ?? '--'}
        </div>
      </TableCell>
      
      <TableCell className="text-center font-semibold text-muted-foreground w-[50px]">{position}</TableCell>
      
      <TableCell className="text-center">
      <div className="font-bold text-lg text-primary">
        {(opponentActiveCard?.historicalPoints ?? getPlayerWeekScore(opponentPlayer)).toFixed(2)}
      </div>
        <div className="text-xs text-muted-foreground">
          {opponentPlayer?.projectedPoints?.toFixed(2) ?? '--'}
        </div>
      </TableCell>
      <TableCell className="w-2/5 text-right">
        {renderPlayer(opponentPlayer, opponentCards, true)}
      </TableCell>
    </TableRow>
  );
}


function MatchupComparison({ 
  matchup, 
  starterSlots, 
  benchSize, 
  irSize, 
  onPlayerClick,
  userCards = [],           
  opponentCards = [],
  selectedWeek = 16  // ← Add this
}: { 
  matchup: Matchup;
  starterSlots: string[];
  benchSize: number;
  irSize: number;
  onPlayerClick: (player: Player) => void;
  userCards: LegendaryCard[];       
  opponentCards: LegendaryCard[];
  selectedWeek?: number;  // ← Add this
}) {
  const { userTeam, opponentTeam } = matchup;
  
  const userRoster = userTeam.roster ?? EMPTY_ROSTER;
  const opponentRoster = opponentTeam ? (opponentTeam.roster ?? EMPTY_ROSTER) : EMPTY_ROSTER;

    // Calculate total scores with legendary card overrides
const totalUserScore = useMemo(() => {
  let total = 0;
  userRoster.starters.forEach((player, index) => {
    if (!player) return;

    const slotId = `${starterSlots[index]}-${index}`;
    const activeCard = userCards.find(c => c.status === 'played' && c.pendingSlotId === slotId);

    if (activeCard?.historicalPoints !== undefined) {
      total += activeCard.historicalPoints;
    } else if (player.gameLog) {
      const weekLog = player.gameLog.find(g => g.week === selectedWeek);
      total += weekLog?.fpts || 0;
    }
  });
  return total;
}, [userRoster.starters, userCards, starterSlots, selectedWeek]);

const totalOpponentScore = useMemo(() => {
  let total = 0;
  opponentRoster.starters.forEach((player, index) => {
    if (!player) return;

    const slotId = `${starterSlots[index]}-${index}`;
    const activeCard = opponentCards.find(c => c.status === 'played' && c.pendingSlotId === slotId);

    if (activeCard?.historicalPoints !== undefined) {
      total += activeCard.historicalPoints;
    } else if (player.gameLog) {
      const weekLog = player.gameLog.find(g => g.week === selectedWeek);
      total += weekLog?.fpts || 0;
    }
  });
  return total;
}, [opponentRoster.starters, opponentCards, starterSlots, selectedWeek]);

  // Keep your existing useState for live demo updates
  const [displayedUserScore, setDisplayedUserScore] = useState(totalUserScore);
  const [displayedOpponentScore, setDisplayedOpponentScore] = useState(totalOpponentScore);
  
useEffect(() => {
  // Initial set from calculated (with legendary overrides)
  setDisplayedUserScore(totalUserScore);
  setDisplayedOpponentScore(totalOpponentScore);

  if (typeof window !== 'undefined') {
    const interval = setInterval(() => {
      setDisplayedUserScore(prev => prev + Math.random() * 3);
      setDisplayedOpponentScore(prev => prev + Math.random() * 3);
    }, 30000);
    return () => clearInterval(interval);
  }
}, [totalUserScore, totalOpponentScore]);
  
  const userProjected = userRoster.starters.reduce((sum, p) => sum + (p?.projectedPoints ?? 0), 0);
  const opponentProjected = opponentRoster.starters.reduce((sum, p) => sum + (p?.projectedPoints ?? 0), 0);

  const winProbability = useMemo(() => {
    const totalScore = totalUserScore + totalOpponentScore;
    if (totalScore === 0) {
      const totalProjected = userProjected + opponentProjected;
      if (totalProjected === 0) return 50;
      return (userProjected / totalProjected) * 100;
    }
    return (totalUserScore / totalScore) * 100;
  }, [totalUserScore, totalOpponentScore, userProjected, opponentProjected]);
  
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <Image src={userTeam.logoUrl} alt={userTeam.name} width={64} height={64} className="rounded-lg w-12 h-12 sm:w-16 sm:h-16" />
                 <div className="flex-1">
                    <CardTitle className="font-headline text-sm sm:text-base truncate">{userTeam.name}</CardTitle>
                    <CardDescription className="text-xs">{userTeam.owner} ({userTeam.record})</CardDescription>
                    <div className="text-3xl sm:text-4xl font-bold text-primary">{totalUserScore.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">PROJ {userProjected.toFixed(2)}</div>
                </div>
            </div>

            <div className="font-headline text-muted-foreground px-2">VS</div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
                <div className="flex-1 text-right">
                    <CardTitle className="font-headline text-sm sm:text-base truncate">{opponentTeam.name}</CardTitle>
                    <CardDescription className="text-xs">{opponentTeam.owner} ({opponentTeam.record})</CardDescription>
                    <div className="text-3xl sm:text-4xl font-bold text-primary">{totalOpponentScore.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">PROJ {opponentProjected.toFixed(2)}</div>
                </div>
                <Image src={opponentTeam.logoUrl} alt={opponentTeam.name} width={64} height={64} className="rounded-lg w-12 h-12 sm:w-16 sm:h-16" />
            </div>
        </div>
         <div className="mt-4 space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-primary">{winProbability.toFixed(0)}%</span>
                <span className="text-muted-foreground">Win Probability</span>
                <span className="text-primary">{(100 - winProbability).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1">
                <Progress value={winProbability} className="h-2 w-full" />
                <Progress value={100 - winProbability} className="h-2 w-full rotate-180" />
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-lg px-4 sm:px-0">Starters</h3>
              <Table>
                <TableBody>
                {starterSlots.map((pos, index) => (
                  <PlayerRow 
                    key={`starter-${index}`} 
                    userPlayer={userRoster.starters[index] ?? null}
                    opponentPlayer={opponentRoster.starters[index] ?? null}
                    position={pos}
                    onPlayerClick={(player) => player && onPlayerClick(player)}
                    userCards={userCards}
                    opponentCards={opponentCards}
                    slotIndex={index}
                    selectedWeek={selectedWeek}  // ← Add this
                  />
                ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div>
              <h3 className="mb-2 font-semibold text-lg px-4 sm:px-0">Bench</h3>
              <Table>
                <TableBody>
                {Array.from({ length: benchSize }).map((_, index) => (
                  <PlayerRow 
                    key={`bench-${index}`}
                    userPlayer={userRoster.bench[index] ?? null}
                    opponentPlayer={opponentRoster.bench[index] ?? null}
                    position="BE"
                    onPlayerClick={(player) => player && onPlayerClick(player)}
                    userCards={userCards}
                    opponentCards={opponentCards}
                    slotIndex={index}
                  />
                ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div>
              <h3 className="mb-2 font-semibold text-lg px-4 sm:px-0">Injured Reserve</h3>
              <Table>
                <TableBody>
                  {Array.from({ length: irSize }).map((_, index) => (
                    <PlayerRow 
                      key={`ir-${index}`}
                      userPlayer={userRoster.ir[index] ?? null}
                      opponentPlayer={opponentRoster.ir[index] ?? null}
                      position="IR"
                      onPlayerClick={(player) => player && onPlayerClick(player)}
                      userCards={userCards}
                      opponentCards={opponentCards}
                      slotIndex={index}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}


export default function MatchupPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const { leagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  
  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);
  const teams = useMemo(() => league?.teams || [], [league]);

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

  const [isScoresSheetOpen, setScoresSheetOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(16); // Current week


const [weeklyMatchups, setWeeklyMatchups] = useState<(Matchup & { id: string })[]>([]);

useEffect(() => {
  if (teams.length === 0 || weeklyMatchups.length > 0) return;

  const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
  const matchups: Matchup[] = [];

  if (shuffledTeams.length === 1) {
    matchups.push({
      week: 1,
      userTeam: shuffledTeams[0],
      opponentTeam: PLACEHOLDER_TEAM
    });
  } else {
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      const team1 = shuffledTeams[i];
      const team2 = shuffledTeams[i + 1];
      if (team1 && team2) {
        matchups.push({
          week: 1,
          userTeam: team1,
          opponentTeam: team2,
        });
      } else if (team1) {
        matchups.push({
          week: 1,
          userTeam: team1,
          opponentTeam: PLACEHOLDER_TEAM,
        });
      }
    }
  }

  // Ensure user's matchup is first
  const userMatchupIndex = matchups.findIndex(m => 
    m.userTeam.managerId === user?.uid || m.opponentTeam.managerId === user?.uid
  );
  if (userMatchupIndex > 0) {
    const userMatchup = matchups[userMatchupIndex];
    if (userMatchup.opponentTeam.managerId === user?.uid) {
      [userMatchup.userTeam, userMatchup.opponentTeam] = [userMatchup.opponentTeam, userMatchup.userTeam];
    }
    matchups.splice(userMatchupIndex, 1);
    matchups.unshift(userMatchup);
  }

  // Add stable IDs
  const matchupsWithIds = matchups.map(matchup => {
    const teamIds = [matchup.userTeam.id, matchup.opponentTeam.id].sort((a, b) => a.localeCompare(b));
    return {
      ...matchup,
      id: `${teamIds[0]}-vs-${teamIds[1]}`
    };
  });

  setWeeklyMatchups(matchupsWithIds);  // ← This closes the useEffect call
}, [teams, user, weeklyMatchups.length]);
  

  const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null);

  const userTeamId = useMemo(() => selectedMatchup?.userTeam.managerId === user?.uid ? selectedMatchup?.userTeam.id : selectedMatchup?.opponentTeam.managerId === user?.uid ? selectedMatchup?.opponentTeam.id : null, [selectedMatchup, user]);
  const opponentTeamId = useMemo(() => selectedMatchup?.userTeam.managerId === user?.uid ? selectedMatchup?.opponentTeam.id : selectedMatchup?.userTeam.id, [selectedMatchup, user]);

  const userCardsRef = useMemoFirebase(() => (firestore && leagueId && userTeamId) ? collection(firestore, 'leagues', leagueId, 'teams', userTeamId, 'cards') : null, [firestore, leagueId, userTeamId]);
  const opponentCardsRef = useMemoFirebase(() => (firestore && leagueId && opponentTeamId) ? collection(firestore, 'leagues', leagueId, 'teams', opponentTeamId, 'cards') : null, [firestore, leagueId, opponentTeamId]);

  const { data: userCardsData } = useCollection<LegendaryCard>(userCardsRef);
  const { data: opponentCardsData } = useCollection<LegendaryCard>(opponentCardsRef);


  useEffect(() => {
    if (weeklyMatchups.length > 0 && !selectedMatchup) {
      const userMatchup = weeklyMatchups.find(m => m.userTeam.managerId === user?.uid || m.opponentTeam?.managerId === user?.uid);
      
      // If user is opponentTeam, swap them for consistent display
      if(userMatchup && userMatchup.opponentTeam.managerId === user?.uid) {
        const correctedMatchup = { ...userMatchup, userTeam: userMatchup.opponentTeam, opponentTeam: userMatchup.userTeam };
        setSelectedMatchup(correctedMatchup);
      } else {
        setSelectedMatchup(userMatchup || weeklyMatchups[0]);
      }
    } else if (weeklyMatchups.length > 0 && selectedMatchup) {
        // If a matchup is already selected, ensure it's up-to-date with the latest data
        const freshMatchup = weeklyMatchups.find(m => m.userTeam.id === selectedMatchup.userTeam.id && m.opponentTeam.id === selectedMatchup.opponentTeam.id);
        if (freshMatchup) {
            setSelectedMatchup(freshMatchup);
        }
    }

  }, [weeklyMatchups, selectedMatchup, user]);
  
  const handleDropPlayer = (player: Player) => {
    toast({
        variant: 'destructive',
        title: 'Action Not Available',
        description: 'You can only drop players from the "My Team" page.',
    });
  }

  if (!league || !selectedMatchup) {
    return <div>Loading matchup...</div>
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
          <Button variant="outline" className="hidden sm:flex" onClick={() => setScoresSheetOpen(true)}>
              <Swords className="mr-2 h-4 w-4" />
              League Scores
          </Button>
          <div className="flex-1 overflow-hidden">
          <MatchupCarousel 
            matchups={weeklyMatchups} 
            selectedMatchup={selectedMatchup}
            onSelectMatchup={setSelectedMatchup}
            selectedWeek={selectedWeek}  // ← Add this
          />
          </div>
      </div>
      
      <MatchupComparison 
        matchup={selectedMatchup} 
        starterSlots={starterSlots}
        benchSize={benchSize}
        irSize={irSize}
        onPlayerClick={(player) => player && setSelectedPlayer(player)}
        userCards={userCardsData ?? []}
        opponentCards={opponentCardsData ?? []}
      />

       <LeagueScoresSheet 
        open={isScoresSheetOpen}
        onOpenChange={setScoresSheetOpen}
        matchups={weeklyMatchups}
        leagueName={league.name}
      />
    </div>

    <PlayerDetailSheet 
        player={selectedPlayer}
        open={!!selectedPlayer}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedPlayer(null);
            }
        }}
        onDropPlayer={handleDropPlayer}
      />
    </>
  );
}