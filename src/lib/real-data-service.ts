import type { Player, GameLogEntry, League, Team } from '@/lib/types';
import { fetchAllPlayers, fetchWeeklyPlayerStats } from '@/lib/sleeper-api';
import { calculateFantasyPoints } from '@/lib/scoring-calculator';

export async function getPlayers(): Promise<Player[]> {
  const data = await fetchAllPlayers();
  return Object.values(data).map((p: any) => ({
    id: p.player_id,
    sleeperId: p.player_id,
    name: p.full_name,
    position: p.position,
    nflTeam: p.team,
    headshotUrl: p.fantasy_data_id ? `https://sleepercdn.com/images/players/${p.fantasy_data_id}.jpg` : 'https://picsum.photos/64/64',
    status: p.status || 'Healthy',
    projectedPoints: 0, // Can fetch projections later
    actualPoints: 0,
    rosterPercentage: 0, // Can add later from external source
    startPercentage: 0,
    jerseyNumber: p.number,
    posRank: p.fantasy_positions?.[0] ? p.fantasy_positions[0] + '1' : 'N/A',
    avgPoints: 0,
    yearPoints: 0,
    news: [], // Can add from search tool later
    seasonStats: {}, // Fill later
    weeklyProjection: { week: 1, fpts: 0 }, // Stub
    gameLog: [], // We'll fill in detail page
    odds: {}, // Stub
    teamRanks: {}, // Stub
    heightWeight: p.height + '", ' + p.weight + ' lbs',
    birthplace: p.birth_state,
    experience: p.years_exp + 'th season',
    college: p.college,
    draftInfo: p.draft_round + ' Rd, ' + p.draft_position + ' (team)',
  } as Player);
}

export async function getPlayerGameLog(player: Player, league: League, year: number, currentWeek: number): Promise<GameLogEntry[]> {
  const gameLog: GameLogEntry[] = [];

  for (let week = 1; week <= currentWeek; week++) {
    const stats = await fetchWeeklyPlayerStats(year, week);
    console.log(`Week ${week}: Stats keys count:`, Object.keys(stats).length);
    console.log(`Week ${week}: Sample keys:`, Object.keys(stats).slice(0, 10));
    console.log(`Week ${week}: API response status:`, response.status);
    console.log(`Week ${week}: API data type:`, typeof data);

    let playerStats = stats[player.sleeperId] || stats[player.sleeperId.toString()];

    if (!playerStats) {
      // Fallback to nested lookup (sometimes player_id inside stat object)
      playerStats = Object.values(stats).find((s: any) => s.player_id === player.sleeperId || s.player_id === player.sleeperId.toString());
    }

    console.log(`Week ${week}: playerStats for ${player.sleeperId}:`, playerStats ? 'FOUND' : 'NOT FOUND');

    const entry: GameLogEntry = {
      week,
      opponent: playerStats?.opp || 'BYE',
      gameResult: undefined,
      teamScore: undefined,
      opponentScore: undefined,
      fpts: playerStats ? calculateFantasyPoints(player, mapSleeperStatsToGameLog(playerStats), league.scoringSettings) : undefined,
      ...mapSleeperStatsToGameLog(playerStats || {}),
    };

    gameLog.push(entry);
  }

  return gameLog.reverse();
}

// Stub for leagues/teams — we can add live Sleeper league fetch later
export async function getLeagues(): Promise<League[]> {
  // Use Firestore or live Sleeper
  return []; // Stub
}

export async function getTeams(leagueId: string): Promise<Team[]> {
  // Use Firestore or live Sleeper
  return []; // Stub
}