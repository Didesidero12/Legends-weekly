import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const distributeCards = functions.pubsub.schedule('0 9 * * 2') // Tuesday 9AM (post-Monday games)
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    const leaguesSnap = await admin.firestore().collection('leagues').get();
    for (const leagueDoc of leaguesSnap.docs) {
      const league = leagueDoc.data() as League;
      // Get weekly scores (from matchup subcollection)
      const matchups = await leagueDoc.ref.collection('matchups').where('week', '==', currentWeek).get();
      // Rank teams by points
      const rankedTeams = sortTeamsByScores(matchups);
      // Apply mechanic (e.g., top half get pack)
      for (const team of getEligibleTeams(rankedTeams, league.cardSettings.mechanic)) {
        const tier = getTier(); // Random based on % (5% Legendary, etc.)
        const position = randomPosition();
        const card = { id: admin.firestore().collection('dummy').doc().id, tier, position, status: 'unplayed', playerName: 'TBD' };
        await leagueDoc.ref.collection('teams').doc(team.id).collection('cards').add(card);
      }
    }
  });

function getTier() {
  const rand = Math.random() * 100;
  if (rand < 5) return 'Legendary';
  if (rand < 20) return 'Epic';
  if (rand < 50) return 'Rare';
  return 'Common';
}

// Add functions for sortTeamsByScores, getEligibleTeams (based on 10 mechanics), randomPosition