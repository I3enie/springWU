import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fjuwfzzlfaatreeczsab.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXdmenpsZmFhdHJlZWN6c2FiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0MTEzMywiZXhwIjoyMDg4MDE3MTMzfQ.DPudu5fXZ6v8OWVOGpPuib4xGnICVAs1SDr5ymU8YZE";
const PANDASCORE_TOKEN = "PazDPqbUCYcbqE6mzmYvSFQcxZC8No6xFwMT7Jr90SjZFtEr2m8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fetchMatchFromPandascore(matchId) {
  try {
    const url = `https://api.pandascore.co/csgo/matches/${matchId}?token=${PANDASCORE_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data?.winner?.name ?? null;
  } catch (err) {
    console.error(`Error fetching match ${matchId} from PandaScore:`, err);
    return null;
  }
}

async function evaluatePredictionsAndAwardPoints() {
  console.log("\n--- Evaluating predictions ---");


  const { data: predictions, error: predError } = await supabase
    .from("predictions")
    .select("user_id, match_id, predicted_winner")
    .eq("scored", false);

  if (predError) { console.error("Error fetching predictions:", predError); return; }
  if (!predictions.length) { console.log("No unscored predictions found."); return; }

  console.log(`Found ${predictions.length} unscored predictions`);

  const predMatchIds = [...new Set(predictions.map(p => p.match_id))];
  const { data: completedMatches, error: matchError } = await supabase
    .from("matches")
    .select("id, winner")
    .in("id", predMatchIds)
    .not("winner", "is", null);

  if (matchError) { console.error("Error fetching matches:", matchError); return; }

  const winnerByMatchId = Object.fromEntries((completedMatches || []).map(m => [m.id, m.winner]));
  const completedMatchIds = new Set((completedMatches || []).map(m => m.id));

  const missingMatchIds = predMatchIds.filter(id => !completedMatchIds.has(id));
  console.log(`${missingMatchIds.length} matches not in DB, checking PandaScore...`);

  for (const matchId of missingMatchIds) {
    const winner = await fetchMatchFromPandascore(matchId);
    if (winner) {
      console.log(`Match ${matchId} finished, winner: ${winner}`);
      winnerByMatchId[matchId] = winner;
      completedMatchIds.add(matchId);
    } else {
      console.log(`Match ${matchId} not finished or not found`);
    }
  }


  const scorablePredictions = predictions.filter(p => completedMatchIds.has(p.match_id));
  console.log(`Scorable predictions: ${scorablePredictions.length}`);

  if (!scorablePredictions.length) { console.log("No predictions ready to score yet."); return; }


  const pointsToAdd = {};
  for (const p of scorablePredictions) {
    if (p.predicted_winner === winnerByMatchId[p.match_id]) {
      pointsToAdd[p.user_id] = (pointsToAdd[p.user_id] || 0) + 1;
    }
  }

  console.log(`Awarding points to ${Object.keys(pointsToAdd).length} users`);


  for (const [userId, pts] of Object.entries(pointsToAdd)) {
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) { console.error(`Error fetching user ${userId}:`, userError); continue; }
    const username = user?.user_metadata?.username ?? null;
    console.log(`Awarding ${pts} points to ${username ?? userId}`);

    const { error: rpcError } = await supabase.rpc("increment_points", {
      p_user_id: userId,
      p_points: pts,
    });
    if (rpcError) console.error(`Error updating points for user ${userId}:`, rpcError);

    if (username) {
      const { error: nameError } = await supabase
        .from("leaderboard")
        .update({ username })
        .eq("user_id", userId);
      if (nameError) console.error(`Error updating username for user ${userId}:`, nameError);
    }
  }

  const { error: updateError } = await supabase
    .from("predictions")
    .upsert(
      scorablePredictions.map(p => ({ user_id: p.user_id, match_id: p.match_id, scored: true })),
      { onConflict: "user_id,match_id" })

      
  if (updateError) console.error("Error marking predictions as scored:", updateError);

  console.log(`Done! Scored ${scorablePredictions.length} predictions, awarded points to ${Object.keys(pointsToAdd).length} users.`);
}

evaluatePredictionsAndAwardPoints();
setInterval(() => evaluatePredictionsAndAwardPoints(), 5 * 60 * 1000);

console.log("Points evaluator running — checks every 5 minutes.");