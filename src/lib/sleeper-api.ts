// src/lib/sleeper-api.ts

export async function fetchWeeklyPlayerStats(season: number, week: number) {
  const response = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchWeeklyProjections(season: number, week: number) {
  const response = await fetch(`https://api.sleeper.app/v1/projections/nfl/${season}/${week}?season_type=regular`);
  if (!response.ok) {
    throw new Error(`Sleeper projections API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchAllPlayers() {
  const response = await fetch('https://api.sleeper.app/v1/players/nfl');
  if (!response.ok) {
    throw new Error(`Failed to fetch Sleeper players: ${response.status}`);
  }
  return await response.json(); // { [sleeperId: string]: { full_name, position, team, etc. } }
}

// Optional helper — keep it, we'll use it later for player ID mapping
export async function fetchLeaguePlayers(leagueId: string) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league rosters: ${response.status}`);
  }
  const data = await response.json();
  const playerIds = data.flatMap((roster: any) => roster.players || []);
  return [...new Set(playerIds)]; // dedupe
}

export async function fetchNFLState() {
  const response = await fetch('https://api.sleeper.app/v1/state/nfl');
  if (!response.ok) {
    throw new Error(`Failed to fetch NFL state: ${response.status}`);
  }
  return await response.json();
}

export async function fetchNFLPlayerStats(playerId: string, season: number) {
  // playerId is NFL GSIS ID — we can map Sleeper ID to GSIS ID from Sleeper master
  // But for now, hardcode Mahomes GSIS ID for test: "00-0033873"
  const gsisId = "00-0033873"; // Mahomes — replace with dynamic later

  const response = await fetch(`https://api.nfl.com/v3/players/${gsisId}/stats?season=${season}`);
  if (!response.ok) throw new Error('NFL stats fetch failed');
  const data = await response.json();
  return data; // Full season stats + weekly breakdown
}