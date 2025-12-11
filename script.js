// Koble til Supabase
const SUPABASE_URL = "https://igzqvifmqwwnzzctylua.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenF2aWZtcXd3bnp6Y3R5bHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODQ2MzUsImV4cCI6MjA4MDE2MDYzNX0._vCnuLkXbO-rdSOn-uBmSzPSBe5_rbFz4V5ljdDyFRA";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI-elementer
const panel = document.getElementById("authPanel");
const openBtn = document.getElementById("authOpenBtn");
const closeBtn = document.getElementById("authCloseBtn");
const userBadge = document.getElementById("authUserBadge");

const loggedOut = document.getElementById("authLoggedOut");
const loggedIn = document.getElementById("authLoggedIn");
const whoami = document.getElementById("whoami");
const roleBadge = document.getElementById("roleBadge");

const tabButtons = document.querySelectorAll("[data-tab]");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMsg = document.getElementById("loginMsg");
const signupMsg = document.getElementById("signupMsg");

// Åpne/lukk panel
openBtn.addEventListener("click", () => panel.classList.add("open"));
closeBtn.addEventListener("click", () => panel.classList.remove("open"));

// Bytt mellom "Logg inn" og "Opprett profil"
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    loginForm.style.display = tab === "login" ? "" : "none";
    signupForm.style.display = tab === "signup" ? "" : "none";
  });
});

// Oppdater UI etter innlogging
async function refreshAuthUI() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    loggedOut.style.display = "";
    loggedIn.style.display = "none";
    userBadge.textContent = "";
    return;
  }

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "user";

  loggedOut.style.display = "none";
  loggedIn.style.display = "";

  whoami.textContent = `Innlogget som ${user.email}`;
  roleBadge.textContent = `Rolle: ${role}`;
  userBadge.textContent = role === "admin" ? "Admin" : "Innlogget";
}

// Logg inn
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Logger inn...";

  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: pass,
  });

  loginMsg.textContent = error
    ? "Feil: " + error.message
    : "Innlogging vellykket!";

  await refreshAuthUI();
  if (!error) setTimeout(() => panel.classList.remove("open"), 300);
});

// Opprett bruker
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMsg.textContent = "Oppretter...";

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPass").value;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password: pass,
    options: {
      data: { display_name: name },
    },
  });

  signupMsg.textContent = error
    ? "Feil: " + error.message
    : "Konto opprettet! Du kan logge inn.";
});

// Logg ut
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  await refreshAuthUI();
});

// Oppdater UI når auth endrer seg
supabaseClient.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
