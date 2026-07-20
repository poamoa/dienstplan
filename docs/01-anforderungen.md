# 01 – Anforderungen

## Rollen

| Rolle | Wer | Darf |
|---|---|---|
| **Mitarbeiter** | alle im Team | Präferenzen pflegen, sich selbst ein-/austragen, eigene Dienste sehen, Gesamtplan lesen |
| **Leiter** | Mitarbeiter mit Leiter-Qualifikation in einem Bereich | wie Mitarbeiter; zählt zusätzlich als Leiter bei der Besetzungsprüfung |
| **Admin** | Bereichsleiter | zusätzlich: Personen einteilen und entfernen, Termine anlegen, Personen anlegen/deaktivieren |

Hinweis: "Leiter" ist eine **Eigenschaft pro Bereich**, nicht pro Person. Jemand kann Leiter im Kinderdienst Schulkinder sein und normaler Mitarbeiter beim Aufbau.

## Dienstbereiche

| Bereich | Regel |
|---|---|
| Kinderdienst Schulkinder | mind. 1 Leiter **und** mind. 1 weiterer Mitarbeiter |
| Kinderdienst Kindergartenkinder | mind. 1 Leiter **und** mind. 1 weiterer Mitarbeiter |
| Aufbau | mind. 2 Personen _(anpassbar)_ |
| Abbau | mind. 2 Personen _(anpassbar)_ |
| Lobpreisleitung | genau 1 Person |
| Sprecher | genau 1 Person |
| Milch und Wasser | mind. 1 Person |

Die Zahlen stehen als Werte in der Datenbank (Tabelle `bereiche`), nicht im Code – sie lassen sich also ohne Programmieren ändern.

## Muss (V1)

**Mitarbeiter**
- M1 Anmeldung mit Team-Passwort, danach eigenen Namen wählen (bleibt gespeichert)
- M2 Präferenzen setzen: In welchen Bereichen möchte ich dienen? (Mehrfachauswahl)
- M3 "Meine Dienste": Liste der kommenden eigenen Dienste, chronologisch, mit Datum und Bereich
- M4 Selbsteintragung: offene Plätze der nächsten Wochen sehen und mit einem Klick übernehmen – nur in Bereichen der eigenen Präferenz
- M5 Selbst wieder austragen (mit Hinweis, wenn dadurch eine Lücke entsteht)

**Admin**
- A1 Terminübersicht mit Ampel: grün = voll besetzt, gelb = Minimum knapp erreicht, rot = unterbesetzt
- A2 Person einem Termin/Bereich zuordnen; Auswahlliste zeigt zuerst Personen mit passender Präferenz
- A3 Warnung, wenn ein Kinderdienst keinen Leiter hat
- A4 Personen anlegen, deaktivieren, Leiter-Eigenschaft setzen
- A5 Termine anlegen (Sonntage automatisch, Sondertermine manuell)

**Allgemein**
- G1 Funktioniert auf dem Handy (die meisten werden es dort öffnen)
- G2 Änderungen sind für alle sichtbar, sobald die Seite neu geladen wird
- G3 Ladezeit unter 2 Sekunden

## Bewusst nicht in V1

Nicht weil es schlecht wäre, sondern damit V1 fertig wird:

- Automatische Einteilung per Algorithmus (der Mensch plant besser und akzeptierter)
- E-Mail- oder Push-Erinnerungen
- Tauschbörse ("ich kann nicht, wer übernimmt?")
- Abwesenheiten/Urlaub eintragen
- Kalender-Export (iCal)
- Historie/Statistik "wer hat wie oft gedient"
- Login pro Person

Alles davon steht in `06-roadmap.md` und ist nachrüstbar – das Datenmodell steht dem nicht im Weg.

## Nicht-Ziele (dauerhaft)

- Kein Ersatz für Absprache. Die App zeigt den Stand, sie ersetzt kein Gespräch.
- Keine personenbezogenen Daten außer Vornamen.
- Kein Anspruch auf Ausfallsicherheit. Wenn Supabase mal weg ist, gibt es den Plan als Backup-Datei.
