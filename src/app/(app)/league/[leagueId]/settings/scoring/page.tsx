'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RosterContext } from '@/context/RosterContext';
import { useUser } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider'; // Correct — matches your export
import { Card, CardContent } from '@/components/ui/card';

export default function ScoringSettingsPage() {
  const router = useRouter();
  const { leagueId } = useParams();
  const { leagues, setLeagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  if (!league) return <div className="p-6">Loading...</div>;

  const isOwner = user?.uid === league.ownerId;

  if (!isOwner) return <div className="p-6">Only the owner can edit scoring settings.</div>;

  const { control, handleSubmit, watch } = useForm({
    defaultValues: { scoringSettings: league.scoringSettings },
  });

  const categories = Object.keys(league.scoringSettings) as (keyof typeof league.scoringSettings)[];

  const onSubmit = async (data: { scoringSettings: typeof league.scoringSettings }) => {
    const updates = { scoringSettings: data.scoringSettings };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    try {
      await updateDoc(doc(firestore, 'leagues', leagueId), updates);
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Scoring Settings</h1>
        <Button onClick={handleSubmit(onSubmit)}>Save Changes</Button>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const rules = watch(`scoringSettings.${category}`);

          return (
            <div key={category} className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={rule.abbr} className="grid grid-cols-3 items-center gap-4 py-3 border-b last:border-0">
                    <div className="font-medium">{rule.name} ({rule.abbr})</div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.01"
                        {...control.register(`scoringSettings.${category}.${index}.points`, { valueAsNumber: true })}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        {...control.register(`scoringSettings.${category}.${index}.enabled`)}
                      />
                      <span className="text-sm">{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Save Scoring Settings</Button>
      </div>
    </div>
  );
}