

import type { Player, ScoringSettings, GameLogEntry } from './types';

export function calculateFantasyPoints(player: Player, game: GameLogEntry, settings: ScoringSettings): number {
    let totalPoints = 0;

    const findSetting = (category: keyof ScoringSettings, abbr: string) => {
        const cat = settings[category];
        if (!cat) return undefined;
        return cat.find(s => s.abbr === abbr);
    };

    const addPoints = (category: keyof ScoringSettings, abbr: string, value?: number) => {
        if (value === undefined || value === null) return;
        const setting = findSetting(category, abbr);
        if (setting && setting.enabled) {
            totalPoints += value * setting.points;
        }
    };
    
    // Head Coach Scoring
    if (player.position === 'HC') {
        if (game.gameResult === 'W') addPoints('Head Coach', 'TW', 1);
        if (game.gameResult === 'L') addPoints('Head Coach', 'TL', 1);
        if (game.gameResult === 'T') addPoints('Head Coach', 'TIE', 1);
        
        if (game.teamScore !== undefined && game.opponentScore !== undefined) {
             addPoints('Head Coach', 'PTS', game.teamScore);
             const margin = game.teamScore - game.opponentScore;
             if(margin >= 25) addPoints('Head Coach', 'WM25', 1);
             else if (margin >= 20) addPoints('Head Coach', 'WM20', 1);
             else if (margin >= 15) addPoints('Head Coach', 'WM15', 1);
             else if (margin >= 10) addPoints('Head Coach', 'WM10', 1);
             else if (margin >= 5) addPoints('Head Coach', 'WM5', 1);
             else if (margin >= 1) addPoints('Head Coach', 'WM1', 1);
             else if (margin <= -25) addPoints('Head Coach', 'LM25', 1);
             else if (margin <= -20) addPoints('Head Coach', 'LM20', 1);
             else if (margin <= -15) addPoints('Head Coach', 'LM15', 1);
             else if (margin <= -10) addPoints('Head Coach', 'LM10', 1);
             else if (margin <= -5) addPoints('Head Coach', 'LM5', 1);
             else if (margin <= -1) addPoints('Head Coach', 'LM1', 1);
        }
        return parseFloat(totalPoints.toFixed(2));
    }


  // Passing — you already have this, keep all
addPoints('Passing', 'PY', game.passingYards);
addPoints('Passing', 'PA', game.passingAttempts);
addPoints('Passing', 'PC', game.completions);
addPoints('Passing', 'INC', game.incompletePasses);
addPoints('Passing', 'PTD', game.passingTds);
addPoints('Passing', 'INT', game.interceptions);
addPoints('Passing', '2PC', game.passing2pt);
addPoints('Passing', 'SKD', game.sacksTaken);
// ADD THESE TWO (for bonus tiers)
addPoints('Passing', 'P300', game.passingYards >= 300 && game.passingYards <= 399 ? 1 : 0);
addPoints('Passing', 'P400', game.passingYards >= 400 ? 1 : 0);


// Rushing — keep all
addPoints('Rushing', 'RY', game.rushingYards);
addPoints('Rushing', 'RA', game.rushingAttempts);
addPoints('Rushing', 'RTD', game.rushingTds);
addPoints('Rushing', '2PR', game.rushing2pt);
// ADD THESE TWO
addPoints('Rushing', 'R100', game.rushingYards >= 100 && game.rushingYards <= 199 ? 1 : 0);
addPoints('Rushing', 'R200', game.rushingYards >= 200 ? 1 : 0);

// Receiving — keep all
addPoints('Receiving', 'REY', game.receivingYards);
addPoints('Receiving', 'REC', game.receptions);
addPoints('Receiving', 'RET', game.targets);
addPoints('Receiving', 'RETD', game.receivingTds);
addPoints('Receiving', '2PRE', game.receiving2pt);
// ADD THESE TWO
addPoints('Receiving', 'REY100', game.receivingYards >= 100 && game.receivingYards <= 199 ? 1 : 0);
addPoints('Receiving', 'REY200', game.receivingYards >= 200 ? 1 : 0);

    // Miscellaneous / Fumbles
    addPoints('Miscellaneous', 'FUM', game.fumbles);
    addPoints('Miscellaneous', 'FUML', game.fumblesLost);
    addPoints('Miscellaneous', 'FRTD_MISC', game.fumbleRecoveries); // Simplified
    addPoints('Miscellaneous', 'KR', game.kickReturnYards);
    addPoints('Miscellaneous', 'PR', game.puntReturnYardsPlayer);

    // Kicking
    addPoints('Kicking', 'PAT', game.xpm);
    addPoints('Kicking', 'PATA', game.xpa);
    addPoints('Kicking', 'PATM', game.xpmiss);
    addPoints('Kicking', 'FG0', game.fgm0_39);
    addPoints('Kicking', 'FG40', game.fgm40_49);
    addPoints('Kicking', 'FG50', game.fgm50_59);
    addPoints('Kicking', 'FG60', game.fgm60_plus);
    addPoints('Kicking', 'FGM0', game.fgmiss0_39);
    addPoints('Kicking', 'FGM40', game.fgmiss40_49);

    // Team Defense
    addPoints('Team Defense / Special Teams', 'SK', game.sacks);
    addPoints('Team Defense / Special Teams', 'INT_DEF', game.defensiveInts);
    addPoints('Team Defense / Special Teams', 'FR', game.defensiveFumbleRecoveries);
    addPoints('Team Defense / Special Teams', 'SF', game.safeties);
    addPoints('Team Defense / Special Teams', 'INTTD', game.defensiveTds);
    addPoints('Team Defense / Special Teams', 'FRTD', game.defensiveTds); // Simplified
    addPoints('Team Defense / Special Teams', 'KRTD_DEF', game.returnTds);
    addPoints('Team Defense / Special Teams', 'PRTD_DEF', game.returnTds);
    addPoints('Team Defense / Special Teams', 'BLKK', game.blockedKicks);
    addPoints('Team Defense / Special Teams', 'FF', game.fumblesForced);
addPoints('Team Defense / Special Teams', 'TK', game.tackles);
addPoints('Team Defense / Special Teams', 'STF', game.tacklesForLoss);
addPoints('Team Defense / Special Teams', 'PD', game.passesDefensed);

    const pa = game.pointsAgainst;
    if (pa !== undefined) {
        if (pa === 0) addPoints('Team Defense / Special Teams', 'PA0', 1);
        else if (pa >= 1 && pa <= 6) addPoints('Team Defense / Special Teams', 'PA1', 1);
        else if (pa >= 7 && pa <= 13) addPoints('Team Defense / Special Teams', 'PA7', 1);
        else if (pa >= 14 && pa <= 17) addPoints('Team Defense / Special Teams', 'PA14', 1);
        else if (pa >= 18 && pa <= 21) addPoints('Team Defense / Special Teams', 'PA18', 1);
        else if (pa >= 22 && pa <= 27) addPoints('Team Defense / Special Teams', 'PA22', 1);
        else if (pa >= 28 && pa <= 34) addPoints('Team Defense / Special Teams', 'PA28', 1);
        else if (pa >= 35 && pa <= 45) addPoints('Team Defense / Special Teams', 'PA35', 1);
        else if (pa >= 46) addPoints('Team Defense / Special Teams', 'PA46', 1);
    }
    
    const ya = game.yardsAllowed;
    if (ya !== undefined) {
        if (ya < 100) addPoints('Team Defense / Special Teams', 'YA100', 1);
        else if (ya >= 100 && ya <= 199) addPoints('Team Defense / Special Teams', 'YA199', 1);
        else if (ya >= 200 && ya <= 299) addPoints('Team Defense / Special Teams', 'YA299', 1);
        else if (ya >= 300 && ya <= 349) addPoints('Team Defense / Special Teams', 'YA349', 1);
        else if (ya >= 350 && ya <= 399) addPoints('Team Defense / Special Teams', 'YA399', 1);
        else if (ya >= 400 && ya <= 449) addPoints('Team Defense / Special Teams', 'YA449', 1);
        else if (ya >= 450 && ya <= 499) addPoints('Team Defense / Special Teams', 'YA499', 1);
        else if (ya >= 500 && ya <= 549) addPoints('Team Defense / Special Teams', 'YA549', 1);
        else if (ya >= 550) addPoints('Team Defense / Special Teams', 'YA550', 1);
    }

    // Individual Defensive Player
    addPoints('Defensive Players', 'SK_IDP', game.sacks);
    addPoints('Defensive Players', 'TKS', game.soloTackles);
    addPoints('Defensive Players', 'TKA', game.assistedTackles);
    if (game.soloTackles !== undefined && game.assistedTackles !== undefined) {
        addPoints('Defensive Players', 'TK_IDP', game.soloTackles + game.assistedTackles);
    }
    addPoints('Defensive Players', 'BLKK_IDP', game.blockedKicks);
    addPoints('Defensive Players', 'INT_IDP', game.defensiveInts);
    addPoints('Defensive Players', 'FR_IDP', game.defensiveFumbleRecoveries);
    addPoints('Defensive Players', 'FF_IDP', game.fumblesForced);
    addPoints('Defensive Players', 'SF_IDP', game.safeties);
    addPoints('Defensive Players', 'STF_IDP', game.tacklesForLoss);
    addPoints('Defensive Players', 'PD_IDP', game.passesDefensed);

    return parseFloat(totalPoints.toFixed(2));
}
