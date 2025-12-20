

import type { PositionSetting, ScoringSettings, ScoringSetting } from './types';

// Default roster settings — used when creating new leagues
export const defaultRosterSettings: PositionSetting[] = [
  { name: "Quarterback", abbr: "QB", starters: 1, max: 4 },
  { name: "Team Quarterback", abbr: "TQB", starters: 0, max: 0 },
  { name: "Running Back", abbr: "RB", starters: 2, max: 8 },
  { name: "Running Back/Wide Receiver", abbr: "RB/WR", starters: 0, max: 8 },
  { name: "Wide Receiver", abbr: "WR", starters: 2, max: 8 },
  { name: "Wide Receiver/Tight End", abbr: "WR/TE", starters: 0, max: 8 },
  { name: "Tight End", abbr: "TE", starters: 1, max: 4 },
  { name: "Flex", abbr: "FLEX", starters: 1, max: 8 },
  { name: "Offensive Player Utility", abbr: "OP", starters: 0, max: 8 },
  { name: "Defensive Tackle", abbr: "DT", starters: 0, max: 4 },
  { name: "Defensive End", abbr: "DE", starters: 0, max: 4 },
  { name: "Linebacker", abbr: "LB", starters: 0, max: 8 },
  { name: "Defensive Line", abbr: "DL", starters: 0, max: 8 },
  { name: "Cornerback", abbr: "CB", starters: 0, max: 4 },
  { name: "Safety", abbr: "S", starters: 0, max: 4 },
  { name: "Defensive Back", abbr: "DB", starters: 0, max: 8 },
  { name: "Defensive Player Utility", abbr: "DP", starters: 0, max: 8 },
  { name: "Punter", abbr: "P", starters: 0, max: 2 },
  { name: "Team Defense/Special Teams", abbr: "D/ST", starters: 1, max: 2 },
  { name: "Place Kicker", abbr: "K", starters: 1, max: 2 },
  { name: "Head Coach", abbr: "HC", starters: 1, max: 1 },
  { name: "Bench", abbr: "BE", starters: 6, max: 10 },
  { name: "Injured Reserve", abbr: "IR", starters: 1, max: 4 },
];

// Default scoring settings — used when creating new leagues
// If these are already defined in RosterContext.tsx, you can delete this block too


// const generateGameLog = (playerId: string): GameLogEntry[] => {
//     return Array.from({length: 17}, (_, i) => {
//         const week = i + 1;
//         const hasPlayed = week < 8;
        
//         const teamScore = hasPlayed ? Math.floor(Math.random() * 21 + 14) : undefined;
//         const opponentScore = hasPlayed ? Math.floor(Math.random() * 21 + 10) : undefined;
//         let gameResult: 'W' | 'L' | 'T' | undefined = undefined;
//         if(teamScore && opponentScore) {
//             if(teamScore > opponentScore) gameResult = 'W';
//             else if(teamScore < opponentScore) gameResult = 'L';
//             else gameResult = 'T';
//         }

//         return {
//             week: week,
//             opponent: i % 2 === 0 ? 'vs DEN' : '@LV',
//             gameResult: gameResult,
//             teamScore: teamScore,
//             opponentScore: opponentScore,
//             fpts: hasPlayed ? Math.random() * 30 + 5 : undefined,
            
//             // Passing
//             passingAttempts: hasPlayed ? Math.floor(Math.random() * 15 + 20) : undefined,
//             completions: hasPlayed ? Math.floor(Math.random() * 10 + 15) : undefined,
//             get incompletePasses() { 
//                 return (this.passingAttempts && this.completions) ? this.passingAttempts - this.completions : undefined 
//             },
//             passingYards: hasPlayed ? Math.floor(Math.random() * 100 + 250) : undefined,
//             passingTds: hasPlayed ? Math.floor(Math.random() * 3) + 1 : undefined,
//             interceptions: hasPlayed ? Math.floor(Math.random() * 2) : undefined,
//             sacksTaken: hasPlayed ? Math.floor(Math.random() * 3) : undefined,
//             passing2pt: hasPlayed ? Math.floor(Math.random() * 0.3) : undefined,

//             // Rushing
//             rushingAttempts: hasPlayed ? Math.floor(Math.random() * 10 + 5) : undefined,
//             rushingYards: hasPlayed ? Math.floor(Math.random() * 40 + 10) : undefined,
//             rushingTds: hasPlayed ? Math.floor(Math.random() * 1.2) : undefined,
//             rushing2pt: hasPlayed ? Math.floor(Math.random() * 0.1) : undefined,

