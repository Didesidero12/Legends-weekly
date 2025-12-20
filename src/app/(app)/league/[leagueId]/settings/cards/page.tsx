'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RosterContext } from '@/context/RosterContext';
import { useUser } from '@/firebase/provider';
import { doc, updateDoc, setDoc } from 'firebase/firestore'; // Added setDoc
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

const mechanics = [
  { value: 'pure-skill', label: '1. Pure Skill', description: 'Top 50% of scoreboard get 1 pack' },
  { value: 'reverse-standings', label: '2. Reverse Standings Lottery', description: 'Bottom 50% get 1 pack (helps bad teams)' },
  { value: 'hybrid-5050', label: '3. Hybrid 50/50 (Recommended Default)', description: 'Top 4 → 2 packs each, Bottom 6 → 1 pack each' },
  { value: 'win-streak', label: '4. Win Streak Bonus', description: 'Every current win streak adds +1 pack (max 3)' },
  { value: 'faab-rebate', label: '5. FAAB Rebate', description: 'Weekly FAAB spent refunded as packs (e.g., $10 = 1 common pack)' },
  { value: 'achievement-unlocks', label: '6. Achievement Unlocks', description: 'Hit milestones → free pack (e.g., 150+ pts, 3 TDs from DEF)' },
  { value: 'playoff-seeding', label: '7. Playoff Seeding Bonus', description: 'Final regular-season rank = bonus packs (1st = 5 packs, etc.)' },
  { value: 'all-teams-equal', label: '8. All Teams Equal', description: 'Every team gets exactly 1 pack per week' },
  { value: 'winner-takes-all', label: '9. Winner Takes All', description: 'Only 1st place gets 3 packs, 2nd gets 1, everyone else 0' },
  { value: 'random-chaos', label: '10. Random Chaos', description: 'Random 4-6 teams get packs each week' },
];

const rarity = [
  { tier: 'Legendary', chance: '5%', glow: 'Gold + shimmer' },
  { tier: 'Epic', chance: '15%', glow: 'Purple' },
  { tier: 'Rare', chance: '30%', glow: 'Blue' },
  { tier: 'Common', chance: '50%', glow: 'Silver/Gray' },
];

export default function LegendaryCardSettingsPage() {
  const router = useRouter();
  const { leagueId } = useParams();
  const { leagues, setLeagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast(); // ← Add this line

  const [manualTier, setManualTier] = useState<CardTier>('Common');
  const [manualPosition, setManualPosition] = useState<string>('QB');
  const [manualTeamId, setManualTeamId] = useState<string>('');

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  if (!league) return <div className="p-6">Loading...</div>;

  const isOwner = user?.uid === league.ownerId;

  if (!isOwner) return <div className="p-6">Only the owner can edit card settings.</div>;

  const cardSettings = league.cardSettings || { mechanic: 'hybrid-5050', playoffBonus: true, legendDecay: false, nerfRule: false, tradeTax: false, playoffReset: false };

  const handleSave = async () => {
    const updates = { cardSettings };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    try {
      await updateDoc(doc(firestore, 'leagues', leagueId), updates);
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  const updateSetting = (key: keyof typeof cardSettings, value: any) => {
    const newSettings = { ...cardSettings, [key]: value };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, cardSettings: newSettings } : l);
    setLeagues(updatedLeagues);
  };

const handleManualAddCard = async () => {
  if (!manualTeamId || !manualTier || !manualPosition) {
    toast({
      variant: "destructive",
      title: "Missing Info",
      description: "Select team, tier, and position",
    });
    return;
  }

  const newCard: LegendaryCard = {
    id: `manual-${Date.now()}`,  // ← Fixed: no undefined 'i'
    playerId: 'TBD',
    playerName: 'TBD',
    position: manualPosition,
    tier: manualTier,
    historicalWeek: 0,
    historicalYear: 0,
    historicalPoints: 0,
    status: 'unplayed',
    pendingSlotId: null,
  };

  const teamRef = doc(firestore, 'leagues', leagueId, 'teams', manualTeamId, 'cards', newCard.id);
  
  try {
    await setDoc(teamRef, newCard);
    toast({
      title: "Card Added!",
      description: `${manualTier} ${manualPosition} card added manually`,
    });
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Failed to add card",
    });
  }
};

const handleRunDistribution = async () => {
  if (!league.teams || league.teams.length === 0) {
    toast({ variant: "destructive", title: "No teams in league" });
    return;
  }

  // Mock weekly scores (in real app: pull from matchups/week)
  const teamScores = league.teams.map(team => ({
    teamId: team.id,
    score: Math.floor(Math.random() * 200) + 50, // Random for testing
  })).sort((a, b) => b.score - a.score);

  const mechanic = cardSettings.mechanic || 'hybrid-5050';
  let packsPerTeam: Record<string, number> = {};

  switch (mechanic) {
    case 'pure-skill':
      teamScores.slice(0, Math.ceil(teamScores.length / 2)).forEach(t => packsPerTeam[t.teamId] = 1);
      break;
    case 'reverse-standings':
      teamScores.slice(Math.floor(teamScores.length / 2)).forEach(t => packsPerTeam[t.teamId] = 1);
      break;
    case 'hybrid-5050':
      teamScores.slice(0, 4).forEach(t => packsPerTeam[t.teamId] = 2);
      teamScores.slice(4).forEach(t => packsPerTeam[t.teamId] = 1);
      break;
    case 'win-streak':
      // Placeholder — real would track streaks
      teamScores.forEach(t => packsPerTeam[t.teamId] = Math.min(3, Math.floor(Math.random() * 4)));
      break;
    case 'all-teams-equal':
      teamScores.forEach(t => packsPerTeam[t.teamId] = 1);
      break;
    // Add other mechanics as needed
    default:
      packsPerTeam = {}; // No packs
  }

  // Award cards
  for (const [teamId, packs] of Object.entries(packsPerTeam)) {
    for (let i = 0; i < packs; i++) {
      const tier = getRandomTier();
      const position = getRandomPosition();

      const newCard: LegendaryCard = {
        id: `manual-${Date.now()}`,
        playerId: 'TBD',
        playerName: 'TBD',
        position,
        tier,
        historicalWeek: 0,
        historicalYear: 0,
        status: 'unplayed',
      };

      const teamRef = doc(firestore, 'leagues', leagueId, 'teams', teamId, 'cards', newCard.id);
      if (league.id !== 'test-mock-league') {
        await setDoc(teamRef, newCard);
      }
    }
  }

  toast({ title: "Distribution Complete", description: "Packs awarded based on current mechanic" });
};

