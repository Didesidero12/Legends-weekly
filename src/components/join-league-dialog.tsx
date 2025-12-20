'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinLeagueDialogProps {
  children: React.ReactNode;
  onLeagueJoin: (inviteCode: string) => void;
}

export function JoinLeagueDialog({ children, onLeagueJoin }: JoinLeagueDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = () => {
    if (!inviteCode.trim()) return;
    onLeagueJoin(inviteCode.trim().toUpperCase());
    setInviteCode("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a League</DialogTitle>
          <DialogDescription>
            Enter the invite code (e.g., JOIN-ABC123) to join an existing league.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="JOIN-XXXXXX"
              className="uppercase"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!inviteCode.trim() || inviteCode.length < 6}
          >
            Join League
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}