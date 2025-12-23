// src/components/dev/SleeperTestButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { fetchWeeklyPlayerStats } from '@/lib/sleeper-api';

export default function SleeperTestButton() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2025);  // Default to current season
  const [currentWeek, setCurrentWeek] = useState<number>(12);    // Default to a completed week

  const testFetch = async () => {
    setStats(null);
    setError(null);
    try {
      console.log(`Fetching stats for year ${currentYear}, week ${currentWeek}...`);
      const data = await fetchWeeklyPlayerStats(currentYear, currentWeek);
      console.log('Full response keys count:', Object.keys(data).length);

      const mahomesId = '4046';
      const mahomesStats = data[mahomesId];
      if (mahomesStats) {
        console.log(`Mahomes ${currentYear} Week ${currentWeek} stats found:`, mahomesStats);
        setStats(mahomesStats);
      } else {
        setError(`No stats found for Mahomes in ${currentYear} Week ${currentWeek}`);
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      console.error('Fetch error:', err);
      setError(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-sm font-medium">Year</label>
          <input
            type="number"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="ml-2 px-3 py-1 rounded border bg-background"
            min="2020"
            max="2025"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Week</label>
          <input
            type="number"
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="ml-2 px-3 py-1 rounded border bg-background"
            min="1"
            max="18"
          />
        </div>
        <Button onClick={testFetch}>
          Test Sleeper Stats Fetch (Mahomes {currentYear} Week {currentWeek})
        </Button>
      </div>

      {error && (
        <p className="text-red-500 font-medium">{error}</p>
      )}

      {stats && (
        <div className="mt-6">
          <p className="font-bold text-green-500 text-lg mb-3">
            ✅ Success! Mahomes {currentYear} Week {currentWeek} Stats
          </p>

          {/* Quick summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Passing Yards</p>
              <p className="text-2xl font-bold text-white">{stats.pass_yd ?? 'N/A'}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Passing TDs</p>
              <p className="text-2xl font-bold text-white">{stats.pass_td ?? 0}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">INTs</p>
              <p className="text-2xl font-bold text-red-400">{stats.pass_int ?? 0}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Rush Yards</p>
              <p className="text-2xl font-bold text-white">{stats.rush_yd ?? 0}</p>
            </div>
          </div>

          {/* Full JSON - collapsible */}
          <details className="bg-gray-900 rounded-lg border border-gray-700">
            <summary className="cursor-pointer p-4 font-medium text-gray-300 hover:text-white">
              View Full Raw Stats JSON ({Object.keys(stats).length} fields)
            </summary>
            <pre className="p-4 text-green-400 text-sm overflow-auto max-h-96">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}