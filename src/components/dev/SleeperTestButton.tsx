// src/components/dev/SleeperTestButton.tsx
'use client';

import { useState } from 'react';
import { fetchAllPlayers, fetchNFLState } from '@/lib/sleeper-api';
import { Button } from '@/components/ui/button';

export default function SleeperTestButton() {
  const [result, setResult] = useState<string>('');

  const testFetch = async () => {
    try {
      setResult('Fetching NFL state...\n');
      const state = await fetchNFLState();
      const nflWeekInfo = `NFL State: Season ${state.season}, Leg Week ${state.leg}, Week ${state.week}, Display Week ${state.display_week}`;

      setResult(prev => prev + nflWeekInfo + '\n\nFetching all players...\n');

      const players = await fetchAllPlayers();
      const count = Object.keys(players).length;
      const sampleId = Object.keys(players)[0];
      const samplePlayer = players[sampleId];

      const sampleInfo = `Success! Loaded ${count} players.\n` +
        `Sample Player ID: ${sampleId}\n` +
        `Sample: ${samplePlayer.full_name || 'N/A'} | ${samplePlayer.position || 'N/A'} | ${samplePlayer.team || 'N/A'}`;

      // Find Patrick Mahomes (common test player)
      const mahomesEntry = Object.entries(players).find(
        ([_, p]: [string, any]) => p.full_name === 'Patrick Mahomes'
      );
      const mahomesId = mahomesEntry ? mahomesEntry[0] : 'Not found';

      setResult(prev => 
        prev + sampleInfo + `\n\nPatrick Mahomes Sleeper ID: ${mahomesId}`
      );
    } catch (err: any) {
      setResult(`Error: ${err.message}\nCheck console for details.`);
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
      <p className="font-bold text-orange-900 mb-4">DEV TOOL: Sleeper API Connection Test</p>
      <Button 
        onClick={testFetch}
        variant="default"
        className="mb-4 bg-orange-600 hover:bg-orange-700"
      >
        Run Sleeper API Test
      </Button>
      
      {result && (
        <pre className="mt-4 text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}