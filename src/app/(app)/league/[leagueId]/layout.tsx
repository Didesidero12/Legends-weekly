
'use client';
import {usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import {Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {Button } from '@/components/ui/button';
import {ArrowLeft } from 'lucide-react';
import {useEffect } from 'react';
import {cn } from '@/lib/utils';
import {ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function LeagueLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const leagueId = params.leagueId as string;

  const getActiveTab = () => {
    if (pathname.includes('/team')) return 'roster';
    if (pathname.includes('/matchup')) return 'matchup';
    if (pathname.includes('/players')) return 'players';
    if (pathname.includes('/cards')) return 'cards';
    if (pathname.includes('/settings')) return 'league';
    if (pathname.includes('/sandbox')) return 'sandbox';
    return 'matchup';
  };

  const activeTab = getActiveTab();

  const navLinks = [
    { value: 'roster', label: 'Roster', href: `/league/${leagueId}/team` },
    { value: 'matchup', label: 'Matchup', href: `/league/${leagueId}/matchup` },
    { value: 'players', label: 'Players', href: `/league/${leagueId}/players` },
    { value: 'cards', label: 'Cards', href: `/league/${leagueId}/cards` },
    { value: 'league', label: 'League', href: `/league/${leagueId}/settings` },
    { value: 'sandbox', label: 'Sandbox', href: `/league/${leagueId}/sandbox` },
  ];
  

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" asChild className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <div className="sticky top-14 md:top-0 bg-background z-30 py-2 -mt-2 md:pt-0">
        <Tabs value={activeTab} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="grid w-full grid-cols-6">
                {navLinks.map((link) => (
                  <TabsTrigger value={link.value} asChild key={link.value}>
                    <Link href={link.href}>{link.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
               <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </Tabs>
      </div>
      <div>{children}</div>
    </div>
  );
}
