
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ShieldQuestion, ChevronLeft, ChevronRight, MoreVertical, Trash2, Repeat } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { RosterContext } from "@/context/RosterContext";
import { useContext, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import type { LegendaryCard, Player, CardTier } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from 'embla-carousel-react'
import { TeamHelmet } from "@/components/team-helmet";
import { motion } from 'framer-motion';
import { LightningBurst } from '@/components/animations/LightningBurst';

const tierStyles: Record<CardTier, { bg: string; text: string; border: string; glow: string; shadow: string; }> = {
    Legendary: { bg: 'bg-yellow-400/10', text: 'text-yellow-300', border: 'border-yellow-400/50', glow: '[--glow-color:theme(colors.yellow.400)]', shadow: 'shadow-yellow-400/20' },
    Epic: { bg: 'bg-purple-400/10', text: 'text-purple-300', border: 'border-purple-400/50', glow: '[--glow-color:theme(colors.purple.400)]', shadow: 'shadow-purple-400/20' },
    Rare: { bg: 'bg-blue-400/10', text: 'text-blue-300', border: 'border-blue-400/50', glow: '[--glow-color:theme(colors.blue.400)]', shadow: 'shadow-blue-400/20' },
    Common: { bg: 'bg-gray-400/10', text: 'text-gray-300', border: 'border-gray-400/50', glow: '[--glow-color:theme(colors.gray.400)]', shadow: 'shadow-gray-400/20' },
};

function LegendaryCardComponent({ 
    card, 
    onPlayCard, 
    onDeactivateCard,
    onTradeCard,
    onDeleteCard,
}: { 
    card: LegendaryCard; 
    onPlayCard: (card: LegendaryCard) => void; 
    onDeactivateCard: (card: LegendaryCard) => void; 
    onTradeCard: (card: LegendaryCard) => void;
    onDeleteCard: (card: LegendaryCard) => void;
}) {
    const isPlayed = card.status === 'played';
    const isPending = card.status === 'pending';
    const styles = card.tier ? tierStyles[card.tier] : tierStyles.Common;

    return (
        <Card className={cn("flex flex-col h-[400px] w-[280px] relative overflow-hidden transition-all duration-500", styles.bg, styles.border, styles.shadow, styles.glow, 'shadow-2xl')}>
            <div className="absolute inset-0 bg-grid-slate-900/25 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>
            <CardHeader className="relative z-10">
                 <div className="flex justify-between items-center">
                    <CardTitle className={cn("font-headline text-lg", styles.text)}>{card.tier} Edition</CardTitle>
                    <Crown className={cn("w-6 h-6", styles.text)} />
                </div>
                <CardDescription className={cn("!mt-0", styles.text, "opacity-70")}>{card.position} Card</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow items-center justify-center text-center relative z-10 p-4">
                {isPlayed ? (
                     <div className="flex flex-col items-center justify-center text-center w-full h-full">
                        <Image src={`https://picsum.photos/seed/${card.playerId}/200/200`} alt={card.playerName} width={120} height={120} className="rounded-full border-4 border-white/10 shadow-lg" />
                        <p className="text-2xl font-bold mt-4">{card.playerName}</p>
                        <p className="text-sm text-muted-foreground">{card.historicalYear}, Week {card.historicalWeek}</p>
                        <div className="mt-auto w-full bg-black/30 backdrop-blur-sm rounded-lg p-2">
                             <p className="text-green-400 font-semibold">Played in Week {card.playedWeek}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <TeamHelmet team="DEFAULT" className="w-24 h-24 text-muted-foreground/30" />
                        <div className="mt-auto w-full space-y-2">
                            <p className="text-muted-foreground text-xs leading-tight px-2">
                                {isPending ? "This card is pending activation for this week's matchup." : "Play this card to reveal a legendary player and use their historical stats for one week."}
                            </p>
                            <div className="flex gap-2 w-full justify-center">
                               {isPending ? (
                                    <Button variant="destructive" onClick={() => onDeactivateCard(card)}>Deactivate</Button>
                               ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="w-full">
                                                Actions <MoreVertical className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => onPlayCard(card)}>
                                                Play Card
                                            </DropdownMenuItem>
                                             <DropdownMenuItem onSelect={() => onTradeCard(card)}>
                                                <Repeat className="mr-2 h-4 w-4" />
                                                Trade Card
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onDeleteCard(card)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Card
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                               )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

const CardCarousel = ({ cards, onPlayCard, onDeactivateCard, onTradeCard, onDeleteCard }: { 
    cards: LegendaryCard[]; 
    onPlayCard: (card: LegendaryCard) => void; 
    onDeactivateCard: (card: LegendaryCard) => void;
    onTradeCard: (card: LegendaryCard) => void;
    onDeleteCard: (card: LegendaryCard) => void;
}) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi]);

    return (
        <div className="relative">
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                    {cards.map((card, index) => (
                        <div className="embla__slide" key={index}>
                            <LegendaryCardComponent card={card} onPlayCard={onPlayCard} onDeactivateCard={onDeactivateCard} onTradeCard={onTradeCard} onDeleteCard={onDeleteCard} />
                        </div>
                    ))}
                </div>
            </div>
            
            <Button variant="outline" size="icon" className="embla__prev" onClick={scrollPrev}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="embla__next" onClick={scrollNext}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};


export default function LegendaryCardsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { leagues } = useContext(RosterContext);
    const params = useParams();
    const leagueId = params.leagueId as string;
    const { toast } = useToast();

    const league = useMemo(() => leagues.find(l => l.id === leagueId), [leagues, leagueId]);
    const userTeam = useMemo(() => league?.teams?.find(t => t.managerId === user?.uid), [league, user]);
    const roster = useMemo(() => userTeam?.roster, [userTeam]);
    
    const starterSlots = useMemo(() => {
      if (!league?.rosterSettings) return [];
      return league.rosterSettings
        .filter(s => s.starters > 0 && s.abbr !== 'BE' && s.abbr !== 'IR')
        .flatMap(s => Array(s.starters).fill(s.abbr));
    }, [league]);

    const cardsRef = useMemoFirebase(() => {
        if (!firestore || !leagueId || !userTeam?.id) return null;
        return collection(firestore, 'leagues', leagueId, 'teams', userTeam.id, 'cards');
    }, [firestore, leagueId, userTeam?.id]);

    const { data: cards, isLoading } = useCollection<LegendaryCard>(cardsRef);
    
    const [cardToPlay, setCardToPlay] = useState<LegendaryCard | null>(null);
    const [cardToDelete, setCardToDelete] = useState<LegendaryCard | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ position: string; index: number } | null>(null);
    const [isActivated, setIsActivated] = useState(false);

    const eligibleSlots = useMemo(() => {
      if (!starterSlots || !cardToPlay) return [];
      
      const isEligibleForSlot = (cardPosition: string, slotPosition: string) => {
        if (cardPosition === slotPosition) return true;
        if (slotPosition === 'FLEX') return ['RB', 'WR', 'TE'].includes(cardPosition);
        if (slotPosition === 'RB/WR') return ['RB', 'WR'].includes(cardPosition);
        if (slotPosition === 'WR/TE') return ['WR', 'TE'].includes(cardPosition);
        if (slotPosition === 'OP') return ['QB', 'RB', 'WR', 'TE'].includes(cardPosition);
        return false;
      }

      return starterSlots
        .map((pos, index) => ({ position: pos, index }))
        .filter(slot => isEligibleForSlot(cardToPlay.position, slot.position));

    }, [starterSlots, cardToPlay]);
    
const handlePlayCard = (card: LegendaryCard) => {
  const hasPendingCard = cards?.some(c => c.status === 'pending');
  const samePositionPending = cards?.some(c => c.status === 'pending' && c.position === card.position);

  if (hasPendingCard) {
    toast({
      variant: 'destructive',
      title: "Weekly Limit Reached",
      description: "You can only play one legendary card per week.",
    });
    return;
  }

  if (samePositionPending) {
    toast({
      variant: 'destructive',
      title: "Position Already Pending",
      description: `You already have a legendary ${card.position} card pending.`,
    });
    return;
  }

  setCardToPlay(card);
};

        const handleConfirmPlay = () => {
        if (!firestore || !cardToPlay || !selectedSlot || !userTeam) return;

        const cardRef = doc(firestore, 'leagues', leagueId, 'teams', userTeam.id, 'cards', cardToPlay.id);
        
        const updateData = {
            status: 'pending',
            pendingSlotId: `${selectedSlot.position}-${selectedSlot.index}`, // e.g., "WR-1"
        };

        updateDoc(cardRef, updateData)
            .then(() => {
            toast({
                title: "Legendary Card Activated!",
                description: `The Legendary ${cardToPlay.position} card is now pending for this week's matchup.`,
            });

            // ← TRIGGER ANIMATION HERE
            setIsActivated(true);
                setTimeout(() => setIsActivated(false), 2500); // 2.5s for full effect
            })
            .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: cardRef.path,
                operation: 'update',
                requestResourceData: updateData
            }));
            })
            .finally(() => {
            setCardToPlay(null);
            setSelectedSlot(null);
            });
        };
    
    const handleDeactivateCard = (card: LegendaryCard) => {
        if (!firestore || !userTeam) return;
        const cardRef = doc(firestore, 'leagues', leagueId, 'teams', userTeam.id, 'cards', card.id);
        const updateData = {
            status: 'unplayed',
            pendingSlotId: null,
        };
        
        updateDoc(cardRef, updateData)
            .then(() => {
                toast({
                    title: "Card Deactivated",
                    description: `The Legendary ${card.position} card has been returned to your hand.`,
                });
            })
            .catch(error => {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: cardRef.path,
                    operation: 'update',
                    requestResourceData: updateData
                }));
            });
    };

    const handleTradeCard = (card: LegendaryCard) => {
        toast({
            title: "Coming Soon!",
            description: "Trading legendary cards will be available in a future update."
        });
    };
    
    const handleDeleteCard = (card: LegendaryCard) => {
        setCardToDelete(card);
    };

    const handleConfirmDelete = () => {
        if (!firestore || !userTeam || !cardToDelete) return;
        const cardRef = doc(firestore, 'leagues', leagueId, 'teams', userTeam.id, 'cards', cardToDelete.id);
        
        deleteDoc(cardRef)
            .then(() => {
                toast({
                    title: "Card Deleted",
                    description: `The Legendary ${cardToDelete.position} card has been deleted.`,
                });
            })
            .catch(error => {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: cardRef.path,
                    operation: 'delete',
                }));
            })
            .finally(() => {
                setCardToDelete(null);
            });
    };

    if (isLoading) {
        return <div>Loading your legendary cards...</div>;
    }

    return (
        <>
            <div className="mt-6">
                {cards && cards.length > 0 ? (
                    <CardCarousel 
                        cards={cards} 
                        onPlayCard={handlePlayCard} 
                        onDeactivateCard={handleDeactivateCard} 
                        onTradeCard={handleTradeCard}
                        onDeleteCard={handleDeleteCard}
                    />
                ) : (
                     <Card className="mt-6 col-span-full">
                        <CardContent className="pt-6 text-center">
                            <p className="text-muted-foreground">You do not have any Legendary Cards yet.</p>
                            <p className="text-sm text-muted-foreground mt-2">Win matchups and complete league achievements to earn them!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={!!cardToPlay} onOpenChange={(isOpen) => !isOpen && setCardToPlay(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate {cardToPlay?.tier} {cardToPlay?.position} Card?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Select a starter slot to use this card in for one week. This can be undone until Sunday at 10 AM PST.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-60 overflow-y-auto p-1 space-y-2">
                        {eligibleSlots.length > 0 ? eligibleSlots.map(slot => (
                            <Card 
                                key={`${slot.position}-${slot.index}`} 
                                onClick={() => setSelectedSlot(slot)} 
                                className={cn("flex items-center justify-between p-3 cursor-pointer transition-colors", selectedSlot?.index === slot.index ? 'bg-primary/20 border-primary' : 'hover:bg-secondary/50')}
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="font-medium">{slot.position}</div>
                                        <div className="text-xs text-muted-foreground">Slot {slot.index + 1}</div>
                                    </div>
                                </div>
                                {roster?.starters[slot.index] && (
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{roster.starters[slot.index]?.name}</div>
                                        <div className="text-xs text-muted-foreground">Currently in slot</div>
                                    </div>
                                )}
                            </Card>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">You have no starter slots available for a {cardToPlay?.position}.</p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCardToPlay(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmPlay} disabled={!selectedSlot}>
                            Activate Card
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!cardToDelete} onOpenChange={(isOpen) => !isOpen && setCardToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {cardToDelete?.tier} {cardToDelete?.position} Card?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Are you sure you want to permanently delete this card? This can be undone until Sunday at 10 AM PST.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                     <AlertDialogCancel onClick={() => setCardToDelete(null)}>Cancel</AlertDialogCancel>
                     <AlertDialogAction asChild>
                      <Button variant="destructive" onClick={handleConfirmDelete}>
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
{/* ←←← ADD THIS BLOCK HERE */}
            {isActivated && (
              <LightningBurst 
                isActivated={isActivated} 
                tierColor={
                  cardToPlay?.tier === 'Legendary' ? '#fbbf24' :
                  cardToPlay?.tier === 'Epic' ? '#a78bfa' :
                  cardToPlay?.tier === 'Rare' ? '#60a5fa' :
                  '#9ca3af'
                } 
              />
            )}

        </>
    )
}