import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fjuwfzzlfaatreeczsab.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXdmenpsZmFhdHJlZWN6c2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDExMzMsImV4cCI6MjA4ODAxNzEzM30.HpEa5RUy43AYh2EiBXnop68yyfY-Um8Bh2t7jimSdYs"; // Replace with yours

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- LOAD MATCHES BASED ON PAGE TYPE ----
export async function loadMatches(pageType) {
    const matchContainer = document.getElementById("match-list");

    let query = supabase.from("matches").select("*");

    if (pageType === "ongoing") {
        query = query.is("winner", null).not("score1", "is", null).not("score2", "is", null);
    }
    else if (pageType === "upcoming") {
        query = query.is("score1", null).is("score2", null);
    }
    else if (pageType === "finished") {
        query = query.not("winner", "is", null);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        matchContainer.innerHTML = "<p>Error loading matches.</p>";
        return;
    }

    if (data.length === 0) {
        matchContainer.innerHTML = "<p>No matches found.</p>";
        return;
    }

    matchContainer.innerHTML = data
        .map(m => `
        <div class="match">
            <div class="event">
                <h2>${m.event}</h2>
            </div>
            <div class="teams">
                <h2>${m.team1}</h2>
                <h2>${m.team2}</h2>
            </div> 
            <div class="logos">
                <p class="score">${m.score1 ?? 0} : ${m.score2 ?? 0}</p> 
            </div>
        </div>
        `)
        .join("");
}