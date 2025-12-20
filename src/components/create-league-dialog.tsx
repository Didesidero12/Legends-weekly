
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreateLeagueDialogProps {
  children: React.ReactNode;
  onLeagueCreate: (data: { name: string; size: string; scoring: string }) => void;
}

export function CreateLeagueDialog({ children, onLeagueCreate }: CreateLeagueDialogProps) {
  const [open, setOpen] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  const [leagueSize, setLeagueSize] = useState("12");
  const [scoringType, setScoringType] = useState("ppr");

  const leagueSizes = Array.from({ length: 9 }, (_, i) => (i + 2) * 2); // 4, 6, 8, ..., 20

  const handleSubmit = () => {
    onLeagueCreate({ name: leagueName, size: leagueSize, scoring: scoringType });
    setOpen(false); // Close dialog on submission
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New League</DialogTitle>
          <DialogDescription>
            You will be the league manager. This can be changed later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="league-name">LEAGUE NAME</Label>
            <Input 
              id="league-name" 
              placeholder="My Awesome League" 
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>LEAGUE SIZE</Label>
            <RadioGroup
              defaultValue={leagueSize}
              onValueChange={setLeagueSize}
              className="grid grid-cols-5 gap-2"
            >
              {leagueSizes.map((size) => (
                <div key={size}>
                  <RadioGroupItem value={String(size)} id={`size-${size}`} className="sr-only" />
                  <Label
                    htmlFor={`size-${size}`}
                    className={cn(
                      "flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      leagueSize === String(size) ? "border-primary" : ""
                    )}
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label>SCORING TYPE</Label>
            <RadioGroup defaultValue={scoringType} onValueChange={setScoringType} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="ppr" id="ppr" className="sr-only" />
                <Label htmlFor="ppr">
                  <Card className={cn("p-4 cursor-pointer hover:border-primary", scoringType === 'ppr' && 'border-primary')}>
                    <div className="font-semibold">STANDARD - PPR</div>
                    <div className="text-xs text-muted-foreground">Get extra points for catches by receivers.</div>
                  </Card>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="no-ppr" id="no-ppr" className="sr-only" />
                <Label htmlFor="no-ppr">
                  <Card className={cn("p-4 cursor-pointer hover:border-primary", scoringType === 'no-ppr' && 'border-primary')}>
                    <div className="font-semibold">No PPR</div>
                    <div className="text-xs text-muted-foreground">Don't get extra points for catches.</div>
                  </Card>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!leagueName}>Create League</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
