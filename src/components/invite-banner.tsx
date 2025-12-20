
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Mail, MessageSquareText, Share2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteBannerProps {
  leagueName: string;
  onDismiss: () => void;
}

export function InviteBanner({ leagueName, onDismiss }: InviteBannerProps) {
  const { toast } = useToast();

  const inviteLink = "https://example.com/join/league123"; // Dummy link

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied!",
      description: "The invite link has been copied to your clipboard.",
    });
  };

  return (
    <Card className="mb-6 bg-primary/10 border-primary/20 relative">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onDismiss}>
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <CardTitle className="font-headline text-primary">Congrats!</CardTitle>
        <CardDescription>
          You created your <span className="font-semibold text-foreground">{leagueName}</span> league! Now invite friends to play against.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopyLink}>
            <Link className="mr-2 h-4 w-4" />
            Copy Invite Link
          </Button>
          <Button variant="secondary" asChild>
             <a href={`sms:?&body=Join my fantasy league on Legends Weekly! ${inviteLink}`}>
                <MessageSquareText className="mr-2 h-4 w-4" />
                Text Invite
             </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href={`mailto:?subject=Join my fantasy league: ${leagueName}&body=Join my fantasy league on Legends Weekly! Click the link to join: ${inviteLink}`}>
                <Mail className="mr-2 h-4 w-4" />
                Email Invite
            </a>
          </Button>
          <Button variant="secondary" onClick={() => navigator.share && navigator.share({ title: `Join my ${leagueName} league!`, text: 'Join my fantasy league on Legends Weekly!', url: inviteLink })}>
            <Share2 className="mr-2 h-4 w-4" />
            More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
