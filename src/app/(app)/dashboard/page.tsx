'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Users, Calendar, UserPlus, Settings, User, MoreVertical, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateLeagueDialog } from "@/components/create-league-dialog";
import { JoinLeagueDialog } from "@/components/join-league-dialog";
import { useState, useMemo, useContext } from "react"; // ← Only this one
import type { League, Team, Roster, CardTier } from "@/lib/types";
import { format } from 'date-fns';
import { InviteSheet } from "@/components/invite-sheet";
import { ScheduleDraftSheet } from "@/components/schedule-draft-sheet";
import { LeagueCarouselCard } from "@/components/league-carousel-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useFirestore, useUser } from '@/firebase/provider';
import { collection, doc, serverTimestamp, setDoc, writeBatch, deleteDoc, getDocs, query, where, limit, runTransaction, addDoc, updateDoc } from "firebase/firestore";
import { RosterContext } from '@/context/RosterContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/components/ui/use-toast';

const EMPTY_ROSTER: Roster = { starters: Array(9).fill(null), bench: [], ir: [] };

function PreDraftLeagueCard({ 
    league, 
    user,
    onInvite, 
    onSchedule,
    onDelete,
}: { 
    league: League; 
    user: { uid: string };
    onInvite: () => void; 
    onSchedule: () => void; 
    onDelete: () => void;
}) {
    const context = useContext(RosterContext);
    const teams = context?.teams || [];
    const leagueTeams = useMemo(() => teams.filter(t => t.leagueId === league.id), [teams, league.id]);
    
    const filledSlots = leagueTeams.filter(t => t.managerId).length;
    const membersRemaining = league.totalTeams - filledSlots;
    
    const formattedDraftDate = useMemo(() => {
        if (!league.draftDate) return "Draft not yet scheduled";
        try {
            const date = (league.draftDate as any).toDate ? (league.draftDate as any).toDate() : new Date(league.draftDate);
            return `Draft scheduled for ${format(date, 'EEE, MMM d @ h:mm a')}`;
        } catch (e) {
            return "Invalid draft date";
        }
    }, [league.draftDate]);

    const isLeagueFull = membersRemaining <= 0;
    const isDraftReady = league.draftDate && isLeagueFull;
    const CardWrapper = isDraftReady ? Link : 'div';
    const wrapperProps = isDraftReady 
        ? { href: `/league/${league.id}/draft`, className: "block rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors h-full" } 
        : { className: "rounded-lg border bg-card text-card-foreground shadow-sm h-full" };

    const isOwner = user.uid === league.ownerId;


    return (
        <CardWrapper href={`/league/${league.id}`} {...wrapperProps}>
            <div className="relative h-full flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline">{league.name}</CardTitle>
                            <CardDescription>
                                {formattedDraftDate}
                            </CardDescription>
                        </div>
                        {isOwner && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={e => {e.preventDefault(); e.stopPropagation();}}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive" onSelect={e => {e.preventDefault(); onDelete();}}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete League
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                {isDraftReady ? (
                    <div className="text-sm font-medium text-green-500 mt-auto">
                        League is full! Ready for draft.
                    </div>
                ): (
                <>
                    <div className="text-sm font-medium text-muted-foreground mb-4">
                        {isLeagueFull ? 
                            "League is full! Schedule the draft to begin." :
                            `${membersRemaining} more league members required to draft.`
                        }
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                        <Button onClick={(e) => { e.stopPropagation(); onInvite(); }}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Members
                        </Button>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onSchedule(); }}>
                                {league.draftDate ? <Settings className="h-4 w-4 mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                                {league.draftDate ? 'Draft Settings' : 'Schedule Draft'}
                            </Button>
                            <Button variant="secondary" asChild>
                            <Link href={`/league/${league.id}/team`} onClick={(e) => e.stopPropagation()}>
                                <User className="h-4 w-4 mr-2" />
                                My Team
                            </Link>
                            </Button>
                        </div>
                    </div>
                </>
                )}
                </CardContent>
            </div>
        </CardWrapper>
    );
}

