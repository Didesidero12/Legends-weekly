'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

import type { Player, Roster, League, Team, PositionSetting, ScoringSettings, ScoringSetting } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase/provider';

import { 
  collection, 
  doc, 
  onSnapshot, 
  getDocs, 
  updateDoc,
  writeBatch 
} from 'firebase/firestore';

import { getCurrentNFLWeek } from '@/lib/nfl-week';
import { fetchWeeklyPlayerStats, fetchAllPlayers, fetchNFLState } from '@/lib/sleeper-api';
import { calculateFantasyPoints } from '@/lib/scoring-calculator';




const defaultRosterSettings: PositionSetting[] = [
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

const initialPassingSettings: ScoringSetting[] = [
    { name: 'Passing Yards', abbr: 'PY', points: 0.04, enabled: true },
    { name: 'Passing TD', abbr: 'PTD', points: 4, enabled: true },
    { name: 'Interception', abbr: 'INT', points: -2, enabled: true },
    { name: 'Passing 2pt Conversion', abbr: '2PC', points: 2, enabled: true },
    { name: '300-399 Yard Game', abbr: 'P300', points: 1, enabled: false },
    { name: '400+ Yard Game', abbr: 'P400', points: 2, enabled: false },
    { name: 'Passing Attempts', abbr: 'PA', points: 0, enabled: false },
    { name: 'Completions', abbr: 'PC', points: 0, enabled: false },
    { name: 'Incompletions', abbr: 'INC', points: 0, enabled: false },
    { name: 'Sacked', abbr: 'SKD', points: -1, enabled: true },
];

const initialRushingSettings: ScoringSetting[] = [
    { name: 'Rushing Yards', abbr: 'RY', points: 0.1, enabled: true },
    { name: 'Rushing Attempts', abbr: 'RA', points: 0, enabled: false },
    { name: 'Rushing TD', abbr: 'RTD', points: 6, enabled: true },
    { name: 'Rushing 2pt Conversion', abbr: '2PR', points: 2, enabled: true },
    { name: '100-199 Yard Game', abbr: 'R100', points: 1, enabled: false },
    { name: '200+ Yard Game', abbr: 'R200', points: 2, enabled: false },
];

const initialReceivingSettings: ScoringSetting[] = [
    { name: 'Receiving Yards', abbr: 'REY', points: 0.1, enabled: true },
    { name: 'Receptions', abbr: 'REC', points: 1, enabled: true },
    { name: 'Receiving Targets', abbr: 'RET', points: 0, enabled: false },
    { name: 'Receiving TD', abbr: 'RETD', points: 6, enabled: true },
    { name: 'Receiving 2pt Conversion', abbr: '2PRE', points: 2, enabled: true },
    { name: '100-199 Yard Game', abbr: 'REY100', points: 1, enabled: false },
    { name: '200+ Yard Game', abbr: 'REY200', points: 2, enabled: false },
];

const initialKickingSettings: ScoringSetting[] = [
    { name: 'Each PAT Made', abbr: 'PAT', points: 1, enabled: true },
    { name: 'Each PAT Missed', abbr: 'PATM', points: -1, enabled: false },
    { name: 'FG Made (0-39 Yards)', abbr: 'FG0', points: 3, enabled: true },
    { name: 'FG Made (40-49 Yards)', abbr: 'FG40', points: 4, enabled: true },
    { name: 'FG Made (50-59 Yards)', abbr: 'FG50', points: 5, enabled: true },
    { name: 'FG Made (60+ Yards)', abbr: 'FG60', points: 6, enabled: true },
    { name: 'FG Missed (0-39 Yards)', abbr: 'FGM0', points: -2, enabled: false },
    { name: 'FG Missed (40-49 Yards)', abbr: 'FGM40', points: -1, enabled: false },
];

const initialDefenseSettings: ScoringSetting[] = [
    { name: 'Kickoff Return Yards', abbr: 'KR_DEF', points: 0, enabled: false },
    { name: 'Punt Return Yards', abbr: 'PR_DEF', points: 0, enabled: false },
    { name: 'Sacks', abbr: 'SK', points: 1, enabled: true },
    { name: 'Total Tackles', abbr: 'TK', points: 0, enabled: false },
    { name: 'Interception Return TD', abbr: 'INTTD', points: 6, enabled: true },
    { name: 'Fumble Return TD', abbr: 'FRTD', points: 6, enabled: true },
    { name: 'Kickoff Return TD', abbr: 'KRTD_DEF', points: 6, enabled: true },
    { name: 'Punt Return TD', abbr: 'PRTD_DEF', points: 6, enabled: true },
    { name: 'Blocked Punt Or FG Return For TD', abbr: 'BLKKRTD', points: 6, enabled: true },
    { name: 'Blocked Punt, PAT Or FG', abbr: 'BLKK', points: 2, enabled: true },
    { name: 'Each Interception', abbr: 'INT_DEF', points: 2, enabled: true },
    { name: 'Each Fumble Recovered', abbr: 'FR', points: 2, enabled: true },
    { name: 'Each Fumble Forced', abbr: 'FF', points: 1, enabled: false },
    { name: 'Each Safety', abbr: 'SF', points: 2, enabled: true },
    { name: 'Stuffs', abbr: 'STF', points: 1, enabled: false },
    { name: 'Passes Defensed', abbr: 'PD', points: 1, enabled: false },
    { name: '0 Points Allowed', abbr: 'PA0', points: 10, enabled: true },
    { name: '1-6 Points Allowed', abbr: 'PA1', points: 7, enabled: true },
    { name: '7-13 Points Allowed', abbr: 'PA7', points: 4, enabled: true },
    { name: '14-17 Points Allowed', abbr: 'PA14', points: 1, enabled: true },
    { name: '18-21 Points Allowed', abbr: 'PA18', points: 0, enabled: true },
    { name: '22-27 Points Allowed', abbr: 'PA22', points: -1, enabled: true },
    { name: '28-34 Points Allowed', abbr: 'PA28', points: -4, enabled: true },
    { name: '35-45 Points Allowed', abbr: 'PA35', points: -7, enabled: true },
    { name: '46+ Points Allowed', abbr: 'PA46', points: -10, enabled: true },
    { name: 'Less Than 100 Total Yards Allowed', abbr: 'YA100', points: 10, enabled: false },
    { name: '100-199 Total Yards Allowed', abbr: 'YA199', points: 7, enabled: false },
    { name: '200-299 Total Yards Allowed', abbr: 'YA299', points: 4, enabled: false },
    { name: '300-349 Total Yards Allowed', abbr: 'YA349', points: 2, enabled: false },
    { name: '350-399 Total Yards Allowed', abbr: 'YA399', points: 0, enabled: false },
    { name: '400-449 Total Yards Allowed', abbr: 'YA449', points: -2, enabled: false },
    { name: '450-499 Total Yards Allowed', abbr: 'YA499', points: -4, enabled: false },
    { name: '500-549 Total Yards Allowed', abbr: 'YA549', points: -6, enabled: false },
    { name: '550+ Total Yards Allowed', abbr: 'YA550', points: -8, enabled: false },
    { name: '2pt Return', abbr: '2PTRET', points: 2, enabled: true },
    { name: '1pt Safety', abbr: '1PSF', points: 1, enabled: true },
];

const initialMiscSettings: ScoringSetting[] = [
    { name: 'Kickoff Return Yards', abbr: 'KR', points: 0, enabled: false },
    { name: 'Punt Return Yards', abbr: 'PR', points: 0, enabled: false },
    { name: 'Kickoff Return TD', abbr: 'KRTD', points: 6, enabled: true },
    { name: 'Punt Return TD', abbr: 'PRTD', points: 6, enabled: true },
    { name: 'Fumble Recovered for TD', abbr: 'FRTD_MISC', points: 6, enabled: true },
    { name: 'Total Fumbles', abbr: 'FUM', points: 0, enabled: false },
    { name: 'Total Fumbles Lost', abbr: 'FUML', points: -2, enabled: true },
    { name: 'Interception Return TD', abbr: 'INTD', points: 6, enabled: true },
    { name: 'Blocked Punt Or FG Return For TD', abbr: 'BLKKRTD_MISC', points: 6, enabled: true },
    { name: '2pt Return', abbr: '2PTRET_MISC', points: 2, enabled: true },
    { name: '1pt Safety', abbr: '1PSF_MISC', points: 1, enabled: true },
];

const initialHeadCoachSettings: ScoringSetting[] = [
    { name: 'Team Win', abbr: 'TW', points: 3, enabled: true },
    { name: 'Team Loss', abbr: 'TL', points: -3, enabled: true },
    { name: 'Team Tie', abbr: 'TIE', points: 1, enabled: true },
    { name: 'Points Scored', abbr: 'PTS', points: 0.05, enabled: true },
    { name: '25+ Point Win Margin', abbr: 'WM25', points: 5, enabled: false },
    { name: '20-24 Point Win Margin', abbr: 'WM20', points: 4, enabled: false },
    { name: '15-19 Point Win Margin', abbr: 'WM15', points: 3, enabled: false },
    { name: '10-14 Point Win Margin', abbr: 'WM10', points: 2, enabled: false },
    { name: '5-9 Point Win Margin', abbr: 'WM5', points: 1, enabled: false },
    { name: '1-4 Point Win Margin', abbr: 'WM1', points: 0.5, enabled: false },
    { name: '1-4 Point Loss Margin', abbr: 'LM1', points: -0.5, enabled: false },
    { name: '5-9 Point Loss Margin', abbr: 'LM5', points: -1, enabled: false },
    { name: '10-14 Point Loss Margin', abbr: 'LM10', points: -2, enabled: false },
    { name: '15-19 Point Loss Margin', abbr: 'LM15', points: -3, enabled: false },
    { name: '20-24 Point Loss Margin', abbr: 'LM20', points: -4, enabled: false },
    { name: '25+ Point Loss Margin', abbr: 'LM25', points: -5, enabled: false },
];

const initialDefensivePlayerSettings: ScoringSetting[] = [
    { name: 'Sacks', abbr: 'SK_IDP', points: 1, enabled: true },
    { name: 'Total Tackles', abbr: 'TK_IDP', points: 0.5, enabled: true },
    { name: 'Blocked Punt, PAT Or FG', abbr: 'BLKK_IDP', points: 2, enabled: true },
    { name: 'Each Interception', abbr: 'INT_IDP', points: 3, enabled: true },
    { name: 'Each Fumble Recovered', abbr: 'FR_IDP', points: 2, enabled: true },
    { name: 'Each Fumble Forced', abbr: 'FF_IDP', points: 1, enabled: false },
    { name: 'Each Safety', abbr: 'SF_IDP', points: 2, enabled: true },
    { name: 'Assisted Tackles', abbr: 'TKA', points: 0.5, enabled: false },
    { name: 'Solo Tackles', abbr: 'TKS', points: 1, enabled: false },
    { name: 'Stuffs', abbr: 'STF_IDP', points: 1, enabled: false },
    { name: 'Passes Defensed', abbr: 'PD_IDP', points: 1, enabled: false },
];

const defaultScoringSettings: ScoringSettings = {
    Passing: initialPassingSettings,
    Rushing: initialRushingSettings,
    Receiving: initialReceivingSettings,
    Kicking: initialKickingSettings,
    'Team Defense / Special Teams': initialDefenseSettings,
    Miscellaneous: initialMiscSettings,
    'Defensive Players': initialDefensivePlayerSettings,
    'Head Coach': initialHeadCoachSettings,
    Punting: [],
};


type RosterContextType = {
  leagues: League[];
  teams: Team[]; 
  isLoading: boolean;
  setLeagues: (leagues: League[] | ((prev: League[]) => League[])) => void;
  availablePlayers?: Player[];
  setAvailablePlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  updateTeamRoster: (leagueId: string, teamId: string, newRoster: Roster) => void;
};

export const RosterContext = createContext<RosterContextType>({
  leagues: [],
  teams: [],
  isLoading: true,
  setLeagues: () => {},
  setAvailablePlayers: () => {},
  updateTeamRoster: () => {},
});

export const RosterProvider = ({ children }: { children: ReactNode }) => {
const db = useFirestore();  // ← This gives you the Firestore instance
const { user } = useUser();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [sleeperMasterPlayers, setSleeperMasterPlayers] = useState<Record<string, any> | null>(null);
  const [currentNFLWeek, setCurrentNFLWeek] = useState<number | null>(null);
  const [currentSeason, setCurrentSeason] = useState<number | null>(null);
  const [lastLoadedWeek, setLastLoadedWeek] = useState<number | null>(null);
  const [lastLoadedYear, setLastLoadedYear] = useState<number | null>(null);


useEffect(() => {
  const loadSleeperMaster = async () => {
    // Skip if already loaded
    if (sleeperMasterPlayers) return;

    try {
      console.log('Fetching Sleeper master player list...');
      const players = await fetchAllPlayers();
      setSleeperMasterPlayers(players);
      console.log(`Sleeper master list loaded: ${Object.keys(players).length} players`);
    } catch (err) {
      console.error('Failed to load Sleeper master players', err);
      // We can still run the app — mapping will just skip until next load
      setSleeperMasterPlayers({});
    }
  };

  loadSleeperMaster();
}, [sleeperMasterPlayers]); // Only run once, or if it fails and we retry

useEffect(() => {
  const loadNFLState = async () => {
    try {
      const state = await fetchNFLState();
      setCurrentNFLWeek(state.week);
      setCurrentSeason(parseInt(state.season));
      console.log(`NFL State: Week ${state.week}, Season ${state.season}`);
    } catch (err) {
      console.error('Failed to load NFL state, falling back to date calc');
      // Keep your existing getCurrentNFLWeek() as fallback
    }
  };

  loadNFLState();
}, []);

// ←←← REPLACE THE OLD MAPPING useEffect WITH THIS ONE ↓↓↓
useEffect(() => {
  if (!sleeperMasterPlayers || leagues.length === 0) return;

  // Quick guard: only run if there are players without sleeperId
  const needsMapping = leagues.some(league =>
    league.teams?.some(team =>
      [...(team.roster.starters || []), ...(team.roster.bench || []), ...(team.roster.ir || [])]
        .some(p => p && !p.sleeperId)
    )
  );

  if (!needsMapping) {
    console.log('All players already have sleeperIds — skipping mapping');
    return;
  }

  console.log('Running optimized sleeperId mapping + db persistence...');

  // Build fast lookup map: "patrick mahomes_qb_kc" → "4046"
  const playerMap = new Map<string, string>();
  Object.entries(sleeperMasterPlayers).forEach(([id, sPlayer]: [string, any]) => {
    if (!sPlayer.full_name || !sPlayer.position) return;

    const nameKey = sPlayer.full_name.toLowerCase();
    const posKey = sPlayer.position;
    const teamKey = (sPlayer.team || 'fa').toLowerCase(); // treat null team as 'fa'

    const mapKey = `${nameKey}_${posKey}_${teamKey}`;
    playerMap.set(mapKey, id);
  });

  let mappedCount = 0;
  const batch = writeBatch(db);

  const updatedLeagues = leagues.map(league => {
    const updatedTeams = (league.teams || []).map(team => {
      const updatePlayer = (p: Player | null): Player | null => {
        if (!p || p.sleeperId) return p; // Already has ID

        const nameKey = p.name.toLowerCase();
        const posKey = p.position;
        const teamKey = (p.nflTeam || 'FA').toLowerCase();

        const mapKey = `${nameKey}_${posKey}_${teamKey}`;
        const sleeperId = playerMap.get(mapKey);

        if (sleeperId) {
          mappedCount++;
          return { ...p, sleeperId };
        }

        // Warn on miss — we can fix these manually later
        console.warn(`No Sleeper match for: ${p.name} (${p.position}, ${p.nflTeam || 'FA'})`);
        return p;
      };

      const updatedRoster = {
        starters: team.roster.starters.map(updatePlayer),
        bench: team.roster.bench.map(updatePlayer),
        ir: team.roster.ir.map(updatePlayer),
      };

      // If any player changed, batch update the team doc
      if (updatedRoster !== team.roster) {
        const teamRef = doc(db, 'leagues', league.id, 'teams', team.id);
        batch.update(teamRef, { roster: updatedRoster });
      }

      return { ...team, roster: updatedRoster };
    });

    return { ...league, teams: updatedTeams };
  });

  // Commit batch and update local state
  Promise.all([
    batch.commit().catch(err => console.error('Batch write failed:', err)),
    setLeagues(updatedLeagues)
  ]).then(() => {
    console.log(`✅ Mapped ${mappedCount} players to sleeperIds and saved to db!`);
  });

}, [sleeperMasterPlayers, leagues]);

  // ←←← REPLACE THE WHOLE loadRealStats useEffect WITH THIS ↓↓↓
  useEffect(() => {
    if (leagues.length === 0) return;

    const currentWeek = getCurrentNFLWeek();
    const currentYear = new Date().getFullYear();

    // Prevent running multiple times for the same week
    if (lastLoadedWeek === currentWeek && lastLoadedYear === currentYear) {
      return;
    }

    const loadRealStats = async () => {
      try {
        console.log(`Fetching Sleeper stats for ${currentYear} Week ${currentWeek}`);
        const stats = await fetchWeeklyPlayerStats(currentYear, currentWeek);

        const updatedLeagues = leagues.map(league => {
          const updatedTeams = league.teams?.map(team => {
            const updateRosterArray = (arr: (Player | null)[]) => 
              arr.map(p => p ? updatePlayerPoints(p, stats, league.scoringSettings) : null);

            const updatedRoster = {
              starters: updateRosterArray(team.roster.starters),
              bench: updateRosterArray(team.roster.bench),
              ir: updateRosterArray(team.roster.ir),
            };

            return { ...team, roster: updatedRoster };
          }) || [];

          return { ...league, teams: updatedTeams };
        });

        setLeagues(updatedLeagues);
        setLastLoadedWeek(currentWeek);
        setLastLoadedYear(currentYear);
        console.log("Real stats loaded and points calculated");
      } catch (err) {
        console.error("Failed to load real stats:", err);
      }
    };

    loadRealStats();
  }, [leagues]); // Keep [leagues]—the guard above prevents the loop

const updatePlayerPoints = (player: Player, stats: any, scoringSettings: ScoringSettings) => {
  const playerStats = stats[player.sleeperId || player.id]; // Use sleeperId if you have it
  if (playerStats) {
    const points = calculateFantasyPoints(player, playerStats, scoringSettings);
    return { ...player, actualPoints: points };
  }
  return player;
};

useEffect(() => {
  if (!db || leagues.length === 0) return;

  const unsubscribes: (() => void)[] = [];

  leagues.forEach((league) => {
    if (!league.id) return; // Safety

    // Add this guard
    if (!db) return;

    const rosteredRef = collection(db, `leagues/${league.id}/rosteredPlayers`);

    const unsubscribe = onSnapshot(rosteredRef, (snapshot) => {
      const rosteredIds = new Set(snapshot.docs.map((doc) => doc.id));

      setAvailablePlayers((prev) => {
        if (!prev) return prev;
        return prev.filter((p) => !rosteredIds.has(p.id));
      });
    });

    unsubscribes.push(unsubscribe);
  });

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}, [db, leagues]);

useEffect(() => {
  if (!db) {
    // No Firestore — nothing to do (we'll rely on real fetch later)
    setIsLoading(false);
    return;
  }

  setIsLoading(true);

  const leaguesRef = collection(db, 'leagues');
  const unsubscribe = onSnapshot(leaguesRef, async (snapshot) => {
    const leaguesData: League[] = [];

    for (const leagueDoc of snapshot.docs) {
      const leagueData = leagueDoc.data() as Omit<League, 'id' | 'teams'>;
      const leagueId = leagueDoc.id;

      const teamsRef = collection(db, `leagues/${leagueId}/teams`);
      const teamsSnapshot = await getDocs(teamsRef);
      const teamsData = teamsSnapshot.docs.map(teamDoc => ({
        id: teamDoc.id,
        leagueId,
        ...teamDoc.data()
      } as Team));

      leaguesData.push({
        id: leagueId,
        ...leagueData,
        teams: teamsData,
        rosterSettings: leagueData.rosterSettings || defaultRosterSettings,
        scoringSettings: leagueData.scoringSettings || defaultScoringSettings,
      } as League);
    }

    setLeagues(leaguesData);
    setIsLoading(false);
    console.log("Live leagues loaded from Firestore:", leaguesData);
  }, (error) => {
    console.error("Firestore error:", error);
    setIsLoading(false);
    // No mock fallback anymore
  });

  return () => unsubscribe();
}, [db]);

useEffect(() => {
  const loadRealAvailablePlayers = async () => {
    if (leagues.length === 0) return;

    try {
      // Check cache first
      const cached = localStorage.getItem('legendsWeeklyPlayers');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 6 * 60 * 60 * 1000) { // 6 hours
          setAvailablePlayers(data);
          console.log('Loaded players from cache — instant!');
          return;
        }
      }

      console.log('Fetching fresh players from Sleeper...');
      const allPlayers = await fetchAllPlayers();
      // Get all rostered sleeperIds across all leagues
      const rosteredSleeperIds = new Set<string>();
      leagues.forEach(league => {
        league.teams?.forEach(team => {
          [...team.roster.starters, ...team.roster.bench, ...team.roster.ir]
            .filter((p): p is Player => !!p && !!p.sleeperId)
            .forEach(p => rosteredSleeperIds.add(p.sleeperId));
        });
      });

// Build real player list — map Sleeper positions + block junk
      const positionMap: Record<string, string> = {
        'DEF': 'D/ST',  // Sleeper defense → your 'D/ST'
        'DST': 'D/ST',  // Just in case
        'K': 'K',
        'QB': 'QB',
        'RB': 'RB',
        'WR': 'WR',
        'TE': 'TE',
      };

      const realPlayers: Player[] = Object.entries(allPlayers)
        .filter(([_, p]: [string, any]) => {
          if (!p.active || !p.position) return false;

          // Add this log to see if defense players are being processed
          if (p.position === 'DEF' || p.position === 'DST') {
            console.log('Defense player found:', p.full_name, p.team, p.position, 'active:', p.active);
          }

          // Rest of your filter logic...
          const junkPositions = [
            'C', 'G', 'T', 'OT', 'OG', 'OL', 'LS', 'P',
            'DT', 'DE', 'NT', 'LB', 'MLB', 'OLB', 'CB', 'DB', 'FS', 'SS', 'S',
            'FB', 'HB',
          ];

          if (junkPositions.includes(p.position)) return false;

          const mappedPosition = positionMap[p.position] || p.position;

          const currentLeague = leagues[0];
          if (!currentLeague?.rosterSettings) return false;

          const positionSetting = currentLeague.rosterSettings.find(
            s => s.abbr === mappedPosition
          );

          if (positionSetting && (positionSetting.starters > 0 || positionSetting.max > 0)) {
            return true;
          }

          if (['RB', 'WR', 'TE'].includes(p.position)) {
            const hasFlex = currentLeague.rosterSettings.some(
              s => s.abbr === 'FLEX' && (s.starters > 0 || s.max > 0)
            );
            if (hasFlex) return true;
          }

          return false;
        })
        .map(([sleeperId, p]: [string, any]) => ({
          id: sleeperId,
          sleeperId,
          name: p.full_name || `${p.first_name} ${p.last_name}`,
          position: positionMap[p.position] || p.position, // Now positionMap is in scope
          nflTeam: p.team || 'FA',
          headshotUrl: `https://sleepercdn.com/content/nfl/players/thumb/${sleeperId}.jpg`,
          status: 'Healthy',
          projectedPoints: 0,
          actualPoints: 0,
          rosterPercentage: Math.round(p.roster_percentage || 0),
          startPercentage: Math.round(p.start_percentage || 0),
          jerseyNumber: p.number || 0,
          posRank: `${positionMap[p.position] || p.position}${p.position_rank || ''}`,
          avgPoints: 0,
          yearPoints: 0,
          news: [],
          weeklyProjection: { week: 1, fpts: 0 },
          gameLog: [],
          odds: {},
          teamRanks: {},
          heightWeight: p.height && p.weight ? `${p.height}" / ${p.weight} lbs` : '',
          birthplace: p.birth_city || '',
          experience: p.years_exp ? `${p.years_exp + 1}th season` : '',
          college: p.college || '',
          draftInfo: '',
        }));

const available = realPlayers.filter(p => !rosteredSleeperIds.has(p.sleeperId));

      setAvailablePlayers(available);

      // Cache for next load
      localStorage.setItem('legendsWeeklyPlayers', JSON.stringify({
        data: available,
        timestamp: Date.now()
      }));

      console.log(`Loaded & cached ${available.length} real players`);
    } catch (err) {
      console.error('Player load failed', err);
    }
  };

  loadRealAvailablePlayers();
}, [leagues]);

