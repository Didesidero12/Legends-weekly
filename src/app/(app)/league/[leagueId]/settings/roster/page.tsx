'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RosterContext } from '@/context/RosterContext';
import { useUser } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider'; // Correct — matches your export
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RosterSettingsPage() {
  const router = useRouter();
  const { leagueId } = useParams();
  const { leagues, setLeagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  if (!league) return <div className="p-6">Loading league...</div>;

  const isOwner = user?.uid === league.ownerId;

  if (!isOwner) {
    return <div className="p-6">Only the league owner can edit roster settings.</div>;
  }

  const rosterSettings = league.rosterSettings || [];

  const totalStarters = rosterSettings.reduce((sum, pos) => sum + pos.starters, 0);
  const bench = rosterSettings.find(p => p.abbr === 'BE')?.max || 0;
  const ir = rosterSettings.find(p => p.abbr === 'IR')?.max || 0;
  const rosterSize = totalStarters + bench;

const handleSave = async () => {
  const updatedLeagues = leagues.map(l => 
    l.id === leagueId ? { ...l, rosterSettings } : l
  );
  setLeagues(updatedLeagues);

  // Skip Firestore save for test/mock league
  if (league.id === 'test-mock-league') {
    toast({ title: "Roster Settings Saved (Test Mode)" });
    router.back();
    return;
  }

  try {
    await updateDoc(doc(firestore, 'leagues', leagueId), { rosterSettings });
    toast({ title: "Roster Settings Saved" });
    router.back();
  } catch (err) {
    console.error('Save failed', err);
    toast({ variant: "destructive", title: "Save Failed", description: "Try again" });
  }
};

  const updatePosition = (index: number, field: 'starters' | 'max', value: number | 'No Limit') => {
    const newSettings = [...rosterSettings];
    newSettings[index][field] = value;
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, rosterSettings: newSettings } : l);
    setLeagues(updatedLeagues);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Roster Settings</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold">{rosterSize}</div>
          <div className="text-muted-foreground">Roster Size</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold">{totalStarters}</div>
          <div className="text-muted-foreground">Starters</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold">{bench}</div>
          <div className="text-muted-foreground">Bench</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold">{ir}</div>
          <div className="text-muted-foreground">IR</div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-8 font-semibold pb-4 border-b">
          <div>Position</div>
          <div className="text-center">Starters</div>
          <div className="text-center">Max</div>
        </div>

        {rosterSettings.map((pos, index) => (
          <div key={pos.abbr} className="grid grid-cols-3 gap-8 items-center py-4 border-b">
            <div className="font-medium">
              {pos.name} <span className="text-muted-foreground">({pos.abbr})</span>
            </div>
            <div className="text-center">
              <Input
                type="number"
                value={pos.starters}
                onChange={(e) => updatePosition(index, 'starters', Number(e.target.value))}
                className="w-20 mx-auto"
                min={0}
              />
            </div>
            <div className="text-center">
              {pos.abbr === 'BE' || pos.abbr === 'IR' ? (
                <Input
                  type="number"
                  value={pos.max as number}
                  onChange={(e) => updatePosition(index, 'max', Number(e.target.value))}
                  className="w-20 mx-auto"
                  min={0}
                />
              ) : (
                <div className="font-medium">No Limit</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}