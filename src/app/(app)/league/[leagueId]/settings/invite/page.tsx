'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RosterContext } from '@/context/RosterContext';
import { useUser } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

export default function InviteSettingsPage() {
  const router = useRouter();
  const { leagueId } = useParams();
  const { leagues, setLeagues } = useContext(RosterContext);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  if (!league) return <div className="p-6">Loading...</div>;

  const isOwner = user?.uid === league.ownerId;

  if (!isOwner) return <div className="p-6">Only the owner can manage invites.</div>;

  const [copied, setCopied] = useState(false);

  const inviteLink = `https://yourapp.com/join/${league.id}`; // Replace with real domain
  const inviteCode = league.id.slice(-6).toUpperCase(); // Simple code from ID

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Invite link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNew = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const updates = { inviteCode: newCode };
    const updatedLeagues = leagues.map(l => l.id === leagueId ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    if (league.id !== 'test-mock-league') {
      try {
        await updateDoc(doc(firestore, 'leagues', leagueId), updates);
        toast({ title: "New invite code generated" });
      } catch (err) {
        toast({ variant: "destructive", title: "Failed to save new code" });
      }
    } else {
      toast({ title: "New invite code generated (Test Mode)" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Invite Managers</h1>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <div className="space-y-8">
        <div>
          <Label>Invite Link</Label>
          <div className="flex gap-2 mt-2">
            <Input value={inviteLink} readOnly />
            <Button onClick={handleCopy} variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Share this link — anyone with it can join your league.</p>
        </div>

        <div>
          <Label>Invite Code</Label>
          <div className="flex gap-2 mt-2">
            <Input value={inviteCode} readOnly className="font-mono text-lg" />
            <Button onClick={handleGenerateNew}>Generate New</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Or share this code for manual entry.</p>
        </div>

        <div>
          <Label>Quick Share</Label>
          <div className="flex gap-2 mt-4">
            <Button variant="outline">Share via Email</Button>
            <Button variant="outline">Copy Discord Message</Button>
            <Button variant="outline">Copy Text Message</Button>
          </div>
        </div>
      </div>
    </div>
  );
}