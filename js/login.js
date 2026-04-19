import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fjuwfzzlfaatreeczsab.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXdmenpsZmFhdHJlZWN6c2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDExMzMsImV4cCI6MjA4ODAxNzEzM30.HpEa5RUy43AYh2EiBXnop68yyfY-Um8Bh2t7jimSdYs";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

document.getElementById("confirmsignup").onclick = async () => {
    const email = document.getElementById("emaillogin").value;
    const password = document.getElementById("password").value;

    if (!username || username.length > 10){
        alert("Please choose a valid username. Max length 10 characters.")
    }

    const { data, error } = await supabase.auth.signUp({ 
        email,
        password,
        options: {
            data: {
                username: username,
            }
        } 
    });

    if (error) {
        alert("Error: " + error.message);
        console.error(error);
    } else if (data.user) {
        currentUser = data.user;
        alert("User created! User ID: " + data.user.id);
        loadMatches();
    } else {
        alert("Check your email to confirm sign up!");
    }
};


document.getElementById("confirmlogin").onclick = async () => {
    const email = document.getElementById("emaillogin").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
        console.error(error);
    } else if (data.user) {
        currentUser = data.user;
        alert("Logged in! User ID: " + data.user.id);
        loadMatches();
    }
};


async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        loadMatches();
    }
}

checkUser();