//             // Receiving
//             targets: hasPlayed ? Math.floor(Math.random() * 8 + 2) : undefined,
//             receptions: hasPlayed ? Math.floor(Math.random() * 6 + 1) : undefined,
//             receivingYards: hasPlayed ? Math.floor(Math.random() * 70 + 10) : undefined,
//             receivingTds: hasPlayed ? Math.floor(Math.random() * 1.5) : undefined,
//             receiving2pt: hasPlayed ? Math.floor(Math.random() * 0.2) : undefined,
            
//             // Fumbles
//             fumbles: hasPlayed ? Math.floor(Math.random() * 0.5) : undefined,
//             fumblesLost: hasPlayed ? Math.floor(Math.random() * 0.3) : undefined,
//             fumbleRecoveries: hasPlayed ? Math.floor(Math.random() * 0.4) : undefined,

//             // Kicking
//             xpm: hasPlayed ? Math.floor(Math.random() * 4) : undefined,
//             fgm0_39: hasPlayed ? Math.floor(Math.random() * 2) : undefined,
//             fgm40_49: hasPlayed ? Math.floor(Math.random() * 1.5) : undefined,
//             fgm50_59: hasPlayed ? Math.floor(Math.random() * 0.5) : undefined,
//             fgmiss0_39: hasPlayed ? Math.floor(Math.random() * 0.2) : undefined,
//             fgmiss40_49: hasPlayed ? Math.floor(Math.random() * 0.1) : undefined,
            
//             // Team Defense & ST
//             pointsAgainst: hasPlayed ? Math.floor(Math.random() * 30) : undefined,
//             yardsAllowed: hasPlayed ? Math.floor(Math.random() * 250) + 200 : undefined,
//             sacks: hasPlayed ? Math.floor(Math.random() * 4) : undefined,
//             defensiveInts: hasPlayed ? Math.floor(Math.random() * 2) : undefined,
//             defensiveFumbleRecoveries: hasPlayed ? Math.floor(Math.random() * 1.5) : undefined,
//             safeties: hasPlayed ? Math.floor(Math.random() * 0.2) : undefined,
//             defensiveTds: hasPlayed ? Math.floor(Math.random() * 0.3) : undefined,
//             returnTds: hasPlayed ? Math.floor(Math.random() * 0.2) : undefined,
//             blockedKicks: hasPlayed ? Math.floor(Math.random() * 0.4) : undefined,

//             // Punting
//             netPunts: hasPlayed ? Math.floor(Math.random() * 5 + 1) : undefined,
//             puntYards: hasPlayed ? Math.floor(Math.random() * 100 + 150) : undefined,
//             puntsInside10: hasPlayed ? Math.floor(Math.random() * 2) : undefined,
//             puntsInside20: hasPlayed ? Math.floor(Math.random() * 3) : undefined,
//             blockedPunts: hasPlayed ? Math.floor(Math.random() * 0.1) : undefined,
//             puntsReturned: hasPlayed ? Math.floor(Math.random() * 3) : undefined,
//             puntReturnYards: hasPlayed ? Math.floor(Math.random() * 30) : undefined,
//             puntTouchbacks: hasPlayed ? Math.floor(Math.random() * 1) : undefined,
//             puntFairCatches: hasPlayed ? Math.floor(Math.random() * 2) : undefined,

//             // Individual Defensive Player
//             soloTackles: hasPlayed ? Math.floor(Math.random() * 5) : undefined,
//             assistedTackles: hasPlayed ? Math.floor(Math.random() * 4) : undefined,
//             tacklesForLoss: hasPlayed ? Math.floor(Math.random() * 2) : undefined,
//             passesDefensed: hasPlayed ? Math.floor(Math.random() * 2) : undefined,
//             fumblesForced: hasPlayed ? Math.floor(Math.random() * 0.3) : undefined,

//             // Return Yardage (for individual players)
//             kickReturnYards: hasPlayed ? Math.floor(Math.random() * 50) : undefined,
//             puntReturnYardsPlayer: hasPlayed ? Math.floor(Math.random() * 40) : undefined,
//         }
//     });
// };


