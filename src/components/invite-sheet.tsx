
'use client';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, Mail, MessageSquareText, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueName: string;
  inviteCode?: string;
}

export function InviteSheet({ open, onOpenChange, leagueName, inviteCode }: InviteSheetProps) {
  const { toast } = useToast();

  const inviteLink = inviteCode 
    ? `${window.location.origin}/join?code=${inviteCode}`
    : "No invite code available";
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
    });
  };

  const handleShare = () => {
    if (navigator.share && inviteCode) {
      navigator.share({
        title: `Join my ${leagueName} league!`,
        text: `Join my fantasy league on Legends Weekly using the code: ${inviteCode}`,
        url: inviteLink,
      }).catch(console.error);
    } else {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Your browser does not support the Web Share API, or there is no invite code.",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Invite friends to {leagueName}</SheetTitle>
          <SheetDescription>
            Share the invite code or link with anyone you want to join your league.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 flex flex-col gap-4">
            <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <div className="flex gap-2">
                    <Input id="invite-code" value={inviteCode ?? 'N/A'} readOnly />
                    <Button variant="secondary" onClick={() => handleCopy(inviteCode ?? '')} disabled={!inviteCode}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="invite-link">Invite Link</Label>
                 <div className="flex gap-2">
                    <Input id="invite-link" value={inviteLink} readOnly />
                    <Button variant="secondary" onClick={() => handleCopy(inviteLink)} disabled={!inviteCode}>
                        <Link className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
                <Button variant="secondary" asChild size="lg">
                    <a href={`sms:?&body=Join my fantasy league, ${leagueName}, on Legends Weekly with code: ${inviteCode}`}>
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        Text
                    </a>
                </Button>
                 <Button variant="secondary" asChild size="lg">
                    <a href={`mailto:?subject=Join my fantasy league: ${leagueName}&body=Join my fantasy league on Legends Weekly! Use the invite code: ${inviteCode} or click the link: ${inviteLink}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </a>
                </Button>
                <Button variant="secondary" onClick={handleShare} size="lg" disabled={!inviteCode}>
                    <Share2 className="mr-2 h-4 w-4" />
                    More
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