const getTier = (): CardTier => {
    const rand = Math.random() * 100;
    if (rand < 5) return 'Legendary'; // 5%
    if (rand < 20) return 'Epic';      // 15%
    if (rand < 50) return 'Rare';      // 30%
    return 'Common';                   // 50%
}


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const {leagues: allLeagues, isLoading: leaguesLoading } = useContext(RosterContext);
  const { toast } = useToast();

  
  const myLeagues = useMemo(() => {
    if (!user || !allLeagues) return [];
    // A user is in a league if they manage a team in it or are the owner
    return allLeagues.filter(league => 
        league.ownerId === user.uid || league.teams?.some(team => team.managerId === user.uid)
    );
  }, [allLeagues, user]);

  const [isInviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [isScheduleSheetOpen, setScheduleSheetOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);
  
  
  const generateInviteCode = (leagueId: string) => {
    return `JOIN-${leagueId.substring(0, 6).toUpperCase()}`;
  };

  
  const handleLeagueCreate = async (newLeagueData: { name: string; size: string; }) => {
    if (!firestore || !user) return;
  
    const leagueDocRef = doc(collection(firestore, 'leagues'));
    const inviteCode = generateInviteCode(leagueDocRef.id);
    
    try {
        const batch = writeBatch(firestore);

        batch.set(leagueDocRef, {
            name: newLeagueData.name,
            totalTeams: parseInt(newLeagueData.size, 10),
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            draftDate: null,
            inviteCode: inviteCode
        });

        const totalTeams = parseInt(newLeagueData.size, 10);
        
        for(let i=0; i < totalTeams; i++) {
            const teamRef = doc(firestore, `leagues/${leagueDocRef.id}/teams`, `t${i+1}`);
            const isFirstTeam = i === 0;

            const teamData: Omit<Team, 'id'> = {
                leagueId: leagueDocRef.id,
                managerId: isFirstTeam ? user.uid : null,
                name: isFirstTeam ? `${user.displayName || 'Manager'}'s Team` : `Team ${i + 1}`,
                owner: isFirstTeam ? user.displayName : null,
                logoUrl: `https://picsum.photos/seed/logo-${leagueDocRef.id}-${i}/64/64`,
                record: '0-0',
                roster: EMPTY_ROSTER,
            };
            batch.set(teamRef, teamData);
        }

        await batch.commit();
        toast({ title: "Success!", description: `${newLeagueData.name} has been created.`});

    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `/leagues`, operation: 'create', requestResourceData: { note: `Attempted to create league, ${newLeagueData.size} teams, and 3 legendary cards.` } }));
    }
  };

    const handleLeagueJoin = async (inviteCode: string) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to join a league.' });
        return;
    }

    try {
        await runTransaction(firestore, async (transaction) => {
            const leaguesRef = collection(firestore, 'leagues');
            const q = query(leaguesRef, where('inviteCode', '==', inviteCode), limit(1));
            const leagueSnapshot = await getDocs(q);

            if (leagueSnapshot.empty) {
                throw new Error('Invalid invite code. Please check the code and try again.');
            }

            const leagueDoc = leagueSnapshot.docs[0];
            const leagueData = leagueDoc.data() as League;

            const teamsRef = collection(firestore, 'leagues', leagueDoc.id, 'teams');
            const teamsSnapshot = await getDocs(teamsRef);
            const allTeams = teamsSnapshot.docs.map(d => ({...d.data(), id: d.id } as Team));

            const alreadyInLeague = allTeams.some(team => team.managerId === user.uid);
            if (alreadyInLeague) {
                throw new Error(`You are already in the "${leagueData.name}" league.`);
            }

            const openTeamDoc = teamsSnapshot.docs.find(doc => !doc.data().managerId);

            if (!openTeamDoc) {
                throw new Error('This league is already full.');
            }
            
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                // This shouldn't happen if user is logged in, but good to handle
                // We can proceed with default names
            }
            const userData = userDoc.data();
            const displayName = userData?.displayName || 'New Manager';

            transaction.update(openTeamDoc.ref, {
                managerId: user.uid,
                owner: displayName,
                name: `${displayName}'s Team`,
                logoUrl: `https://picsum.photos/seed/logo-${leagueDoc.id}-${openTeamDoc.id}/64/64`,
            });
        });

        toast({
            title: 'Success!',
            description: 'You have successfully joined the league.',
        });

    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Failed to join league',
            description: e.message || 'An unexpected error occurred.',
        });
        if (e.name !== 'Error') { // Don't log custom errors as permission errors
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `/leagues`,
                operation: 'update',
                requestResourceData: { note: `Attempted to join league with code ${inviteCode}` }
            }));
        }
    }
  };


  const handleOpenInviteSheet = (league: League) => {
    setSelectedLeague(league);
    setInviteSheetOpen(true);
  };

  const handleOpenScheduleSheet = (league: League) => {
    setSelectedLeague(league);
    setScheduleSheetOpen(true);
  };
  
  const handleOpenDeleteDialog = (league: League) => {
    setLeagueToDelete(league);
  };
  
  const handleConfirmDelete = async () => {
    if (!leagueToDelete || !firestore) return;
    
    const leagueId = leagueToDelete.id;
    const leagueRef = doc(firestore, 'leagues', leagueId);
    
    try {
        // 1. Delete all team documents in the sub-collection
        const teamsRef = collection(firestore, 'leagues', leagueId, 'teams');
        const teamsSnapshot = await getDocs(teamsRef);
        const deleteBatch = writeBatch(firestore);
        teamsSnapshot.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();

        // 2. Delete the league document itself
        await deleteDoc(leagueRef);
    } catch (error) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: leagueRef.path,
          operation: 'delete',
          requestResourceData: { note: `Attempted to delete league and all its teams.`}
        })
      )
    } finally {
        setLeagueToDelete(null); // Close dialog regardless of outcome
    }

  };


  const handleDraftSchedule = (draftDate: Date) => {
    if (!selectedLeague || !firestore) return;

    const leagueRef = doc(firestore, 'leagues', selectedLeague.id);
    const draftData = { draftDate };
    
    setDoc(leagueRef, draftData, { merge: true }).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: leagueRef.path,
          operation: 'update',
          requestResourceData: draftData
        })
      )
    });
  };
  
  const now = useMemo(() => new Date().getTime(), []);
  
  const draftedLeagues = myLeagues?.filter(league => {
      if (!league.draftDate) return false;
      const draftTime = (league.draftDate as any).toDate ? (league.draftDate as any).toDate().getTime() : new Date(league.draftDate).getTime();
      return draftTime > 0 && draftTime < now;
  }) ?? [];

  const preDraftLeagues = myLeagues?.filter(league => {
      if (!league.draftDate) return true;
      const draftTime = (league.draftDate as any).toDate ? (league.draftDate as any).toDate().getTime() : new Date(league.draftDate).getTime();
      return !(draftTime > 0 && draftTime < now);
  }) ?? [];

  if (leaguesLoading || !user) {
    return <div>Loading leagues...</div>;
  }

  return (
    <div className="bg-background">
      <AlertDialog open={!!leagueToDelete} onOpenChange={(isOpen) => !isOpen && setLeagueToDelete(null)}>
<div className="flex items-center justify-between mb-6">
  <h1 className="text-lg font-semibold md:text-2xl font-headline">My Leagues</h1>
  <div className="flex gap-2 items-center">

              <JoinLeagueDialog onLeagueJoin={handleLeagueJoin}>
                  <Button size="sm" variant="outline">
                      Join League
                  </Button>
              </JoinLeagueDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create League
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <CreateLeagueDialog onLeagueCreate={handleLeagueCreate}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <div className="flex flex-col">
                              <span className="font-medium">CREATE NEW LEAGUE</span>
                              <span className="text-xs text-muted-foreground">Start your own league and invite friends</span>
                          </div>
                      </DropdownMenuItem>
                  </CreateLeagueDialog>
                  <DropdownMenuItem>
                      <div className="flex flex-col">
                          <span className="font-medium">JOIN PUBLIC LEAGUE</span>
                          <span className="text-xs text-muted-foreground">Compete in an existing league with other fans</span>
                      </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
        
        {draftedLeagues.length > 0 && (
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {draftedLeagues.map((league) => (
                <CarouselItem key={league.id} className="md:basis-1/2 lg:basis-1/3">
                  <LeagueCarouselCard league={league} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}


        {preDraftLeagues.length > 0 && (
            <>
              <h2 className="text-base font-semibold md:text-xl font-headline mt-8 mb-4">Pre-Draft Leagues</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {preDraftLeagues.map((league) => (
                  <PreDraftLeagueCard 
                      key={league.id} 
                      league={league}
                      user={user}
                      onInvite={() => handleOpenInviteSheet(league)}
                      onSchedule={() => handleOpenScheduleSheet(league)}
                      onDelete={() => handleOpenDeleteDialog(league)}
                  />
              ))}
              </div>
            </>
        )}


        <InviteSheet 
          open={isInviteSheetOpen} 
          onOpenChange={setInviteSheetOpen} 
          leagueName={selectedLeague?.name ?? ''}
          inviteCode={selectedLeague?.inviteCode}
        />

        <ScheduleDraftSheet
          open={isScheduleSheetOpen}
          onOpenChange={setScheduleSheetOpen}
          leagueName={selectedLeague?.name ?? ''}
          onSave={handleDraftSchedule}
        />
        
        <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  <span className="font-semibold text-foreground"> {leagueToDelete?.name} </span> 
                  league and all of its data.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