// export const players: Player[] = [
//   { id: 'p1', sleeperId: '4034', name: 'Patrick Mahomes', position: 'QB', nflTeam: 'KC', headshotUrl: 'https://picsum.photos/seed/p1/64/64', status: 'Healthy', projectedPoints: 25.5, actualPoints: 28.2, rosterPercentage: 99.8, startPercentage: 98.5, gameTime: 'Sun 1:25 PM', opponent: { team: '@DEN', rank: 3 }, jerseyNumber: 15, posRank: 'QB1', avgPoints: 26.8, yearPoints: 428.8, news: [ { date: '2024-07-20', headline: "Reports for camp with 'cannon' of an arm.", source: 'ESPN' }, { date: '2024-07-18', headline: 'Expected to play in first preseason game.', source: 'NFL.com' } ], seasonStats: { passingYards: 4800, passingTds: 38, interceptions: 11 }, weeklyProjection: { week: 1, passingYards: 280, passingTds: 2, interceptions: 1, fpts: 25.5 }, gameLog: generateGameLog('p1'), odds: { game: { homeTeam: 'DEN', awayTeam: 'KC', moneyline: { home: 180, away: -220 }, spread: { team: 'KC', value: -4.5, price: -110 }, total: { over: 48.5, under: 48.5 } }, props: [ { name: 'Passing Yards', value: 'Over 285.5 (-115)' }, { name: 'Passing TDs', value: 'Over 2.5 (+120)' }, { name: 'Anytime TD Scorer', value: '+450' } ] }, teamRanks: { 'OFFENSE': 2, 'PASS YD': 1, 'PASS ATT': 4, 'PASS TD': 1, 'TD': 8, 'RZ': 3, 'RZ %': 5 }, heightWeight: `6'2", 225 lbs`, birthplace: 'Tyler, TX', experience: '8th season', college: 'Texas Tech', draftInfo: '2017: Rd 1, Pk 10 (KC)' },
//   { id: 'p2', sleeperId: "5849", name: 'Lamar Jackson', position: 'QB', nflTeam: 'BAL', headshotUrl: 'https://picsum.photos/seed/p17/64/64', status: 'Healthy', projectedPoints: 26.8, actualPoints: 29.3, rosterPercentage: 99.8, startPercentage: 98.6, gameTime: 'Sun 1:00 PM', opponent: { team: 'vs PIT', rank: 14 }, jerseyNumber: 8, posRank: 'QB3', avgPoints: 27.5, yearPoints: 440.0, seasonStats: { passingYards: 3800, passingTds: 25, interceptions: 8 }, weeklyProjection: { week: 1, passingYards: 240, passingTds: 2, interceptions: 0, fpts: 26.8 }, gameLog: generateGameLog('p17'), teamRanks: { 'OFFENSE': 6, 'PASS YD': 21, 'PASS ATT': 27, 'PASS TD': 13, 'TD': 2, 'RZ': 2, 'RZ %': 2 } },
//   { id: 'p3', sleeperId: "6801", name: 'Christian McCaffrey', position: 'RB', nflTeam: 'SF', headshotUrl: 'https://picsum.photos/seed/p2/64/64', status: 'Questionable', projectedPoints: 22.1, actualPoints: 24.5, rosterPercentage: 100, startPercentage: 99.9, gameTime: 'Mon 8:15 PM', opponent: { team: 'vs LAR', rank: 12 }, jerseyNumber: 23, posRank: 'RB1', avgPoints: 21.2, yearPoints: 381.6, news: [ { date: '2024-07-21', headline: 'Limited in practice with calf tightness.', source: 'The Athletic' }, { date: '2024-07-19', headline: 'Coach says injury is minor, expects him to play.', source: 'Yahoo Sports' } ], seasonStats: { rushingAttempts: 290, rushingYards: 1450, rushingTds: 14, receptions: 60, targets: 80, receivingYards: 500, receivingTds: 4 }, weeklyProjection: { week: 1, rushingAttempts: 18, rushingYards: 85, rushingTds: 1, fpts: 22.1 }, gameLog: generateGameLog('p2'), odds: { game: { homeTeam: 'SF', awayTeam: 'LAR', moneyline: { home: -350, away: 280 }, spread: { team: 'SF', value: -7.5, price: -110 }, total: { over: 45.5, under: 45.5 } }, props: [ { name: 'Rushing Yards', value: 'Over 88.5 (-120)' }, { name: 'First TD Scorer', value: '+400' }, { name: 'Anytime TD Scorer', value: '-250' }, { name: 'Last to score a TD', value: '+500'} ] }, teamRanks: { 'OFFENSE': 5, 'RUSH YD': 3, 'RUSH ATT': 2, 'RUSH TD': 1, 'TD': 4, 'RZ': 6, 'RZ %': 8 }, heightWeight: `6'0", 210 lbs`, birthplace: 'Castle Rock, CO', experience: '8th season', college: 'Stanford', draftInfo: '2017: Rd 1, Pk 8 (CAR)' },
//   { id: 'p4', sleeperId: "7591", name: 'Justin Jefferson', position: 'WR', nflTeam: 'MIN', headshotUrl: 'https://picsum.photos/seed/p3/64/64', status: 'Healthy', projectedPoints: 18.9, actualPoints: 21.3, rosterPercentage: 100, startPercentage: 99.5, gameTime: 'Sun 1:00 PM', opponent: { team: 'vs GB', rank: 28 }, jerseyNumber: 18, posRank: 'WR2', avgPoints: 19.5, yearPoints: 312.0, news: [ { date: '2024-07-22', headline: 'Makes spectacular one-handed catch in practice.', source: 'Vikings.com' } ], seasonStats: { receptions: 110, targets: 160, receivingYards: 1700, receivingTds: 10 }, weeklyProjection: { week: 1, receptions: 7, targets: 10, receivingYards: 105, receivingTds: 1, fpts: 18.9 }, gameLog: generateGameLog('p3'), odds: { game: { homeTeam: 'MIN', awayTeam: 'GB', moneyline: { home: -120, away: 100 }, spread: { team: 'MIN', value: -1.5, price: -110 }, total: { over: 50.5, under: 50.5 } }, props: [ { name: 'Receiving Yards', value: 'Over 95.5 (-110)' }, { name: 'Anytime TD Scorer', value: '+110' } ] }, teamRanks: { 'OFFENSE': 10, 'PASS YD': 8, 'PASS ATT': 12, 'PASS TD': 7, 'TD': 15, 'RZ': 11, 'RZ %': 14 }, heightWeight: `6'1", 195 lbs`, birthplace: 'St. Rose, LA', experience: '5th season', college: 'LSU', draftInfo: '2020: Rd 1, Pk 22 (MIN)' },
//   { id: 'p8', sleeperId: "6130", name: 'Josh Allen', position: 'QB', nflTeam: 'BUF', headshotUrl: 'https://picsum.photos/seed/p8/64/64', status: 'Healthy', projectedPoints: 28.2, actualPoints: 31.5, rosterPercentage: 99.9, startPercentage: 98.8, gameTime: 'Thu 8:15 PM', opponent: { team: '@NYJ', rank: 32 }, jerseyNumber: 17, posRank: 'QB2', avgPoints: 28.5, yearPoints: 456.0, seasonStats: { passingYards: 4500, passingTds: 35, interceptions: 14 }, weeklyProjection: { week: 1, passingYards: 300, passingTds: 3, interceptions: 1, fpts: 28.2 }, gameLog: generateGameLog('p8'), teamRanks: { 'OFFENSE': 1, 'PASS YD': 5, 'PASS ATT': 3, 'PASS TD': 2, 'TD': 1, 'RZ': 1, 'RZ %': 1 } },
//   { id: 'p28', sleeperId: "6794", name: 'Jalen Hurts', position: 'QB', nflTeam: 'PHI', headshotUrl: 'https://picsum.photos/seed/p28/64/64', status: 'Healthy', projectedPoints: 27.1, actualPoints: 26.5, rosterPercentage: 99.5, startPercentage: 97.0, gameTime: 'Sun 8:20 PM', opponent: { team: 'vs DAL', rank: 18 }, jerseyNumber: 1, posRank: 'QB4', avgPoints: 26.9, yearPoints: 430.4, seasonStats: { passingYards: 4000, passingTds: 28, interceptions: 10 }, weeklyProjection: { week: 1, passingYards: 260, passingTds: 2, interceptions: 1, fpts: 27.1 }, gameLog: generateGameLog('p28'), teamRanks: { 'OFFENSE': 4, 'PASS YD': 15, 'PASS ATT': 18, 'PASS TD': 11, 'TD': 3, 'RZ': 4, 'RZ %': 3 } },
// ];

