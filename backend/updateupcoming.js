import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

// ---------------- HARD-CODED KEYS (TESTING ONLY) ----------------
const SUPABASE_URL = "https://fjuwfzzlfaatreeczsab.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXdmenpsZmFhdHJlZWN6c2FiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0MTEzMywiZXhwIjoyMDg4MDE3MTMzfQ.DPudu5fXZ6v8OWVOGpPuib4xGnICVAs1SDr5ymU8YZE";
const PANDASCORE_TOKEN = "PazDPqbUCYcbqE6mzmYvSFQcxZC8No6xFwMT7Jr90SjZFtEr2m8";

// ---------------- Initialize Supabase ----------------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------- Status → Endpoint Map ----------------
const statusMap = {
  running: "running",
  upcoming: "upcoming",
  finished: "past"
};

const sortRules = {
  running: "",
  upcoming: "&sort=begin_at",
  finished: "&sort=-begin_at"
};

// ---------------- Extract Live Scores for Running Matches ----------------
function getRunningScores(match) {
  const team1_id = match.opponents?.[0]?.opponent?.id;
  const team2_id = match.opponents?.[1]?.opponent?.id;

  if (!team1_id || !team2_id || !match.games?.length) return { score1: null, score2: null };

  let score1 = 0;
  let score2 = 0;

  for (const game of match.games) {
    if (!game.results || game.results.length < 2) continue;
    const t1 = game.results.find(r => r.team_id === team1_id);
    const t2 = game.results.find(r => r.team_id === team2_id);
    if (!t1 || !t2) continue;
    if (t1.score > t2.score) score1++;
    if (t2.score > t1.score) score2++;
  }

  return { score1, score2 };
}

// ---------------- Fetch Matches ----------------
async function fetchMatches(status) {
  try {
    const url =
      `https://api.pandascore.co/csgo/matches/${statusMap[status]}` +
      `?token=${PANDASCORE_TOKEN}` +
      `&per_page=100` +
      `${sortRules[status]}` +
      `&include=games`; // important for live scores

    console.log(`Fetching ${status} matches…`);
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Error fetching ${status}:`, err);
    return [];
  }
}

// ---------------- Transform Match Object ----------------
function transformMatch(match, status) {
  const team1 = match.opponents?.[0]?.opponent?.name || "TBD";
  const team2 = match.opponents?.[1]?.opponent?.name || "TBD";

  let score1 = null;
  let score2 = null;

  // Only calculate scores for running matches
  if (status === "running") {
    ({ score1, score2 } = getRunningScores(match));
  }

  // For finished matches, store winner only
  const winner = status === "finished" ? match.winner?.name ?? null : match.winner?.name ?? null;

  return {
    id: match.id,
    team1,
    team2,
    event: match.tournament?.name || null,
    league: match.league?.name || null,
    serie: match.serie?.name || null,
    score1,
    score2,
    winner,
    status,
    begin_at: match.begin_at ?? null,
    number_of_games: match.number_of_games ?? null,
    updated_at: new Date()
  };
}

// ---------------- Save Matches to Supabase ----------------
async function saveMatches(matches, status) {
  const rows = matches.map(m => transformMatch(m, status));
  console.log(`Saving ${rows.length} ${status} matches…`);

  const { error } = await supabase
    .from("matches")
    .upsert(rows, { onConflict: "id" });

  if (error) console.error("Supabase error:", error);
}

// ---------------- Sync Single Status ----------------
async function syncStatus(status) {
  console.log(`\n=== SYNCING ${status.toUpperCase()} MATCHES ===`);
  const matches = await fetchMatches(status);
  console.log(`Received ${matches.length} matches`);
  await saveMatches(matches, status);
}

// ---------------- Sync All ----------------
async function syncAllMatches() {
  console.log("\n===== MATCH SYNC START =====");
  await syncStatus("running");
  await syncStatus("upcoming");
  await syncStatus("finished");
  console.log("===== MATCH SYNC COMPLETE =====\n");
}

// ---------------- Start + Scheduler ----------------
syncAllMatches();

// Running matches — update often
setInterval(() => syncStatus("running"), 30 * 1000);

// Upcoming — update every 10 minutes
setInterval(() => syncStatus("upcoming"), 10 * 60 * 1000);

// Finished — update every 30 minutes
setInterval(() => syncStatus("finished"), 30 * 60 * 1000);