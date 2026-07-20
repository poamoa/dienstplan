#!/usr/bin/env bash
# scripts/setup.sh – Geführte Ersteinrichtung des Dienstplans.
# Idempotent: kann gefahrlos mehrfach laufen.
# Automatisiert: SQL einspielen, Team-Konto anlegen, config.js schreiben,
#                GitHub-Repo + Pages + Secrets + Workflows.
# Manuell bleiben nur: Supabase-Projekt im Browser anlegen und 4 Werte kopieren.
set -euo pipefail

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
ok()    { printf '  \033[32m✔\033[0m %s\n' "$*"; }
warn()  { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail()  { printf '  \033[31m✘ %s\033[0m\n' "$*"; exit 1; }

cd "$(dirname "$0")/.."

bold "== Dienstplan – Einrichtung =="

# ---------------------------------------------------------------- Werkzeuge
bold "[1/7] Werkzeuge prüfen"
command -v git  >/dev/null || fail "git fehlt – bitte installieren: https://git-scm.com"
command -v curl >/dev/null || fail "curl fehlt"
ok "git, curl vorhanden"
if command -v gh >/dev/null; then ok "GitHub CLI (gh) vorhanden"; HAS_GH=1
else warn "GitHub CLI fehlt (https://cli.github.com) – GitHub-Teil wird übersprungen"; HAS_GH=0; fi
if command -v psql >/dev/null; then ok "psql vorhanden"; HAS_PSQL=1
else warn "psql fehlt – SQL muss dann manuell in den Supabase SQL-Editor kopiert werden"; HAS_PSQL=0; fi

# ---------------------------------------------------------------- Eingaben
bold "[2/7] Supabase-Zugangsdaten"
echo "  Falls noch kein Projekt existiert: supabase.com → New Project"
echo "  (Region: Frankfurt). Dann im Dashboard die folgenden Werte kopieren."
echo
read -rp "  Project URL (https://xxxx.supabase.co): " SUPABASE_URL
read -rp "  anon public key: " SUPABASE_ANON_KEY
read -rp "  Session-Pooler-Verbindung (Connect → Session pooler, postgresql://...): " SUPABASE_DB_URL
read -rsp "  service_role key (nur für diese Sitzung, wird NICHT gespeichert): " SERVICE_ROLE; echo
[[ "$SUPABASE_URL" == https://*.supabase.co ]] || fail "Project URL sieht falsch aus"

# ---------------------------------------------------------------- Datenbank
bold "[3/7] Datenbank einrichten (Tabellen, Bereiche, Schutz)"
if [[ $HAS_PSQL -eq 1 ]]; then
  for f in sql/01_schema.sql sql/02_seed.sql sql/03_rls.sql; do
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f "$f" && ok "$f eingespielt"
  done
  RLS=$(psql "$SUPABASE_DB_URL" -t -A -c "select count(*) from pg_tables where schemaname='public' and rowsecurity=false;")
  [[ "$RLS" == "0" ]] && ok "Zugriffsschutz (RLS) auf allen Tabellen aktiv" \
                      || fail "RLS fehlt auf $RLS Tabelle(n) – sql/03_rls.sql prüfen"
else
  warn "Bitte sql/01, 02, 03 nacheinander manuell im Supabase SQL-Editor ausführen."
  read -rp "  Erledigt? [Enter]" _
fi

# ---------------------------------------------------------------- Team-Konto
bold "[4/7] Gemeinsames Team-Konto anlegen"
read -rp "  Team-E-Mail (z. B. team@gemeinde.de): " TEAM_EMAIL
read -rp "  Team-Passwort (merkbar, z. B. Sonntag-Kaffee-7): " TEAM_PASS
HTTP=$(curl -s -o /tmp/user_resp.json -w "%{http_code}" \
  -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEAM_EMAIL\",\"password\":\"$TEAM_PASS\",\"email_confirm\":true}")
if [[ "$HTTP" == "200" || "$HTTP" == "201" ]]; then ok "Team-Konto angelegt (bereits bestätigt)"
elif grep -qi "already" /tmp/user_resp.json; then ok "Team-Konto existiert schon – gut"
else warn "Antwort $HTTP – Konto ggf. manuell anlegen (docs/03, Schritt 3)"; fi
unset SERVICE_ROLE
rm -f /tmp/user_resp.json

# ---------------------------------------------------------------- config.js
bold "[5/7] config.js schreiben"
cat > config.js <<EOF
// Automatisch erzeugt von scripts/setup.sh am $(date +%F)
// Enthält NUR den öffentlichen anon key. Der service_role key gehört hier NIE hinein.
window.CONFIG = {
  SUPABASE_URL: "$SUPABASE_URL",
  SUPABASE_ANON_KEY: "$SUPABASE_ANON_KEY",
};
EOF
ok "config.js geschrieben"

# ---------------------------------------------------------------- GitHub
bold "[6/7] GitHub: Repo, Pages, Secrets, Workflows"
if [[ $HAS_GH -eq 1 ]]; then
  gh auth status >/dev/null 2>&1 || gh auth login
  git init -q 2>/dev/null || true
  git add -A && git commit -q -m "Dienstplan: Einrichtung" 2>/dev/null || ok "Nichts Neues zu committen"
  if ! gh repo view dienstplan >/dev/null 2>&1; then
    gh repo create dienstplan --public --source=. --remote=origin --push
    ok "Repo erstellt und hochgeladen"
  else
    git remote get-url origin >/dev/null 2>&1 || git remote add origin "$(gh repo view dienstplan --json url -q .url).git"
    git push -u origin HEAD -q && ok "Aktualisierung hochgeladen"
  fi
  OWNER=$(gh api user -q .login)
  gh api -X POST "repos/$OWNER/dienstplan/pages" \
     -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 \
     && ok "GitHub Pages aktiviert" || ok "GitHub Pages war schon aktiv"
  gh secret set SUPABASE_URL      --body "$SUPABASE_URL"      -R "$OWNER/dienstplan"
  gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY" -R "$OWNER/dienstplan"
  gh secret set SUPABASE_DB_URL   --body "$SUPABASE_DB_URL"   -R "$OWNER/dienstplan"
  ok "Secrets gesetzt"
  gh workflow run keepalive.yml -R "$OWNER/dienstplan" 2>/dev/null && ok "Keep-Alive gestartet" || warn "Keep-Alive bitte unter Actions manuell starten"
  gh workflow run backup.yml    -R "$OWNER/dienstplan" 2>/dev/null && ok "Backup gestartet"     || warn "Backup bitte unter Actions manuell starten"
  PAGES_URL="https://$OWNER.github.io/dienstplan/"
else
  warn "Ohne gh: docs/04-einrichtung-github.md befolgen"
  PAGES_URL="(siehe docs/04)"
fi

# ---------------------------------------------------------------- Fertig
bold "[7/7] Fertig"
echo
echo "  App-Adresse (in 1–2 Min. erreichbar): $PAGES_URL"
echo "  Team-Passwort fürs Team:              $TEAM_PASS"
echo
echo "  Nächste Schritte:"
echo "   1. Prüfen: Seite öffnen, mit Team-Passwort anmelden."
echo "   2. Privates Fenster: OHNE Passwort dürfen keine Daten erscheinen."
echo "   3. Falls die App noch fehlt: in Claude Code  /app-bauen  eingeben."
echo "   4. Eintrag in docs/07-aenderungslog.md ergänzen."
