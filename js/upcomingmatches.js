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


    container.innerHTML = data.map((m) => `
    <div class="match">
        <div class="event"><h2>${m.league}</h2></div>
        <button class="predictbutton">☰</button>
        <div class="teams">
            <h2>${m.team1}</h2>
            <h2>${m.team2}</h2>
        </div>

        <div class="logos">
            <p class="time">${m.begin_at}</p>
        </div>
        <div class="predictionmenu">
            <button class="teambutton1">Predict ${m.team1} wins</button>
            <button class="teambutton2">Predict ${m.team2} wins</button>
        </div>
    </div>
`).join("");

// Listener 1 - toggle prediction menu
container.querySelectorAll(".predictbutton").forEach((button) => {
    button.addEventListener("click", () => {
        const menu = button.closest(".match").querySelector(".predictionmenu");
        menu.classList.toggle("open");
        layer.classList.toggle("visible");
    });
});

// Listener 2 - submit prediction
container.querySelectorAll(".match").forEach((matchEl) => {
    const matchIndex = Array.from(container.querySelectorAll(".match")).indexOf(matchEl);
    const matchData = data[matchIndex];

    async function submitPrediction(predictedWinner) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("No user logged in");
            return;
        }

        const { error } = await supabase
            .from("predictions")
            .insert({
                user_id: user.id,
                match_id: matchData.id,
                predicted_winner: predictedWinner
            });

        if (error) {
            console.error("Failed to save prediction:", error.message);
        } else {
            console.log(`Prediction saved: ${predictedWinner}`);
        }
        window.location.href = "upcoming.html"
    }

    matchEl.querySelector(".teambutton1").addEventListener("click", () => submitPrediction(matchData.team1));
    matchEl.querySelector(".teambutton2").addEventListener("click", () => submitPrediction(matchData.team2));

});
}