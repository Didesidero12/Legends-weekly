'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RosterContext, defaultScoringSettings } from '@/context/RosterContext'; // ← Import defaults
import { useUser } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast'; // ← Import toast

export default function ScoringSettingsPage() {
  const router = useRouter();
  const { leagueId } = useParams();
  const { leagues, setLeagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast(); // ← Destructure toast

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  if (!league) {
    return <div className="p-6 text-center">Loading league...</div>;
  }

  const isOwner = user?.uid === league.ownerId;

  // ← ALL HOOKS BEFORE ANY RETURN
  const safeDefaults = defaultScoringSettings || {
    Passing: [],
    Rushing: [],
    Receiving: [],
    Kicking: [],
    'Team Defense / Special Teams': [],
    Miscellaneous: [],
    'Defensive Players': [],
    'Head Coach': [],
    Punting: [],
  };

  const fullScoringSettings = useMemo(() => {
    if (!league.scoringSettings) return safeDefaults;

    const merged = { ...safeDefaults };
    Object.keys(safeDefaults).forEach(category => {
      merged[category] = league.scoringSettings[category] || safeDefaults[category];
    });
    return merged;
  }, [league.scoringSettings]);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      scoringSettings: fullScoringSettings,
    },
  });

  if (!isOwner) {
    return <div className="p-6 text-center">
      <p className="text-lg">Only the league owner can edit scoring settings.</p>
    </div>;
  }

  const categories = Object.keys(fullScoringSettings);

  const onSubmit = async (data: { scoringSettings: any }) => {
    if (!leagueId || !firestore) return;

    try {
      await updateDoc(doc(firestore, 'leagues', leagueId), {
        scoringSettings: data.scoringSettings,
      });

      // Update local context
      setLeagues(prev => prev.map(l => 
        l.id === leagueId ? { ...l, scoringSettings: data.scoringSettings } : l
      ));

      toast({ title: "Success", description: "Scoring settings saved!" });
      router.back();
    } catch (err) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to save scoring settings" 
      });
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
          const rules = watch(`scoringSettings.${category}`) || [];

          return (
            <div key={category} className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <div className="space-y-4">
                {rules.map((rule: any, index: number) => (
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
                        checked={watch(`scoringSettings.${category}.${index}.enabled`)}
                        {...control.register(`scoringSettings.${category}.${index}.enabled`)}
                      />
                      <span className="text-sm">
                        {watch(`scoringSettings.${category}.${index}.enabled`) ? 'Enabled' : 'Disabled'}
                      </span>
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