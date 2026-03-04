// --- 1. Import libraries ---
import { HLTV } from "hltv";
import { createClient } from "@supabase/supabase-js";

// --- 2. Connect to Supabase ---
// Use your SERVICE ROLE KEY here (backend only!)
const supabase = createClient(
  "https://fjuwfzzlfaatreeczsab.supabase.co",
  "YOUR_SERVICE_ROLE_KEY_HERE"
);

// --- 3. Function to fetch and upsert matches ---
async function fetchAndUpdateMatches() {
  try {
    console.log("Fetching upcoming HLTV matches...");
    const upcomingMatches = await HLTV.getUpcoming({ forceRefresh: true });

    console.log(`Found ${upcomingMatches.length} matches.`);

    for (const match of upcomingMatches) {
      // --- 4. Map HLTV fields to Supabase table safely ---
      const row = {
        id: match.id,
        team1: match.team1 && match.team1.name ? match.team1.name : "TBD",
        team2: match.team2 && match.team2.name ? match.team2.name : "TBD",
        score1: null,
        score2: null,
        winner: null,
        event: match.event && match.event.name ? match.event.name : "TBD"
      };

      // --- 5. Insert or update (upsert) ---
      const { data, error } = await supabase
        .from("matches")
        .upsert(row, { onConflict: ["id"] }); // use HLTV id as unique key

      if (error) {
        console.error(`Error inserting/updating match ${row.id}:`, error.message);
      } else {
        console.log(`Match ${row.team1} vs ${row.team2} inserted/updated.`);
      }
    }

    console.log("All matches processed successfully!");
  } catch (err) {
    console.error("Error fetching HLTV matches:", err);
  }
}

// --- 6. Run the function ---
fetchAndUpdateMatches();