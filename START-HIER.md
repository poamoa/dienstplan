# START HIER – Aufsetzen mit Claude Code

Gesamtdauer: ca. 45–60 Minuten, das meiste davon macht Claude.

## Vorbereitung (einmalig, ~10 Min)

1. **Claude Code installieren**, falls noch nicht geschehen. Aktuelle Anleitung für dein Betriebssystem: https://docs.claude.com/en/docs/claude-code/overview
2. **GitHub-Konto** bereithalten (hast du vermutlich schon).
3. Diesen Projektordner **an einen dauerhaften Ort** legen, z. B. `Dokumente/dienstplan` – nicht im Downloads-Ordner lassen.

## Aufsetzen (3 Befehle)

Terminal/Eingabeaufforderung im Projektordner öffnen, dann:

```
claude
```

Claude Code liest automatisch `CLAUDE.md` und kennt damit das ganze Projekt. Dann der Reihe nach:

### Schritt 1: `/setup`

Richtet alles ein: Datenbank-Tabellen, Zugriffsschutz, Team-Konto, `config.js`, GitHub-Repo, GitHub Pages, Backup- und Keep-Alive-Automatik.

Nur eine Sache bleibt bei dir, weil sie ein Browser-Login braucht: das Supabase-Projekt anlegen und vier Werte herauskopieren. Claude sagt dir genau, wo du klicken musst.

**Halte bereit:** dein GitHub-Login und 5 Minuten für die Supabase-Registrierung.

### Schritt 2: `/app-bauen`

Claude baut die App nach der Spezifikation in `docs/08`, testet sie gegen die Abnahmekriterien und lässt dich lokal probeklicken, bevor sie online geht.

### Schritt 3: Selbst prüfen

1. `https://DEIN-GITHUB-NAME.github.io/dienstplan/` öffnen, mit dem Team-Passwort anmelden.
2. **Wichtig:** privates Browserfenster, gleiche Adresse, **ohne** Anmeldung → es dürfen keine Daten erscheinen.
3. Kachel auf dem eigenen Handy anlegen (Anleitung in `docs/04`, Abschnitt 5) und einmal alles antippen.

Danach: Testlauf mit 3 Personen für eine Woche (Phase 5 in `docs/06-roadmap.md`) – erst dann ans ganze Team.

## Später: Pflege mit Claude Code

Einfach im Projektordner `claude` starten und normal drauflosschreiben – die passenden Skills springen automatisch an:

| Du sagst z. B. | Was passiert |
|---|---|
| „Aufbau braucht ab jetzt 3 Leute" | Wartungs-Skill: ändert den Wert in der Datenbank, kein Code |
| „Die Seite ist leer / Fehler 401 / project paused" | Diagnose-Skill: geht die häufigsten Ursachen durch |
| `/neues-jahr` | legt die Sonntage der nächsten 12 Monate an, prüft Backup & Personen |
| „Ich hätte gern einen Kalender-Export" | Wartungs-Skill: schätzt Aufwand ehrlich ein und setzt um |

Zwei Bitten an dich, damit das in einem Jahr noch funktioniert:
- Lass Claude nach jeder Änderung den Eintrag in `docs/07-aenderungslog.md` machen (es schlägt das von selbst vor).
- Trage in der `README.md` eine **Vertretung** ein und gib ihr Zugriff auf GitHub und Supabase.

## Wenn etwas hakt

Sag es einfach Claude Code im Projektordner – mit der wörtlichen Fehlermeldung. Der Diagnose-Skill kennt die typischen Stolperstellen dieses Projekts.
