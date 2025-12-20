'use client';

import { useParams, useRouter } from 'next/navigation';  // ← Add useRouter here
import { useContext, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RosterContext } from '@/context/RosterContext';
import { useUser } from '@/firebase/provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function LeagueSettingsPage() {
  const { leagueId } = useParams();
  const router = useRouter();  // ← Place it here, inside the component
  const { leagues } = useContext(RosterContext);
  const { user } = useUser();

  const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);

  if (!league) return <div>Loading league settings...</div>;

  const isOwner = user?.uid === league.ownerId;

  if (!isOwner) {
    return <div className="p-6">Only the league owner can edit settings.</div>;
  }

return (
  <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">League Manager Tools</h1>
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="basic">
        <AccordionTrigger>Basic Settings</AccordionTrigger>
        <AccordionContent>
          <p>Basic settings coming soon...</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="roster">
        <AccordionTrigger>Roster Settings</AccordionTrigger>
        <AccordionContent>
          <Button asChild>
            <Link href={`/league/${leagueId}/settings/roster`}>
              Open Roster Settings
            </Link>
          </Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="scoring">
        <AccordionTrigger>Scoring Settings</AccordionTrigger>
        <AccordionContent>
          <Button asChild>
            <Link href={`/league/${leagueId}/settings/scoring`}>
              Open Scoring Settings
            </Link>
          </Button>
        </AccordionContent>
      </AccordionItem>

<AccordionItem value="cards">
  <AccordionTrigger>Legendary Card Settings</AccordionTrigger>
  <AccordionContent>
    <Button asChild>
      <Link href={`/league/${leagueId}/settings/cards`}>
        Open Legendary Card Settings
      </Link>
    </Button>
  </AccordionContent>
</AccordionItem>

<AccordionItem value="managers">
  <AccordionTrigger>Managers</AccordionTrigger>
  <AccordionContent>
    <Button asChild>
      <Link href={`/league/${leagueId}/settings/managers`}>
        Open Managers
      </Link>
    </Button>
  </AccordionContent>
</AccordionItem>

<AccordionItem value="invite">
  <AccordionTrigger>Invite</AccordionTrigger>
  <AccordionContent>
    <Button asChild>
      <Link href={`/league/${leagueId}/settings/invite`}>
        Open Invite Settings
      </Link>
    </Button>
  </AccordionContent>
</AccordionItem>

      {/* We'll add more later: Legendary Cards, etc. */}
    </Accordion>
  </div>
);
}