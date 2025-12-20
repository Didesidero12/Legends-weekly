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
    const playerStats = stats[player.sleeperId];

    if (playerStats) {
      const entry: GameLogEntry = {
        week,
        opponent: 'TBD', 
        fpts: 0,
        passingAttempts: playerStats.pass_att,
        completions: playerStats.pass_cmp,
        incompletePasses: playerStats.pass_att - playerStats.pass_cmp,
        passingYards: playerStats.pass_yd,
        passingTds: playerStats.pass_td,
        interceptions: playerStats.pass_int,
        sacksTaken: playerStats.pass_sack,
        passing2pt: playerStats.pass_2pt,

        rushingAttempts: playerStats.rush_att,
        rushingYards: playerStats.rush_yd,
        rushingTds: playerStats.rush_td,
        rushing2pt: playerStats.rush_2pt,

        targets: playerStats.rec_tgt,
        receptions: playerStats.rec,
        receivingYards: playerStats.rec_yd,
        receivingTds: playerStats.rec_td,
        receiving2pt: playerStats.rec_2pt,

        fumbles: playerStats.fum,
        fumblesLost: playerStats.fum_lost,
        fumbleRecoveries: playerStats.fum_rec,

        // Kicking, Defense, etc. as needed
      };

      entry.fpts = calculateFantasyPoints(player, entry, league.scoringSettings);
      gameLog.push(entry);
    } else {
      gameLog.push({
        week,
        opponent: 'BYE or DNP',
        fpts: 0,
      } as GameLogEntry);
    }
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