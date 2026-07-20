# Dienstplan Gemeinde – Projektanweisungen für Claude Code

Web-App zur Diensteinteilung einer Kirchengemeinde. Statisch auf GitHub Pages, Daten in Supabase (Free-Plan). Der Betreuer ist technisch interessiert, aber **kein Entwickler** – erkläre Schritte in einfachem Deutsch, nenne konkrete Klickpfade, vermeide unnötigen Jargon.

## Wo alles steht

- `docs/00`–`07`: Architekturentscheidung, Anforderungen, Datenmodell, Einrichtung, Betrieb, Roadmap, Änderungslog
- `docs/08-app-spezifikation.md`: exakte Vorgabe für den Bau der App
- `sql/`: nummerierte Datenbank-Skripte (mehrfach ausführbar)
- `scripts/setup.sh`: automatisierte Ersteinrichtung
- `.claude/skills/`: `/setup`, `/app-bauen`, `/neues-jahr`, `dienstplan-wartung`, `dienstplan-diagnose`

## Phasenstand

Siehe README-Checkliste. Typischer Ablauf: `/setup` (Phase 1+3+4) → `/app-bauen` (Phase 2) → Testlauf.

## Eiserne Regeln (nie ohne ausdrückliche Nutzer-Zustimmung brechen)

1. **Nur Vornamen in der Datenbank.** Keine Telefonnummern, Adressen, Geburtsdaten, Fotos.
2. **RLS bleibt an.** Jede neue Tabelle bekommt sofort Policies analog `sql/03_rls.sql`.
3. **`service_role` key niemals in Dateien, Code oder Commits.** Nur der `anon key` gehört in `config.js`. Vor jedem Commit prüfen.
4. **Kein Build-Prozess, kein Framework.** Vanilla HTML/CSS/JS, Supabase per CDN. Genau vier App-Dateien: `index.html`, `app.css`, `app.js`, `config.js`.
5. **Regeln sind Daten, nicht Code.** Mindestbesetzung/Leiterpflicht stehen in Tabelle `bereiche`.
6. **Nichts löschen, deaktivieren** (`personen.aktiv`, `termine.abgesagt`).
7. **Datenbankänderungen nur als neues nummeriertes Skript** in `sql/`, idempotent (`if not exists`, `on conflict do nothing`).
8. **Jede Änderung** bekommt einen Eintrag in `docs/07-aenderungslog.md` (Datum, wer, was, warum, Folgen) – ohne den ist die Arbeit nicht fertig.

## Fachliche Kernregel

Kinderdienste (`braucht_leiter = true`) sind erst besetzt mit **1 Leiter + min. 1 weiterem Mitarbeiter**. Ampel: rot = unter Minimum ODER Leiter fehlt; gelb = Minimum ohne Puffer; grün = darüber. Die Ansicht `v_besetzung` liefert das fertig – nach jeder Änderung prüfen, dass ein Kinderdienst ohne Leiter niemals grün werden kann.

## Häufige Kommandos

```bash
bash scripts/setup.sh          # geführte Ersteinrichtung (idempotent)
psql "$SUPABASE_DB_URL" -f sql/01_schema.sql   # einzelnes SQL-Skript ausführen
gh workflow run backup.yml     # Backup manuell anstoßen
gh workflow run keepalive.yml  # Keep-Alive manuell anstoßen
```

`SUPABASE_DB_URL` = Session-Pooler-Verbindung aus dem Supabase-Dashboard (Connect → Session pooler). Die direkte `db.<ref>...`-Adresse ist oft nur per IPv6 erreichbar – immer den Pooler verwenden.

## Testen

Es gibt keine Testumgebung – jede Änderung geht live. Deshalb vor dem Push:
1. `index.html` lokal öffnen (die App läuft auch von der Festplatte, wenn `config.js` gefüllt ist)
2. Anmeldung, "Meine Dienste", Selbsteintragung, Admin-Ampel einmal durchklicken
3. Privates Fenster ohne Anmeldung: keine Daten sichtbar
