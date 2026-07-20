// config.js – Zugangsdaten zur Datenbank.
//
// Diese Datei wird von /setup bzw. scripts/setup.sh erzeugt und dabei komplett
// überschrieben. Nichts anderes hier hineinschreiben, es geht sonst verloren.
//
// Hier steht NUR der öffentliche "publishable"-Schlüssel (früher: anon key).
// Der darf öffentlich sein – dafür ist er gemacht, RLS sperrt Anonyme aus.
// Der "secret"-Schlüssel (früher: service_role) gehört NIEMALS hierher.

window.CONFIG = {
  SUPABASE_URL: "https://kztbppgwgptyeqnxnoab.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_Q3XjbwB0IYGHouM9RCSQQw_5MoqC69t",
};
