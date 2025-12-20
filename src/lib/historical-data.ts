// src/lib/historical-data.ts
import { GameLogEntry } from './types';

// Sample historical pool (expand with real data later)
export const historicalPerformances = {
  QB: [
    { playerName: 'John Elway', year: 1995, week: 6, gameLog: { passingYds: 350, passingTds: 4, interceptions: 1 } as GameLogEntry, tier: 'Legendary' },
    // Add 50+ entries per position/tier
  ],
  RB: [
    { playerName: 'Emmitt Smith', year: 1995, week: 8, gameLog: { rushingYds: 150, rushingTds: 2, receptions: 5 } as GameLogEntry, tier: 'Epic' },
  ],
  // Add for WR, TE, etc.
};

// Function to random pick based on tier/position
export function getHistoricalPlayer(position: string, tier: CardTier) {
  const pool = historicalPerformances[position].filter(p => p.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)];
}