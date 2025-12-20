

'use client';
import { players } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamHelmet } from '@/components/team-helmet';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo, useContext } from 'react';
import type { Player, GameLogEntry, League } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { RosterContext } from '@/context/RosterContext';
import { calculateFantasyPoints } from '@/lib/scoring-calculator';
import { useParams } from 'next/navigation';
import { ChevronDown, ArrowDown } from 'lucide-react';

function StatCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 flex-1 min-w-[70px]">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs text-muted-foreground text-center">{title}</div>
        </div>
    )
}

function QBStatsTable({ player, league }: { player: Player | null, league: League | undefined }) {
    if (!player || !league) return null;

    const gameForProjectionWeek = useMemo(() => {
        if (!player || !player.gameLog || player.gameLog.length === 0) return null;
        const projectionWeek = player.weeklyProjection.week;
        return player.gameLog.find(g => g.week === projectionWeek && g.fpts !== undefined) as GameLogEntry | null;
    }, [player]);


    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Stats</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stat</TableHead>
                        <TableHead className="text-right">YDS</TableHead>
                        <TableHead className="text-right">TD</TableHead>
                        <TableHead className="text-right">I/F</TableHead>
                        <TableHead className="text-right">FPTS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">PROJ WK {player.weeklyProjection.week}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.passingYards}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.passingTds}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.interceptions}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fpts.toFixed(1)}</TableCell>
                    </TableRow>
                    {gameForProjectionWeek && (
                        <TableRow>
                            <TableCell className="font-medium">WK {gameForProjectionWeek.week}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.passingYards}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.passingTds}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.interceptions ?? gameForProjectionWeek.fumbleRecoveries ?? '-'}</TableCell>
                            <TableCell className="text-right">{calculateFantasyPoints(player, gameForProjectionWeek, league.scoringSettings).toFixed(2)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function RBStatsTable({ player, league }: { player: Player | null, league: League | undefined }) {
    if (!player || !league) return null;
    
    const gameForProjectionWeek = useMemo(() => {
        if (!player || !player.gameLog || player.gameLog.length === 0) return null;
        const projectionWeek = player.weeklyProjection.week;
        return player.gameLog.find(g => g.week === projectionWeek && g.fpts !== undefined) as GameLogEntry | null;
    }, [player]);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Stats</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stat</TableHead>
                        <TableHead className="text-right">ATT</TableHead>
                        <TableHead className="text-right">YDS</TableHead>
                        <TableHead className="text-right">TD</TableHead>
                        <TableHead className="text-right">FPTS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">PROJ WK {player.weeklyProjection.week}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.rushingAttempts}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.rushingYards}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.rushingTds}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fpts.toFixed(1)}</TableCell>
                    </TableRow>
                    {gameForProjectionWeek && (
                        <TableRow>
                            <TableCell className="font-medium">WK {gameForProjectionWeek.week}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.rushingAttempts}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.rushingYards}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.rushingTds}</TableCell>
                            <TableCell className="text-right">{calculateFantasyPoints(player, gameForProjectionWeek, league.scoringSettings).toFixed(2)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function WRStatsTable({ player, league }: { player: Player | null, league: League | undefined }) {
    if (!player || !league) return null;
    
    const gameForProjectionWeek = useMemo(() => {
        if (!player || !player.gameLog || player.gameLog.length === 0) return null;
        const projectionWeek = player.weeklyProjection.week;
        return player.gameLog.find(g => g.week === projectionWeek && g.fpts !== undefined) as GameLogEntry | null;
    }, [player]);


    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Stats</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stat</TableHead>
                        <TableHead className="text-right">REC</TableHead>
                        <TableHead className="text-right">TAR</TableHead>
                        <TableHead className="text-right">YDS</TableHead>
                        <TableHead className="text-right">TD</TableHead>
                        <TableHead className="text-right">FPTS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">PROJ WK {player.weeklyProjection.week}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.receptions}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.targets}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.receivingYards}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.receivingTds}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fpts.toFixed(1)}</TableCell>
                    </TableRow>
                    {gameForProjectionWeek && (
                        <TableRow>
                            <TableCell className="font-medium">WK {gameForProjectionWeek.week}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.receptions}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.targets}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.receivingYards}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.receivingTds}</TableCell>
                            <TableCell className="text-right">{calculateFantasyPoints(player, gameForProjectionWeek, league.scoringSettings).toFixed(2)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function KickerStatsTable({ player, league }: { player: Player | null, league: League | undefined }) {
    if (!player || !league) return null;
    
    const gameForProjectionWeek = useMemo(() => {
        if (!player || !player.gameLog || player.gameLog.length === 0) return null;
        const projectionWeek = player.weeklyProjection.week;
        return player.gameLog.find(g => g.week === projectionWeek && g.fpts !== undefined) as GameLogEntry | null;
    }, [player]);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Stats</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stat</TableHead>
                        <TableHead className="text-right">FGM</TableHead>
                        <TableHead className="text-right">FGA</TableHead>
                        <TableHead className="text-right">XPM</TableHead>
                        <TableHead className="text-right">FPTS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">PROJ WK {player.weeklyProjection.week}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fgm}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fga}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.xpm}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fpts.toFixed(1)}</TableCell>
                    </TableRow>
                    {gameForProjectionWeek && (
                        <TableRow>
                            <TableCell className="font-medium">WK {gameForProjectionWeek.week}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.fgm}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.fga}</TableCell>
                            <TableCell className="text-right">{gameForProjectionWeek.xpm}</TableCell>
                            <TableCell className="text-right">{calculateFantasyPoints(player, gameForProjectionWeek, league.scoringSettings).toFixed(2)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function DEFStatsTable({ player, league }: { player: Player | null, league: League | undefined }) {
    if (!player || !league) return null;
    
    const gameForProjectionWeek = useMemo(() => {
        if (!player || !player.gameLog || player.gameLog.length === 0) return null;
        const projectionWeek = player.weeklyProjection.week;
        return player.gameLog.find(g => g.week === projectionWeek && g.fpts !== undefined) as GameLogEntry | null;
    }, [player]);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Stats</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Stat</TableHead>
                        <TableHead className="text-right">PA</TableHead>
                        <TableHead className="text-right">INT</TableHead>
                        <TableHead className="text-right">FR</TableHead>
                        <TableHead className="text-right">SCK</TableHead>
                        <TableHead className="text-right">TD</TableHead>
                        <TableHead className="text-right">FPTS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">PROJ WK {player.weeklyProjection.week}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.pointsAgainst}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.interceptions}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fumbleRecoveries}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.sacks}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.touchdowns}</TableCell>
                        <TableCell className="text-right">{player.weeklyProjection.fpts.toFixed(1)}</TableCell>
                    </TableRow>
                    {gameForProjectionWeek && (
                        <TableRow>
                             <TableCell className="font-medium">WK {gameForProjectionWeek.week}</TableCell>
                             <TableCell className="text-right">{gameForProjectionWeek.pointsAgainst}</TableCell>
                             <TableCell className="text-right">{gameForProjectionWeek.interceptions}</TableCell>
                             <TableCell className="text-right">{gameForProjectionWeek.fumbleRecoveries}</TableCell>
                             <TableCell className="text-right">{gameForProjectionWeek.sacks}</TableCell>
                             <TableCell className="text-right">{(gameForProjectionWeek?.passingTds || 0) + (gameForProjectionWeek?.rushingTds || 0) + (gameForProjectionWeek?.receivingTds || 0)}</TableCell>
                             <TableCell className="text-right">{calculateFantasyPoints(player, gameForProjectionWeek, league.scoringSettings).toFixed(2)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function NewsTable({ player }: { player: Player | null }) {
    if (!player || !player.news || player.news.length === 0) {
        return <p>No recent news.</p>;
    }
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Recent News</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Headline</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {player.news.slice(0, 6).map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium whitespace-nowrap">{item.date}</TableCell>
                            <TableCell>
                                {item.headline}
                                <span className="text-xs text-muted-foreground ml-2">({item.source})</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function GameLog({ player, league }: { player: Player | null, league: League | undefined }) {
    if (!player || !league) return null;

    const renderQBContent = () => (
        <Tabs defaultValue="passing">
            <TabsList>
                <TabsTrigger value="passing">Passing</TabsTrigger>
                <TabsTrigger value="rushing">Rushing</TabsTrigger>
                <TabsTrigger value="misc-td">Misc TD</TabsTrigger>
            </TabsList>
            <TabsContent value="passing" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">YDS</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                            <TableHead className="text-right">I/F</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.passingYards ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.passingTds ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.interceptions ?? (game.fumbleRecoveries ?? '-')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
             <TabsContent value="rushing" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">ATT</TableHead>
                            <TableHead className="text-right">YDS</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingAttempts ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingYards ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingTds ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="misc-td" className="mt-4">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">BLK</TableHead>
                            <TableHead className="text-right">INT</TableHead>
                            <TableHead className="text-right">FUM</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{'-'}</TableCell>
                                <TableCell className="text-right">{game.interceptions ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.fumbleRecoveries ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
        </Tabs>
    );

    const renderRBContent = () => (
        <Tabs defaultValue="rushing">
            <TabsList>
                <TabsTrigger value="rushing">Rushing</TabsTrigger>
                <TabsTrigger value="receiving">Receiving</TabsTrigger>
                <TabsTrigger value="misc-td">Misc TD</TabsTrigger>
            </TabsList>
            <TabsContent value="rushing" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">ATT</TableHead>
                            <TableHead className="text-right">YDS</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingAttempts ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingYards ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingTds ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
             <TabsContent value="receiving" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">REC</TableHead>
                            <TableHead className="text-right">TAR</TableHead>
                            <TableHead className="text-right">YDS</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.receptions ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.targets ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.receivingYards ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.receivingTds ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="misc-td" className="mt-4">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">BLK</TableHead>
                            <TableHead className="text-right">INT</TableHead>
                            <TableHead className="text-right">FUM</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{'-'}</TableCell>
                                <TableCell className="text-right">{game.interceptions ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.fumbleRecoveries ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
        </Tabs>
    );

    const renderWRTEContent = () => (
        <Tabs defaultValue="receiving">
            <TabsList>
                <TabsTrigger value="receiving">Receiving</TabsTrigger>
                <TabsTrigger value="rushing">Rushing</TabsTrigger>
                <TabsTrigger value="misc-td">Misc TD</TabsTrigger>
            </TabsList>
            <TabsContent value="receiving" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">REC</TableHead>
                            <TableHead className="text-right">TAR</TableHead>
                            <TableHead className="text-right">YDS</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.receptions ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.targets ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.receivingYards ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.receivingTds ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
             <TabsContent value="rushing" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">ATT</TableHead>
                            <TableHead className="text-right">YDS</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingAttempts ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingYards ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.rushingTds ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="misc-td" className="mt-4">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">BLK</TableHead>
                            <TableHead className="text-right">INT</TableHead>
                            <TableHead className="text-right">FUM</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{'-'}</TableCell>
                                <TableCell className="text-right">{game.interceptions ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.fumbleRecoveries ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
        </Tabs>
    );

    const renderDEFContent = () => (
         <Tabs defaultValue="defense">
            <TabsList>
                <TabsTrigger value="defense">Defense</TabsTrigger>
            </TabsList>
            <TabsContent value="defense" className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WK</TableHead>
                            <TableHead>OPP</TableHead>
                            <TableHead className="text-right">FPTS</TableHead>
                            <TableHead className="text-right">PA</TableHead>
                            <TableHead className="text-right">INT</TableHead>
                            <TableHead className="text-right">FR</TableHead>
                            <TableHead className="text-right">SCK</TableHead>
                            <TableHead className="text-right">TD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {player.gameLog?.map((game) => (
                            <TableRow key={game.week}>
                                <TableCell>{game.week}</TableCell>
                                <TableCell>{game.opponent}</TableCell>
                                <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right">{game.pointsAgainst ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.interceptions ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.fumbleRecoveries ?? '-'}</TableCell>
                                <TableCell className="text-right">{game.sacks ?? '-'}</TableCell>
                                <TableCell className="text-right">{(game.passingTds || 0) + (game.rushingTds || 0) + (game.receivingTds || 0) || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
        </Tabs>
    );

    const renderKickerContent = () => (
        <Tabs defaultValue="kicking">
           <TabsList>
               <TabsTrigger value="kicking">Kicking</TabsTrigger>
           </TabsList>
           <TabsContent value="kicking" className="mt-4">
               <Table>
                   <TableHeader>
                       <TableRow>
                           <TableHead>WK</TableHead>
                           <TableHead>OPP</TableHead>
                           <TableHead className="text-right">FPTS</TableHead>
                           <TableHead className="text-right">FGM</TableHead>
                           <TableHead className="text-right">FGA</TableHead>
                           <TableHead className="text-right">XPM</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {player.gameLog?.map((game) => (
                           <TableRow key={game.week}>
                               <TableCell>{game.week}</TableCell>
                               <TableCell>{game.opponent}</TableCell>
                               <TableCell className="text-right">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
                               <TableCell className="text-right">{game.fgm ?? '-'}</TableCell>
                               <TableCell className="text-right">{game.fga ?? '-'}</TableCell>
                               <TableCell className="text-right">{game.xpm ?? '-'}</TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
           </TabsContent>
       </Tabs>
    );

    const renderDefaultContent = () => (
        <p>Game log for {player.position} will go here.</p>
    );

    const currentYear = new Date().getFullYear();

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{currentYear} Regular Season</h3>
            {player.position === 'QB' ? renderQBContent() : 
             player.position === 'RB' ? renderRBContent() :
             (player.position === 'WR' || player.position === 'TE') ? renderWRTEContent() :
             player.position === 'DEF' ? renderDEFContent() :
             player.position === 'K' ? renderKickerContent() :
             renderDefaultContent()}
        </div>
    );
}

function OddsView({ player }: { player: Player | null }) {
    if (!player?.odds) {
        return <p>No odds available for this player's game.</p>;
    }

    const { game, props } = player.odds;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Game Lines</span>
                        <span className="text-sm font-normal text-muted-foreground">{game.awayTeam} @ {game.homeTeam}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground">SPREAD</p>
                            <p className="font-semibold">{game.spread.team} {game.spread.value > 0 ? `+${game.spread.value}` : game.spread.value}</p>
                            <p className="text-xs text-muted-foreground">({game.spread.price})</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">MONEYLINE</p>
                            <p className="font-semibold">{game.moneyline.away > 0 ? `+${game.moneyline.away}` : game.moneyline.away} / {game.moneyline.home > 0 ? `+${game.moneyline.home}` : game.moneyline.home}</p>
                            <p className="text-xs text-muted-foreground invisible">price</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">TOTAL</p>
                            <p className="font-semibold">O/U {game.total.over}</p>
                             <p className="text-xs text-muted-foreground invisible">price</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Player Props</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {props.map((prop, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                            <span className="text-sm font-medium">{prop.name}</span>
                            <span className="text-sm font-semibold text-primary">{prop.value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function TeamView({ player }: { player: Player | null }) {
    if (!player) return null;

    const toOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const RankCard = ({ title, value }: { title: string; value: number }) => (
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 flex-1 min-w-[70px] text-center">
            <div className="text-lg font-bold">{toOrdinal(value)}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">{title}</div>
        </div>
    );

    const renderQBRanks = () => {
        if (!player?.teamRanks) return null;
        return (
            <>
                <RankCard title="OFFENSE" value={player.teamRanks['OFFENSE']} />
                <RankCard title="PASS YD" value={player.teamRanks['PASS YD']} />
                <RankCard title="PASS ATT" value={player.teamRanks['PASS ATT']} />
                <RankCard title="PASS TD" value={player.teamRanks['PASS TD']} />
                <RankCard title="TD" value={player.teamRanks['TD']} />
                <RankCard title="RZ" value={player.teamRanks['RZ']} />
                <RankCard title="RZ %" value={player.teamRanks['RZ %']} />
            </>
        );
    };

    const renderRBRanks = () => {
        if (!player?.teamRanks) return null;
        return (
            <>
                <RankCard title="OFFENSE" value={player.teamRanks['OFFENSE']} />
                <RankCard title="RUSH YD" value={player.teamRanks['RUSH YD']} />
                <RankCard title="RUSH ATT" value={player.teamRanks['RUSH ATT']} />
                <RankCard title="RUSH TD" value={player.teamRanks['RUSH TD']} />
                <RankCard title="TD" value={player.teamRanks['TD']} />
                <RankCard title="RZ" value={player.teamRanks['RZ']} />
                <RankCard title="RZ %" value={player.teamRanks['RZ %']} />
            </>
        );
    };

    const renderWRTERanks = () => {
        if (!player?.teamRanks) return null;
        return (
            <>
                <RankCard title="OFFENSE" value={player.teamRanks['OFFENSE']} />
                <RankCard title="PASS YD" value={player.teamRanks['PASS YD']} />
                <RankCard title="PASS ATT" value={player.teamRanks['PASS ATT']} />
                <RankCard title="PASS TD" value={player.teamRanks['PASS TD']} />
                <RankCard title="TD" value={player.teamRanks['TD']} />
                <RankCard title="RZ" value={player.teamRanks['RZ']} />
                <RankCard title="RZ %" value={player.teamRanks['RZ %']} />
            </>
        );
    };

    const renderKickerRanks = () => {
        if (!player?.teamRanks) return null;
        return (
            <>
                <RankCard title="OFFENSE" value={player.teamRanks['OFFENSE']} />
                <RankCard title="TD" value={player.teamRanks['TD']} />
                <RankCard title="RZ" value={player.teamRanks['RZ']} />
                <RankCard title="RZ CONV" value={player.teamRanks['RZ CONV']} />
            </>
        );
    };

    const renderDEFRanks = () => {
        if (!player?.teamRanks) return null;
        return (
            <>
                <RankCard title="PA" value={player.teamRanks['PA']} />
                <RankCard title="INT" value={player.teamRanks['INT']} />
                <RankCard title="FR" value={player.teamRanks['FR']} />
                <RankCard title="SCK" value={player.teamRanks['SCK']} />
                <RankCard title="TD" value={player.teamRanks['TD']} />
            </>
        );
    };

    const DepthChartView = ({ player }: { player: Player | null }) => {
        if (!player) return null;
        const teamPlayers = players;

        const getPlayer = (pos: Player['position'], rank = 1) => {
            const playersOfPos = teamPlayers
                .filter(p => p.position === pos)
                .sort((a, b) => (b.yearPoints || 0) - (a.yearPoints || 0));
            return playersOfPos[rank - 1];
        };

        const getDefPlayer = (posRank: string) => {
            return teamPlayers.find(p => p.posRank === posRank);
        };
        
        const offense = [
            { pos: 'QB', player: getPlayer('QB') },
            { pos: 'RB', player: getPlayer('RB') },
            { pos: 'WR1', player: getPlayer('WR', 1) },
            { pos: 'WR2', player: getPlayer('WR', 2) },
            { pos: 'WR3', player: getPlayer('WR', 3) },
            { pos: 'TE', player: getPlayer('TE') },
            { pos: 'K', player: getPlayer('K') },
        ];

        const defense = [
            { pos: 'FS', player: getDefPlayer('FS1') },
            { pos: 'LCB', player: getDefPlayer('CB1') },
            { pos: 'LDE', player: getDefPlayer('DE1') },
            { pos: 'LILB', player: getDefPlayer('LB1') },
            { pos: 'LOLB', player: getDefPlayer('LB2') },
            { pos: 'NB', player: getDefPlayer('CB3') },
            { pos: 'NT', player: getDefPlayer('NT1') },
            { pos: 'OL', player: getDefPlayer('OL1') },
            { pos: 'RCB', player: getDefPlayer('CB2') },
            { pos: 'RDE', player: getDefPlayer('DE2') },
            { pos: 'RILB', player: getDefPlayer('LB3') },
            { pos: 'ROLB', player: getDefPlayer('LB4') },
            { pos: 'SS', player: getDefPlayer('SS1') },
        ];

        const renderChart = (title: string, players: { pos: string, player: Player | undefined }[]) => (
             <div>
                <h4 className="text-md font-semibold mb-2 mt-4">{title}</h4>
                <div className="space-y-2">
                    {players.map(({ pos, player }) => (
                        <div key={pos} className="flex justify-between items-center text-sm p-2 rounded-md bg-secondary/50">
                            <span className="font-medium text-muted-foreground">{pos}</span>
                            <span className="font-semibold">{player?.name ?? 'N/A'}</span>
                        </div>
                    ))}
                </div>
            </div>
        )

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Depth Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderChart('Offense', offense)}
                    {renderChart('Defense', defense)}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Team Rank</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea>
                        <div className="flex gap-2">
                            {player.position === 'QB' && renderQBRanks()}
                            {player.position === 'RB' && renderRBRanks()}
                            {(player.position === 'WR' || player.position === 'TE') && renderWRTERanks()}
                            {player.position === 'K' && renderKickerRanks()}
                            {player.position === 'DEF' && renderDEFRanks()}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
            <DepthChartView player={player} />
        </div>
    )
}

function BioView({ player }: { player: Player | null }) {
    if (!player) return null;

    const bioDetails = [
        { label: 'Team', value: player.nflTeam },
        { label: 'Position', value: player.position },
        { label: 'HT/WT', value: player.heightWeight },
        { label: 'Birthplace', value: player.birthplace },
        { label: 'Status', value: player.status },
        { label: 'Experience', value: player.experience },
        { label: 'College', value: player.college },
        { label: 'Draft Info', value: player.draftInfo },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>BIOGRAPHY</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {bioDetails.map((detail) => (
                        <div key={detail.label} className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">{detail.label}</span>
                            <span className="font-semibold text-right">{detail.value || '--'}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function StatsView({ player, league }: { player: Player | null; league: League | undefined }) {
  if (!player || !league || !player.gameLog || player.gameLog.length === 0) {
    return <p>No game logs available for this player.</p>;
  }

  const statCategories = {
    Passing: ['passingAttempts', 'completions', 'passingYards', 'passingTds', 'interceptions', 'sacksTaken'],
    Rushing: ['rushingAttempts', 'rushingYards', 'rushingTds'],
    Receiving: ['targets', 'receptions', 'receivingYards', 'receivingTds'],
    'Return Game': ['kickReturnYards', 'puntReturnYardsPlayer'],
    Fumbles: ['fumbles', 'fumblesLost', 'fumbleRecoveries'],
    Kicking: ['fgm', 'fga', 'xpm', 'xpa'],
    Defense: ['pointsAgainst', 'sacks', 'defensiveInts', 'defensiveFumbleRecoveries', 'safeties', 'defensiveTds', 'returnTds', 'blockedKicks'],
    'Punting': ['netPunts', 'puntYards', 'puntsInside10', 'puntsInside20', 'blockedPunts', 'puntsReturned', 'puntTouchbacks', 'puntFairCatches'],
    'Defensive Player': ['soloTackles', 'assistedTackles', 'sacks', 'tacklesForLoss', 'passesDefensed', 'defensiveInts', 'fumblesForced', 'fumbleRecoveries'],
  };

  const getStatName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Game Stats</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Week</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead className="text-right">FPTS</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {player.gameLog.map((game) => (
        <div key={game.week} className="space-y-4 py-4 border-b">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[100px] font-medium">{game.week}</TableCell>
                <TableCell>{game.opponent}</TableCell>
                <TableCell className="text-right font-bold text-primary">{game.fpts !== undefined ? calculateFantasyPoints(player, game, league.scoringSettings).toFixed(2) : '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="px-4">
            {Object.entries(statCategories).map(([category, stats]) => {
              const hasData = stats.some(stat => game[stat as keyof GameLogEntry] !== undefined && game[stat as keyof GameLogEntry] !== null && game[stat as keyof GameLogEntry] !== 0);
              if (!hasData) return null;

              return (
                <div key={category} className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">{category}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {stats.map(stat => {
                      const value = game[stat as keyof GameLogEntry];
                      if (value === undefined || value === null) return null;
                      return (
                        <div key={stat} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{getStatName(stat)}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


function PlayerDetailContent({ player, league, onDropPlayer }: { player: Player | null; league: League | undefined; onDropPlayer: (player: Player) => void; }) {
    const { teams } = useContext(RosterContext);
    
    if (!player || !league) return null;

    const currentTeam = teams.find(t => t.roster.starters.some(p => p?.id === player.id) || t.roster.bench.some(p => p.id === player.id) || t.roster.ir.some(p => p.id === player.id));

    const tabs = ["Overview", "News", "Stats", "Odds", "Game Log", "Team", "Bio"];

    const renderOverviewContent = () => {
        return (
            <div className="space-y-6">
                {(() => {
                    switch (player.position) {
                        case 'QB': return <QBStatsTable player={player} league={league} />;
                        case 'RB': return <RBStatsTable player={player} league={league} />;
                        case 'WR':
                        case 'TE': return <WRStatsTable player={player} league={league} />;
                        case 'K': return <KickerStatsTable player={player} league={league} />;
                        case 'DEF': return <DEFStatsTable player={player} league={league} />;
                        default: return <p>No stats available for this position.</p>;
                    }
                })()}
                <NewsTable player={player} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <div className="bg-muted p-4 pt-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
                <TeamHelmet team={player.nflTeam} className="w-48 h-48 absolute -right-8 -top-8 opacity-20" />
                <div className="relative z-20 flex justify-between">
                    <div className="space-y-2">
                         <h2 className="text-2xl font-bold font-headline">{player.name.toUpperCase()}</h2>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TeamHelmet team={player.nflTeam} className="w-4 h-4" />
                            <span>{player.nflTeam}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>{player.position}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>#{player.jerseyNumber}</span>
                        </div>
                        {currentTeam && (
                            <div className="flex items-center gap-2 text-sm">
                                <Image src={currentTeam.logoUrl} alt={currentTeam.name} width={16} height={16} className="rounded-full" />
                                <span>{currentTeam.name}</span>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
                             <Button size="sm" variant="destructive" onClick={() => onDropPlayer(player)}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Drop
                            </Button>
                            <Button size="sm" variant="secondary">
                                Trade Offers
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      <img
                        src={player.headshotUrl}
                        alt={player.name}
                        className="w-full h-full rounded-full border-4 border-background object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://picsum.photos/seed/default-player/128/128";
                        }}
                      />
                    </div>
                </div>
            </div>

            <div className="p-4 -mt-4">
                 <Card>
                    <CardContent className="p-2">
                        <div className="flex flex-wrap gap-1 justify-center">
                            <StatCard title="POS RANK" value={player.posRank} />
                            <StatCard title="AVG FPTS" value={player.avgPoints.toFixed(1)} />
                            <StatCard title="YEAR FPTS" value={player.yearPoints.toFixed(1)} />
                            <StatCard title="% ROST" value={`${player.rosterPercentage}%`} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="px-4">
                <Tabs defaultValue="Overview" className="w-full">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList>
                            {tabs.map(tab => (
                                <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <div className="mt-4">
                        <TabsContent value="Overview" className="mt-0">
                            {renderOverviewContent()}
                        </TabsContent>
                        <TabsContent value="News" className="mt-0">
                            <NewsTable player={player} />
                        </TabsContent>
                        <TabsContent value="Stats" className="mt-0">
                             <StatsView player={player} league={league} />
                        </TabsContent>
                        <TabsContent value="Odds" className="mt-0">
                            <OddsView player={player} />
                        </TabsContent>
                        <TabsContent value="Game Log" className="mt-0">
                            <GameLog player={player} league={league} />
                        </TabsContent>
                        <TabsContent value="Team" className="mt-0">
                           <TeamView player={player} />
                        </TabsContent>
                        <TabsContent value="Projections" className="mt-0">
                            <p>Content for Projections will go here.</p>
                        </TabsContent>
                        <TabsContent value="Transactions" className="mt-0">
                            <p>Content for Transactions will go here.</p>
                        </TabsContent>
                        <TabsContent value="Bio" className="mt-0">
                           <BioView player={player} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}


interface PlayerDetailSheetProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDropPlayer: (player: Player) => void;
}

export function PlayerDetailSheet({ player, open, onOpenChange, onDropPlayer }: PlayerDetailSheetProps) {
    const { leagues } = useContext(RosterContext);
    const params = useParams();
    const leagueId = params.leagueId as string;
    const league = leagues.find(l => l.id === leagueId);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent 
                side="bottom" 
                className="w-full h-screen flex flex-col p-0 border-0" 
                aria-describedby={undefined}
            >
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="sr-only">Player Details: {player?.name}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <PlayerDetailContent player={player} league={league} onDropPlayer={onDropPlayer} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
