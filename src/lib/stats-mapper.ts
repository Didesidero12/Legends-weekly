// src/lib/stats-mapper.ts
import type { GameLogEntry } from '@/lib/types';

export function mapSleeperStatsToGameLog(sleeperStats: any): Partial<GameLogEntry> {
  if (!sleeperStats) return {};

  return {
    passingAttempts: sleeperStats.pass_att,
    completions: sleeperStats.pass_cmp,
    passingYards: sleeperStats.pass_yd,
    passingTds: sleeperStats.pass_td,
    interceptions: sleeperStats.pass_int,
    sacksTaken: sleeperStats.pass_sack,
    rushingAttempts: sleeperStats.rush_att,
    rushingYards: sleeperStats.rush_yd,
    rushingTds: sleeperStats.rush_td,
    targets: sleeperStats.rec_tgt,
    receptions: sleeperStats.rec,
    receivingYards: sleeperStats.rec_yd,
    receivingTds: sleeperStats.rec_td,
    fumbles: sleeperStats.fum,
    fumblesLost: sleeperStats.fum_lost,
    fumbleRecoveries: sleeperStats.fum_rec,
    fgm: sleeperStats.fg_made,
    fga: sleeperStats.fg_att,
    xpm: sleeperStats.xp_made,
    pointsAgainst: sleeperStats.pts_allow,
    sacks: sleeperStats.def_sack,
    defensiveInts: sleeperStats.def_int,
    defensiveFumbleRecoveries: sleeperStats.def_fum_rec,
    safeties: sleeperStats.def_safe,
    defensiveTds: sleeperStats.def_td,
    returnTds: sleeperStats.ret_td,
    blockedKicks: sleeperStats.def_blk_kick,
    opponent: sleeperStats.opp,
  };
}