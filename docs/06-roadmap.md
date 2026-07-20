# 06 – Roadmap

## Phasen bis zum Rollout

| Phase | Inhalt | Wer | Status |
|---|---|---|---|
| **0** | Architektur geprüft, Doku angelegt | — | ✅ |
| **1** | Supabase aufsetzen, SQL ausführen (`docs/03`) | du | ⬜ |
| **2** | App bauen: `index.html`, `app.css`, `app.js`, `config.js` | Claude + du | ⬜ |
| **3** | Auf GitHub Pages online (`docs/04`) | du | ⬜ |
| **4** | Backup + Keep-Alive aktivieren (`docs/05`) | du | ⬜ |
| **5** | Testlauf mit 3 Personen, 1 Woche | du + 2 Bereichsleiter | ⬜ |
| **6** | Rollout: echte Namen anlegen, Team-Passwort verteilen, Handy-Kacheln zeigen | du | ⬜ |

**Phase 5 nicht überspringen.** Drei Leute, eine Woche, echte Daten. Alles, was dabei nervt, nervt später 30 Leute.

## Reihenfolge innerhalb von Phase 2

So gebaut, dass nach jedem Schritt etwas Funktionierendes dasteht:

1. Anmeldung (Team-Passwort) + Namensauswahl
2. "Meine Dienste" – reine Leseansicht. Das ist der Teil, den 90 % am häufigsten öffnen.
3. Präferenzen setzen
4. Selbsteintragung in offene Plätze
5. Admin-Ansicht mit Ampel
6. Admin-Einteilung mit Präferenz-Vorschlägen
7. Personen- und Terminverwaltung

## Nach V1 – nach Nutzen sortiert

| Idee | Nutzen | Aufwand | Bemerkung |
|---|---|---|---|
| **Kalender-Export (iCal)** | hoch | klein | Eigene Dienste landen im Handykalender. Vermutlich der beste Nutzen pro Aufwand. |
| **Abwesenheiten eintragen** | hoch | mittel | „Vom 1.–14. August nicht da." Verhindert Fehleinteilungen. |
| **Erinnerung 2 Tage vorher** | hoch | mittel | Braucht Supabase Edge Function + E-Mail-Dienst. Alternativ: Bereichsleiter schreibt in die WhatsApp-Gruppe – kostet nichts und funktioniert. |
| **Tauschbörse** | mittel | mittel | „Ich kann nicht" markiert den Platz wieder als offen |
| **Statistik „wer wie oft"** | mittel | klein | Hilft gegen Überlastung Einzelner. Vorsicht: kann sich nach Kontrolle anfühlen. |
| **Automatische Einteilungsvorschläge** | mittel | groß | Reizvoll, aber Menschen planen besser. Frühestens wenn V1 ein Jahr läuft. |
| **E-Mail-Login pro Person** | niedrig–hoch | mittel | Nur wenn ihr echten Schutz pro Person braucht. Erhöht die Einstiegshürde spürbar. |

## Bewusst nie

- **Kontaktdaten in der Datenbank.** Die Datensparsamkeit ist ein Sicherheitsmerkmal, kein Versäumnis.
- **Ein zweites System danebenstellen.** Wenn irgendwann ChurchTools kommt: dieses Projekt einstellen, nicht parallel betreiben.

## Wann dieses Projekt beenden

Ehrliche Abbruchkriterien – jetzt festhalten, solange man noch nüchtern draufschaut:

- Wenn ihr ChurchTools o. ä. einführt → dieses Projekt ablösen
- Wenn nach 6 Wochen weniger als die Hälfte sich selbst einträgt → Ursache klären, nicht Funktionen nachschieben
- Wenn niemand mehr die Wartung übernehmen will → geordnet zurück zur Tabelle, mit den Backup-Daten