const updateTeamRoster = async (leagueId: string, teamId: string, newRoster: Roster) => {
  // Update local context using functional update
  setLeagues((prevLeagues) => {
    const updatedLeagues = prevLeagues.map((league) => {
      if (league.id === leagueId) {
        const newTeams = (league.teams || []).map((team) => {
          if (team.id === teamId) {
            return { ...team, roster: newRoster };
          }
          return team;
        });
        return { ...league, teams: newTeams };
      }
      return league;
    });

    return updatedLeagues;
  });

  // Save to Firestore
  if (db) {
    try {
      const teamRef = doc(db, 'leagues', leagueId, 'teams', teamId);
      await updateDoc(teamRef, { roster: newRoster });
      console.log("Roster saved to Firestore");
    } catch (err) {
      console.error("Failed to save roster to Firestore", err);
    }
  }
};
  
const contextValue = useMemo(() => {
  // Flatten all teams from all leagues for easy access
  const allTeams = leagues.flatMap(league => league.teams || []);

  // Fallback to mock if no live data (for offline testing or demo)
  // const fallbackLeagues = leagues.length === 0 ? mockLeagues.map(l => ({
  //   ...l,
  //   teams: mockTeams.filter((t: any) => t.leagueId === l.id),
  // })) : leagues;

  // const fallbackTeams = allTeams.length === 0 ? mockTeams : allTeams;

return {
  leagues,
  teams: allTeams,
  isLoading,
  setLeagues,
  availablePlayers,
  setAvailablePlayers,
  updateTeamRoster,
};
}, [leagues, isLoading, availablePlayers]); 

return (
  <RosterContext.Provider value={contextValue}>
    {children}
  </RosterContext.Provider>
);
}
