import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fjuwfzzlfaatreeczsab.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXdmenpsZmFhdHJlZWN6c2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDExMzMsImV4cCI6MjA4ODAxNzEzM30.HpEa5RUy43AYh2EiBXnop68yyfY-Um8Bh2t7jimSdYs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// We export the function so HTML can import it
export async function loadMatches(status) {

    const container = document.getElementById(`match-list-${status}`);
    container.innerHTML = "Loading...";

    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", status)
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        container.innerHTML = "<p>Error loading matches.</p>";
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = "<p>No matches found.</p>";
        return;
    }

    container.innerHTML = data
        .map(
            (m) => `
                <div class="match">
                    <div class="event"><h2>${m.league}</h2></div>

                    <div class="teams">
                        <h2>${m.team1}</h2>
                        <h2>${m.team2}</h2>
                    </div>

                    <div class="logos">
                        <p class="winner">Winner: ${m.winner}</p>
                    </div>
                </div>
            `
        )
        .join("");
}