'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RosterContext } from '@/context/RosterContext';
import { useUser } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

export default function ManagersSettingsPage() {
  const router = useRouter();
  const { leagueId } = useParams();
  const { leagues, setLeagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  const [newManagerEmail, setNewManagerEmail] = useState('');

  // Early returns after hooks
  if (!league) return <div className="p-6">Loading...</div>;

  const isOwner = user?.uid === league.ownerId;

  if (!isOwner) return <div className="p-6">Only the owner can manage managers.</div>;

  const handleAddManager = async () => {
    if (!newManagerEmail.trim()) return;

    // Placeholder: real app would lookup UID by email
    const newTeam = {
      id: `team-${Date.now()}`,
      name: `Team ${league.teams?.length + 1 || 1}`,
      managerId: newManagerEmail,
      roster: { starters: Array(9).fill(null), bench: [], ir: [] },
      logoUrl: 'https://picsum.photos/seed/newteam/64/64',
    };

    const updates = { teams: [...(league.teams || []), newTeam] };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    try {
      await updateDoc(doc(firestore, 'leagues', leagueId), updates);
      toast({ title: "Manager Added", description: `Invited ${newManagerEmail}` });
      setNewManagerEmail('');
    } catch (err) {
      toast({ variant: "destructive", title: "Error adding manager" });
    }
  };

  const handleRemoveManager = async (teamId: string) => {
    const updates = { teams: league.teams?.filter(t => t.id !== teamId) || [] };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    try {
      await updateDoc(doc(firestore, 'leagues', leagueId), updates);
      toast({ title: "Manager Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error removing manager" });
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    const updates = { ownerId: newOwnerId };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    try {
      await updateDoc(doc(firestore, 'leagues', leagueId), updates);
      toast({ title: "Ownership Transferred" });
      router.back();
    } catch (err) {
      toast({ variant: "destructive", title: "Error transferring ownership" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Managers</h1>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <div className="space-y-8">
        <div>
          <Label htmlFor="email">Add Manager by Email</Label>
          <div className="flex gap-2 mt-2">
            <Input 
              id="email"
              type="email"
              placeholder="manager@example.com"
              value={newManagerEmail}
              onChange={(e) => setNewManagerEmail(e.target.value)}
            />
            <Button onClick={handleAddManager}>Invite</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">They'll receive an invite to join the league.</p>
        </div>

        <div>
          <Label>Current Managers</Label>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {league.teams?.map(team => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.managerId === league.ownerId ? 'You (Owner)' : team.managerId || 'Unclaimed'}</TableCell>
                  <TableCell>{team.managerId === league.ownerId ? 'Commissioner' : 'Manager'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {team.managerId !== league.ownerId && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleTransferOwnership(team.managerId!)}>
                            Make Owner
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveManager(team.id)}>
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}