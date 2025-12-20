// src/app/(app)/league/[leagueId]/sandbox/page.tsx
'use client';

import { useParams } from 'next/navigation';
import SleeperTestButton from '@/components/dev/SleeperTestButton'; // We'll create this next

export default function SandboxPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sandbox / Dev Tools</h1>
      <p className="text-muted-foreground mb-8">
        Testing area for new features and API integrations. Visible only in dev.
      </p>

      <SleeperTestButton />
      
      {/* Add more dev tools here later */}
    </div>
  );
}