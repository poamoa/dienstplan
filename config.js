// config.js – Zugangsdaten zur Datenbank.
//
// Diese Datei wird von /setup bzw. scripts/setup.sh erzeugt und dabei komplett
// überschrieben. Nichts anderes hier hineinschreiben, es geht sonst verloren.
// Beide Werte stehen im Supabase-Dashboard unter Settings -> API.
//
// WICHTIG: Hier gehört NUR der "anon public key" hinein. Der "service_role key"
// hebelt jeden Schutz aus und darf niemals in dieser Datei oder im Repo landen.
// Der anon key darf öffentlich sein - dafür ist er gemacht, RLS sperrt Anonyme aus.

window.CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
};