// const userTeamRoster: Roster = {
//   starters: [
//     players.find(p => p.id === 'p1'), // QB: Patrick Mahomes
//     players.find(p => p.id === 'p2'), // RB: Christian McCaffrey
//     players.find(p => p.id === 'p6'), // RB: Austin Ekeler
//     players.find(p => p.id === 'p3'), // WR: Justin Jefferson
//     players.find(p => p.id === 'p5'), // WR: Tyreek Hill
//     players.find(p => p.id === 'p4'), // TE: Travis Kelce
//     players.find(p => p.id === 'p9'), // FLEX: Saquon Barkley
//     players.find(p => p.id === 'p13'), // DEF: 49ers
//     players.find(p => p.id === 'p12'), // K: Justin Tucker
//   ].filter((p): p is Player => p !== undefined),
//   bench: [
//       players.find(p => p.id === 'p15'),
//       players.find(p => p.id === 'p18'),
//       players.find(p => p.id === 'p20'),
//       players.find(p => p.id === 'p31'),
//       players.find(p => p.id === 'p40'),
//       players.find(p => p.id === 'p49'),
//   ].filter((p): p is Player => p !== undefined),
//   ir: [players.find(p => p.id === 'p11')].filter((p): p is Player => p !== undefined),
// };

// const opponentTeamRoster: Roster = {
//   starters: [
//     players.find(p => p.id === 'p8'),
//     players.find(p => p.id === 'p21'),
//     players.find(p => p.id === 'p22'),
//     players.find(p => p.id === 'p10'),
//     players.find(p => p.id === 'p20'),
//     players.find(p => p.id === 'p31'),
//     players.find(p => p.id === 'p19'),
//     players.find(p => p.id === 'p27'),
//     players.find(p => p.id === 'p26'),
//   ].filter((p): p is Player => p !== undefined),
//   bench: [
//     players.find(p => p.id === 'p28'),
//     players.find(p => p.id === 'p29'),
//     players.find(p => p.id === 'p30'),
//     players.find(p => p.id === 'p32'),
//     players.find(p => p.id === 'p41'),
//     players.find(p => p.id === 'p43'),
//   ].filter((p): p is Player => p !== undefined),
//   ir: [players.find(p => p.id === 'p24')].filter((p): p is Player => p !== undefined),
// };


