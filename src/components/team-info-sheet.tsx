
'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Edit } from "lucide-react";
import type { Team } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
  onSave: (updatedTeam: Partial<Team>) => void;
}

const logoPack = [
    'https://picsum.photos/seed/logo-pack-1/128/128',
    'https://picsum.photos/seed/logo-pack-2/128/128',
    'https://picsum.photos/seed/logo-pack-3/128/128',
    'https://picsum.photos/seed/logo-pack-4/128/128',
    'https://picsum.photos/seed/logo-pack-5/128/128',
    'https://picsum.photos/seed/logo-pack-6/128/128',
];

export function TeamInfoSheet({ open, onOpenChange, team, onSave }: TeamInfoSheetProps) {
  const [teamName, setTeamName] = useState(team.name);
  const [teamLogo, setTeamLogo] = useState(team.logoUrl);
  const [isEditingLogo, setIsEditingLogo] = useState(false);

  useEffect(() => {
    setTeamName(team.name);
    setTeamLogo(team.logoUrl);
    setIsEditingLogo(false); // Reset on open
  }, [open, team]);

  const handleSave = () => {
    onSave({ name: teamName, logoUrl: teamLogo });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Team Info</SheetTitle>
          <SheetDescription>
            Customize your team's name and logo.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 grid gap-6">

          <div className="flex items-start gap-6">
            <div className="relative">
                <Image src={teamLogo} alt="Team Logo" width={96} height={96} className="rounded-full border-4 border-muted" />
                <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background" onClick={() => setIsEditingLogo(!isEditingLogo)}>
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid gap-2 flex-1">
                <Label htmlFor="team-name">TEAM NAME</Label>
                <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                <p className="text-sm text-muted-foreground mt-1">Owner: {team.owner}</p>
            </div>
          </div>

          {isEditingLogo && (
            <Card className="p-4">
                <RadioGroup value="logo-pack" className="grid gap-4">
                    <div>
                        <RadioGroupItem value="logo-pack" id="logo-pack" className="sr-only" />
                        <Label htmlFor="logo-pack" className="font-semibold cursor-pointer">Select from Logo Pack</Label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            {logoPack.map((logoUrl) => (
                                <Label key={logoUrl} htmlFor={logoUrl} className="cursor-pointer">
                                    <RadioGroupItem value={logoUrl} id={logoUrl} className="sr-only" />
                                    <Image 
                                        src={logoUrl} 
                                        alt="Logo option" 
                                        width={64} 
                                        height={64} 
                                        onClick={() => setTeamLogo(logoUrl)}
                                        className={cn("rounded-md border-2", teamLogo === logoUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent')}
                                    />
                                </Label>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2">
                        <RadioGroupItem value="upload" id="upload" className="sr-only" />
                        <Label htmlFor="upload" className="font-semibold cursor-pointer">
                            <Button variant="outline" asChild>
                                <span>Upload from your device</span>
                            </Button>
                        </Label>
                         <Input type="file" className="hidden" id="upload-input" accept="image/*" />
                    </div>
                </RadioGroup>
            </Card>
          )}

        </div>
        <SheetFooter>
            <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
            </SheetClose>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
