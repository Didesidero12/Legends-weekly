'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Users,
  Swords,
  Search,
  ListChecks,
  Settings,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppLogo } from '@/components/app-logo';

import { RosterProvider } from '@/context/RosterContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useAuth, useUser } from '@/firebase/provider';

import { useEffect } from 'react';
import Image from 'next/image';



function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const currentLeagueId = segments[2];  // /league/[id]/... → id is index 2

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleLogout = () => {
    if (auth) {
        auth.signOut();
    }
    router.push('/');
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (isMobile === undefined) {
    return null; // Or a loading skeleton
  }

  return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="hidden md:inline">Legends Weekly</span>
          </Link>
          <div className="flex-1">
            {/* Can add search or other header items here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Toggle settings menu</span>
                </Button>
            </DropdownMenuTrigger>
<DropdownMenuContent align="end">
  <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
  <DropdownMenuSeparator />
  <DropdownMenuItem>Profile</DropdownMenuItem>
  <DropdownMenuItem asChild>
    <Link href={currentLeagueId ? `/league/${currentLeagueId}/settings` : '/dashboard'}>
      Settings
    </Link>
  </DropdownMenuItem>
  <DropdownMenuItem>Support</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={handleLogout}>
    <LogOut className="mr-2 h-4 w-4" />
    Logout
  </DropdownMenuItem>
</DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Image src={user.photoURL ?? "https://picsum.photos/seed/user/32/32"} width={32} height={32} alt="User avatar" className="rounded-full" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem asChild>
              <Link href={currentLeagueId ? `/league/${currentLeagueId}/settings` : '/dashboard'}>
                Settings
              </Link>
            </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 py-4 md:p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <RosterProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </RosterProvider>
    </FirebaseClientProvider>
  )
}
