

export type NewsItem = {
  date: string;
  headline: string;
  source: string;
};

export type GameLogEntry = {
    week: number;
    opponent: string;
    gameResult?: 'W' | 'L' | 'T';
    teamScore?: number;
    opponentScore?: number;
    fpts?: number;
    // Passing
    passingAttempts?: number;
    completions?: number;
    incompletePasses?: number;
    passingYards?: number;
    passingTds?: number;
    interceptions?: number;
    sacksTaken?: number;
    passing2pt?: number;

    // Rushing
    rushingAttempts?: number;
    rushingYards?: number;
    rushingTds?: number;
    rushing2pt?: number;

    // Receiving
    receptions?: number;
    targets?: number;
    receivingYards?: number;
    receivingTds?: number;
    receiving2pt?: number;
    
    // Fumbles
    fumbles?: number;
    fumblesLost?: number;
    fumbleRecoveries?: number;

    // Kicking
    fgm?: number;
    fga?: number;
    fgm0_39?: number;
    fgm40_49?: number;
    fgm50_59?: number;
    fgm60_plus?: number;
    fgmiss0_39?: number;
    fgmiss40_49?: number;
    xpm?: number;
    xpa?: number;
    xpmiss?: number;

    // Defense & ST
    pointsAgainst?: number;
    yardsAllowed?: number;
    sacks?: number;
    defensiveInts?: number;
    defensiveFumbleRecoveries?: number;
    safeties?: number;
    defensiveTds?: number;
    returnTds?: number;
    blockedKicks?: number;

    // Punting
    netPunts?: number;
    puntYards?: number;
    puntsInside10?: number;
    puntsInside20?: number;
    blockedPunts?: number;
    puntsReturned?: number;
    puntReturnYards?: number;
    puntTouchbacks?: number;
    puntFairCatches?: number;
    
    // Individual Defensive Player
    soloTackles?: number;
    assistedTackles?: number;
    tacklesForLoss?: number; // "Stuffs"
    passesDefensed?: number;
    fumblesForced?: number;

    // Return Yardage (for individual players)
    kickReturnYards?: number;
    puntReturnYardsPlayer?: number;
};

export type PlayerOdds = {
  game: {
    homeTeam: string;
    awayTeam: string;
    moneyline: { home: number; away: number };
    spread: { team: string; value: number; price: number };
    total: { over: number; under: number };
  };
  props: {
    name: string;
    value: string;
  }[];
};

export type PlayerTeamRanks = {
    [key: string]: number;
}


export type Player = {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'K' | 'DEF' | 'DT' | 'DE' | 'LB' | 'DL' | 'CB' | 'S' | 'DB' | 'DP' | 'P' | 'HC';
  nflTeam: string;
  headshotUrl: string;
  status: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out' | 'IR' | 'Bye';
  projectedPoints: number;
  actualPoints: number;
  rosterPercentage: number;
  startPercentage: number;
  gameTime: string;
  opponent: {
    team: string;
    rank: number;
  };
  jerseyNumber: number;
  posRank: string;
  avgPoints: number;
  yearPoints: number;
  isLegendary?: boolean;
  news?: NewsItem[];
  odds?: PlayerOdds;
  teamRanks?: PlayerTeamRanks;
  heightWeight?: string;
  birthplace?: string;
  experience?: string;
  college?: string;
  draftInfo?: string;
  seasonStats: {
    passingYards?: number;
    passingTds?: number;
    interceptions?: number;
    rushingAttempts?: number;
    rushingYards?: number;
    rushingTds?: number;
    receptions?: number;
    targets?: number;
    receivingYards?: number;
    receivingTds?: number;
    pointsAgainst?: number;
    fumbleRecoveries?: number;
    sacks?: number;
    touchdowns?: number;
    fgm?: number;
    fga?: number;
    xpm?: number;
  };
  weeklyProjection: {
    week: number;
    passingYards?: number;
    passingTds?: number;
    interceptions?: number;
    rushingAttempts?: number;
    rushingYards?: number;
    rushingTds?: number;
    receptions?: number;
    targets?: number;
    receivingYards?: number;
    receivingTds?: number;
    fpts: number;
    pointsAgainst?: number;
    fumbleRecoveries?: number;
    sacks?: number;
    touchdowns?: number;
    fgm?: number;
    fga?: number;
    xpm?: number;
  };
  gameLog?: GameLogEntry[];
};

export type RosterSlot = Player | null;

export type Roster = {
  starters: RosterSlot[];
  bench: Player[];
  ir: Player[];
};

export interface Team {
    id: string;
    name: string;
    owner: string | null;
    logoUrl: string;
    record: string;
    roster: Roster;
    leagueId: string;
    managerId: string | null;
}

export type PositionSetting = {
  name: string;
  abbr: string;
  starters: number;
  max: number;
};

export type ScoringSetting = {
    name: string;
    abbr: string;
    points: number;
    enabled: boolean;
}

export type ScoringSettings = {
    Passing: ScoringSetting[];
    Rushing: ScoringSetting[];
    Receiving: ScoringSetting[];
    Kicking: ScoringSetting[];
    'Team Defense / Special Teams': ScoringSetting[];
    Miscellaneous: ScoringSetting[];
    'Defensive Players': ScoringSetting[];
    'Head Coach': ScoringSetting[];
    Punting: ScoringSetting[];
};

export type CardTier = 'Legendary' | 'Epic' | 'Rare' | 'Common';

export interface LegendaryCard {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  tier: CardTier;
  historicalWeek: number;
  historicalYear: number;
  status: 'unplayed' | 'pending' | 'played';
  playedWeek?: number;
  pendingSlotId?: string;
}

export type CardSettings = {
    mechanic: string;
    playoffBonus: boolean;
}


export interface League {
    id: string;
    name: string;
    totalTeams: number;
    teams?: Team[]; // Teams might be loaded separately
    draftDate?: string | Date;
    ownerId: string;
    createdAt: any; // serverTimestamp
    rosterSettings: PositionSetting[];
    scoringSettings: ScoringSettings;
    cardSettings?: CardSettings;
    inviteCode?: string;
}

export type Matchup = {
    week: number;
    userTeam: Team;
    opponentTeam: Team;
};
