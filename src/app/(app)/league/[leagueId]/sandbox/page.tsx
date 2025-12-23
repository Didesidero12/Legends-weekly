'use client';

import { useParams } from 'next/navigation';
import { useContext, useState } from 'react';
import { RosterContext } from '@/context/RosterContext';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { cn } from '@/lib/utils';

export default function SandboxPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const { leagues, updateTeamRoster } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const league = leagues.find(l => l.id === leagueId);
  const userTeam = league?.teams?.find(t => t.managerId === user?.uid);
  const teamId = userTeam?.id;

  // ← Now safe with useMemoFirebase
  const cardsRef = useMemoFirebase(() => {
    if (!firestore || !leagueId || !teamId) return null;
    return collection(firestore, 'leagues', leagueId, 'teams', teamId, 'cards');
  }, [firestore, leagueId, teamId]);

  const { data: cards } = useCollection<LegendaryCard>(cardsRef);

  const [revealing, setRevealing] = useState(false);

  const handleRevealCards = async () => {
    if (!cards || !teamId || !firestore) return;
    setRevealing(true);

    try {
      let totalAddedPoints = 0;

      for (const card of cards) {
        if (card.status === 'pending') {
          const cardRef = doc(firestore, 'leagues', leagueId, 'teams', teamId, 'cards', card.id);
          await updateDoc(cardRef, { status: 'played' });
          totalAddedPoints += card.historicalPoints || 0;
          toast({ title: `${card.playerName} revealed!`, description: `Added ${card.historicalPoints} points to slot ${card.pendingSlotId}` });
        }
      }

      // Update team score in context (add to total or specific slot as per your logic)
      const updatedRoster = { ...userTeam.roster }; // Add points logic here, e.g., to starters
      updateTeamRoster(leagueId, teamId, updatedRoster);

      toast({ title: "All cards revealed!", description: `Added ${totalAddedPoints} total points.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error revealing cards" });
    } finally {
      setRevealing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sandbox / Dev Tools</h1>
      <p className="text-muted-foreground">Testing area for features like legendary cards.</p>

      <Card>
        <CardHeader>
          <CardTitle>Legendary Cards Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cards?.map(card => (
            <Card key={card.id} className="p-4">
              <div className="flex items-center gap-3">
                <Crown className={cn("h-6 w-6", 
                  card.tier === 'Legendary' ? 'text-yellow-500' : 
                  card.tier === 'Epic' ? 'text-purple-500' : 
                  card.tier === 'Rare' ? 'text-blue-500' : 'text-gray-500'
                )} />
                <div className="flex-1">
                  <p className="font-bold text-lg">
                    {card.playerName} ({card.historicalYear})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {card.position} • {card.tier} Tier
                  </p>
                  <Badge className="mt-2">
                    {card.status === 'pending' ? 'Pending Reveal' : 
                    card.status === 'played' ? 'Played' : 'In Hand'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{card.historicalPoints}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                  {card.pendingSlotId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Slot: {card.pendingSlotId}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Button onClick={handleRevealCards} disabled={revealing || !cards?.some(c => c.status === 'pending')}>
            {revealing ? 'Revealing...' : 'Reveal Active Cards'}
          </Button>
        </CardContent>
      </Card>

      {/* Keep your existing SleeperTestButton or other tools */}
    </div>
  );
}