// export const teams: Team[] = Array.from({ length: 12 }, (_, i) => ({
//     id: `t${i + 1}`,
//     name: `Team ${i + 1}`,
//     owner: `Manager ${i + 1}`,
//     logoUrl: `https://picsum.photos/seed/logo${i+1}/64/64`,
//     record: '0-0',
//     roster: i === 0 ? userTeamRoster : i === 1 ? opponentTeamRoster : { starters: Array(9).fill(null), bench: [], ir: [] },
//     leagueId: 'l1',
//     managerId: `user${i+1}`
// }));

// teams[0].managerId = 'user1'; // Assign a placeholder user to the first team.
// teams[0].owner = 'The User'; // Give it a clear name

// const sixPackTeams: Team[] = Array.from({ length: 6 }, (_, i) => ({
//     id: `sixpack-${i + 1}`,
//     name: `Six-Pack Team ${i + 1}`,
//     owner: `Manager ${i + 1}`,
//     logoUrl: `https://picsum.photos/seed/sixpack-logo${i+1}/64/64`,
//     record: '0-0',
//     roster: { starters: Array(9).fill(null), bench: [], ir: [] },
//     leagueId: 'l3',
//     managerId: `user-sixpack-${i+1}`
// }));



// NOW define leagues — using teams and sixPackTeams
// export const leagues: League[] = [
//   {
//     id: 'l1',
//     name: 'Pro Pundits League',
//     totalTeams: 12,
//     teams: teams,
//     ownerId: 'user1',
//     createdAt: new Date(),
//     rosterSettings: defaultRosterSettings,
//     draftDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Drafted 1 week ago
//   },
//   {
//     id: 'l2',
//     name: 'Weekend Warriors',
//     totalTeams: 10,
//     teams: teams.slice(0, 10),
//     ownerId: 'user2',
//     createdAt: new Date(),
//     rosterSettings: defaultRosterSettings,
//   },
//   {
//     id: 'l3',
//     name: 'The Six Pack',
//     totalTeams: 6,
//     teams: sixPackTeams,
//     draftDate: new Date(new Date().setDate(new Date().getDate() - 7)),
//     ownerId: 'user-sixpack-1',
//     createdAt: new Date(),
//     rosterSettings: defaultRosterSettings,
//   }
// ];

// NOW — after leagues is fully defined — compute rostered players
// const allRosteredPlayerIds = new Set<string>();

// leagues.forEach(league => {
//   league.teams?.forEach(team => {
//     const roster = team.roster;
//     roster.starters?.forEach(p => p && allRosteredPlayerIds.add(p.id));
//     roster.bench?.forEach(p => allRosteredPlayerIds.add(p.id));
//     roster.ir?.forEach(p => allRosteredPlayerIds.add(p.id));
//   });
// });

// export const availablePlayers: Player[] = players.filter(p => !allRosteredPlayerIds.has(p.id));

// Helper functions
// export const getPlayerById = (id: string) => players.find(p => p.id === id);
// export const getPlayersByTeam = (nflTeam: string) => players.filter(p => p.nflTeam === nflTeam);
// export const getLeagueById = (id: string) => leagues.find(l => l.id === id);
// export const getTeamById = (leagueId: string, teamId: string) => getLeagueById(leagueId)?.teams.find(t => t.id === teamId);
// export const getPlayers = () => players;