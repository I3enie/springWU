import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fjuwfzzlfaatreeczsab.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXdmenpsZmFhdHJlZWN6c2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDExMzMsImV4cCI6MjA4ODAxNzEzM30.HpEa5RUy43AYh2EiBXnop68yyfY-Um8Bh2t7jimSdYs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function loadleaderboard() {
    const container = document.getElementById("leaderboard")
    container.innerHTML = "Loading...";

    const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        container.innerHTML = "<p>Error loading leaderboard.</p>";
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = "<p>No entries found.</p>";
        return;
    }


    container.innerHTML = data.map((m) => `
    <div class="player">
        <h6>${m.user_id}</h6>
        <p>${m.points}</p>    
    </div>
`).join("");
}