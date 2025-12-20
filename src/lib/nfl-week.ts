// src/lib/nfl-week.ts

export function getCurrentNFLWeek(): number {
  const today = new Date();
  const year = today.getFullYear();

  // NFL regular season starts first Thursday in September
  let seasonStart = new Date(year, 8, 1); // September 1
  // Find first Thursday
  while (seasonStart.getDay() !== 4) { // 4 = Thursday
    seasonStart.setDate(seasonStart.getDate() + 1);
  }
  // First games usually the following week
  seasonStart.setDate(seasonStart.getDate() + 7);

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceStart = Math.floor((today.getTime() - seasonStart.getTime()) / msPerWeek) + 1;

  // Clamp to regular season (1-18)
  return Math.max(1, Math.min(18, weeksSinceStart));
}