// Helper functions
const getRandomTier = (): CardTier => {
  const rand = Math.random() * 100;
  if (rand < 5) return 'Legendary';
  if (rand < 20) return 'Epic';
  if (rand < 50) return 'Rare';
  return 'Common';
};

const getRandomPosition = (): string => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  return positions[Math.floor(Math.random() * positions.length)];
};

  return (

    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Legendary Card Settings</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="space-y-8">
        <div>
          <Label htmlFor="mechanic">Primary Dispensing Mechanic</Label>
          <Select value={cardSettings.mechanic} onValueChange={(v) => updateSetting('mechanic', v)}>
            <SelectTrigger id="mechanic" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mechanics.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  <div>
                    <div className="font-medium">{m.label}</div>
                    <div className="text-sm text-muted-foreground">{m.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">Recommended default: Hybrid 50/50</p>
        </div>

        <div>
          <Label>Playoff Bonus</Label>
          <div className="flex items-center gap-3 mt-2">
            <Switch checked={cardSettings.playoffBonus} onCheckedChange={(checked) => updateSetting('playoffBonus', checked)} />
            <span>1st-6th get 4/3/2/1/1/0 extra packs</span>
          </div>
        </div>

        <div>
          <Label>Anti-Snowball Safeguards (Optional Toggles)</Label>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Switch checked={cardSettings.legendDecay} onCheckedChange={(checked) => updateSetting('legendDecay', checked)} />
              <span>Legend Decay: Legendary cards lose 10% points after 3 weeks of non-use</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={cardSettings.nerfRule} onCheckedChange={(checked) => updateSetting('nerfRule', checked)} />
              <span>Nerf Rule: If a team has &gt;3 legends in repository, pack odds drop 50%</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={cardSettings.tradeTax} onCheckedChange={(checked) => updateSetting('tradeTax', checked)} />
              <span>Trade Tax: Trading a Legendary costs the receiver their next pack</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={cardSettings.playoffReset} onCheckedChange={(checked) => updateSetting('playoffReset', checked)} />
              <span>Playoff Reset: All repositories wipe clean before playoffs (pure skill final 4 weeks)</span>
            </div>
          </div>
        </div>

        <div>
          <Label>Card Rarity Distribution (Per Pack)</Label>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Rarity</TableHead>
                <TableHead>% Chance</TableHead>
                <TableHead>Color Glow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rarity.map(r => (
                <TableRow key={r.tier}>
                  <TableCell className="font-medium">{r.tier}</TableCell>
                  <TableCell>{r.chance}</TableCell>
                  <TableCell>{r.glow}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

<div>
  <Label>Manual Card Adjustment (Commissioner Only)</Label>
  <div className="flex gap-4 mt-4">
    <Select value={manualTier} onValueChange={(v) => setManualTier(v as CardTier)}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select tier" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Legendary">Legendary (5%)</SelectItem>
        <SelectItem value="Epic">Epic (15%)</SelectItem>
        <SelectItem value="Rare">Rare (30%)</SelectItem>
        <SelectItem value="Common">Common (50%)</SelectItem>
      </SelectContent>
    </Select>

    <Select value={manualPosition} onValueChange={setManualPosition}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select position" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="QB">QB</SelectItem>
        <SelectItem value="RB">RB</SelectItem>
        <SelectItem value="WR">WR</SelectItem>
        <SelectItem value="TE">TE</SelectItem>
        <SelectItem value="K">K</SelectItem>
        <SelectItem value="DEF">DEF</SelectItem>
      </SelectContent>
    </Select>

    <Select value={manualTeamId} onValueChange={setManualTeamId}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        {league.teams?.map(team => (
          <SelectItem key={team.id} value={team.id}>
            {team.name} ({team.managerId === league.ownerId ? 'You' : 'Opponent'})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Button onClick={handleManualAddCard}>Add Card to Team</Button>
  </div>
</div>

<div className="mt-12 pt-8 border-t">
  <Label>Weekly Card Distribution (Testing Tool)</Label>
  <p className="text-sm text-muted-foreground mb-4">
    Manually run distribution for this week. Uses current mechanic and team scores.
  </p>
  <Button onClick={handleRunDistribution} variant="secondary">
    Run Weekly Distribution
  </Button>
</div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave}>Save Card Settings</Button>
      </div>
    </div>
    
  );
}