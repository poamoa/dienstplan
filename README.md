# Dienstplan Gemeinde

Eine schlanke Web-App zur Terminplanung und Diensteinteilung für unsere Gemeinde.
Läuft als statische Seite auf GitHub Pages, Daten liegen in einer Supabase-Datenbank (kostenlos).

## Was die App kann (Zielbild V1)

- **Mitarbeiter:** Präferenzen angeben, sich selbst zu Terminen eintragen, eigene Dienste der nächsten Wochen sehen
- **Bereichsleiter (Admin):** Personen einteilen (gefiltert nach Präferenz), unterbesetzte Termine sehen sie rot hervorgehoben
- **Dienstbereiche:** Kinderdienst Schulkinder, Kinderdienst Kindergartenkinder, Aufbau, Abbau, Lobpreisleitung, Sprecher, Milch und Wasser
- **Regel Kinderdienste:** mindestens 1 Leiter + 1 Mitarbeiter

## Dokumentation – in dieser Reihenfolge lesen

| Datei | Inhalt |
|---|---|
| [docs/00-entscheidung-architektur.md](docs/00-entscheidung-architektur.md) | Warum dieser Ansatz? Geprüfte Alternativen, Risiken, Korrekturen |
| [docs/01-anforderungen.md](docs/01-anforderungen.md) | Was die App können muss – und was bewusst nicht |
| [docs/02-datenmodell.md](docs/02-datenmodell.md) | Tabellen, Felder, Besetzungsregeln |
| [docs/03-einrichtung-supabase.md](docs/03-einrichtung-supabase.md) | Schritt-für-Schritt: Datenbank aufsetzen |
| [docs/04-einrichtung-github.md](docs/04-einrichtung-github.md) | Schritt-für-Schritt: Repo + GitHub Pages |
| [docs/05-betrieb-wartung.md](docs/05-betrieb-wartung.md) | Backups, Keep-Alive, wiederkehrende Aufgaben |
| [docs/06-roadmap.md](docs/06-roadmap.md) | Phasen, Ideen für später |
| [docs/08-app-spezifikation.md](docs/08-app-spezifikation.md) | Bauvorgabe für die App |
| [docs/07-aenderungslog.md](docs/07-aenderungslog.md) | Wer hat wann was geändert |

## Projektstruktur

```
dienstplan/
├── START-HIER.md         # ← Mit Claude Code aufsetzen: hier beginnen
├── CLAUDE.md             # Projektanweisungen, die Claude Code automatisch liest
├── README.md
├── index.html            # Die App (entsteht mit /app-bauen)
├── app.css / app.js
├── config.js             # Supabase-URL + öffentlicher Key (entsteht mit /setup)
├── docs/                 # Dokumentation (00–08)
├── sql/                  # Datenbank-Skripte, nummeriert, mehrfach ausführbar
├── scripts/setup.sh      # Automatisierte Ersteinrichtung
├── .claude/skills/       # Skills: /setup, /app-bauen, /neues-jahr,
│                         #   dienstplan-wartung, dienstplan-diagnose
└── .github/workflows/    # Keep-Alive + Backup (laufen automatisch)
```

## Aufsetzen

Siehe **[START-HIER.md](START-HIER.md)** – mit Claude Code sind es im Kern zwei Befehle: `/setup` und `/app-bauen`.

## Aktueller Stand

- [x] Phase 0: Architektur geprüft, Entscheidungen dokumentiert
- [x] Phase 1: Supabase-Projekt aufgesetzt, SQL ausgeführt
- [x] Phase 2: App gebaut
- [x] Phase 3: Auf GitHub Pages online → https://poamoa.github.io/dienstplan/
- [x] Phase 4: Backup + Keep-Alive aktiv (Backup → privates Repo dienstplan-backups)
- [ ] Phase 5: Testlauf mit 3 Personen
- [ ] Phase 6: Rollout im Team

**Live:** https://poamoa.github.io/dienstplan/ · Team-Passwort **nicht** im Repo,
siehe Passwortmanager (dieses Repo ist öffentlich).

## Kontakt / Verantwortung

- Technische Pflege: Joel
- Vertretung: Josua
