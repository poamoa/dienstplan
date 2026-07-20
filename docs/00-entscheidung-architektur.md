# 00 – Architekturentscheidung (die ehrliche Prüfung)

Stand: Juli 2026

## Kurzfassung

Der Ansatz **statische Seite auf GitHub Pages + Supabase als Datenbank** ist für diesen Zweck tragfähig.
Drei Dinge werden gegenüber der ersten Idee korrigiert:

1. **Ein gemeinsames Team-Passwort statt gar keinem Login.**
2. **Mehrere kleine Dateien statt einer einzigen riesigen `index.html`.**
3. **Backup und Keep-Alive gehören von Tag 1 dazu, nicht "später".**

---

## 1. Zuerst die unbequeme Frage: selbst bauen oder fertig nehmen?

Selbst bauen ist nicht automatisch die richtige Antwort. Geprüft wurden:

| Option | Passt? | Bewertung |
|---|---|---|
| **ChurchTools** | Funktional ja | Deutschsprachig, hat Dienstpläne, Anfragen, App, Erinnerungen. Kostet aber Geld (Preis nach Personenzahl) und bringt sehr viel mit, was ihr nicht braucht. Wer schon ChurchTools hat, sollte **nicht** selbst bauen. |
| **Planning Center Services** | Teilweise | Kann Ehrenamtliche nach Präferenzen einplanen. Englisch, modulare Preise – der kostenlose Einstieg ist begrenzt, und die Kosten steigen mit den Modulen. |
| **Google Sheets + Formulare** | Notlösung | Kostenlos und sofort da, aber genau das Problem, das ihr schon habt: unübersichtlich, keine persönliche Ansicht, keine Regeln. |
| **Doodle / Nuudel** | Nein | Kann Terminabfrage, aber keine Rollen, keine Besetzungsregeln, keine Dauerübersicht. |
| **Eigenbau (dieser Plan)** | Ja | Genau euer Zuschnitt, 0 € laufende Kosten, ihr behaltet die Daten. Preis: ihr seid selbst für Pflege verantwortlich. |

**Fazit:** Eigenbau ist vertretbar, weil euer Bedarf klein und sehr spezifisch ist (7 feste Bereiche, eine feste Regel, ein Termin pro Woche). Genau in dieser Nische sind fertige Systeme entweder zu groß oder zu teuer.

**Aber ehrlich:** Der größte Kostenpunkt beim Eigenbau ist nicht Geld, sondern **eine Person, die sich zuständig fühlt**. Wenn diese Person wegfällt, steht das Ding. Deshalb: Dokumentation (dieses Repo) + eine benannte Vertretung + jederzeit exportierbare Daten. Siehe `05-betrieb-wartung.md`.

---

## 2. Trägt GitHub Pages + Supabase wirklich?

### Ja, aus diesen Gründen

- GitHub Pages hostet statische Dateien kostenlos und stabil.
- Supabase Free bietet 500 MB Datenbank und 50.000 monatlich aktive Nutzer – ihr braucht davon einen Bruchteil. Bei ca. 30 Mitarbeitern und 52 Terminen pro Jahr reden wir über wenige tausend Datenzeilen.
- Kommerzielle wie private Nutzung ist auf dem Free-Plan erlaubt, keine Kreditkarte nötig.
- Kein Build-Prozess, kein Server, kein Framework. Wer HTML lesen kann, kann das pflegen.

### Die echten Haken – und was wir dagegen tun

| Haken | Was passiert | Gegenmaßnahme |
|---|---|---|
| **Projekt pausiert nach 7 Tagen Inaktivität** | App ist offline, bis jemand im Supabase-Dashboard auf "Restore" klickt | GitHub-Action pingt alle 3 Tage. Bei wöchentlicher Nutzung sowieso unwahrscheinlich. |
| **Keine automatischen Backups im Free-Plan** | Datenverlust wäre endgültig | Nächtlicher Export per GitHub-Action ins Repo. Klein genug, dass das problemlos geht. |
| **Der Supabase-Key steht sichtbar in der Seite** | Das ist normal und so vorgesehen – aber nur, wenn die Datenbank-Regeln (RLS) richtig gesetzt sind | RLS-Skript in `sql/03_rls.sql`, plus Punkt 3 unten |
| **Pages-Repo ist öffentlich** | Jeder, der den Link kennt, findet die Seite | Punkt 3 unten |
| **Limits können sich ändern** | Supabase hat Preise in der Vergangenheit mehrfach angepasst | Datenmodell ist simpler Postgres – notfalls in einer Stunde zu Neon o. ä. umgezogen. Kein Lock-in. |

---

## 3. Korrektur 1: Ein gemeinsames Team-Passwort

Deine ursprüngliche Idee war "nur Name auswählen, kein Passwort". Das ist bequem – aber es bedeutet in der Konsequenz:

> Jeder, der die URL kennt oder zufällig findet, kann alle Namen und Dienstpläne lesen, sich als beliebige Person eintragen, andere austragen oder alles löschen.

Das ist kein theoretisches Risiko: Die Seite steht öffentlich im Netz, und Suchmaschinen finden GitHub-Pages-Seiten.

**Der Kompromiss:** Ein **einziges gemeinsames Passwort für die ganze Gemeinde** (technisch: ein Supabase-Auth-Konto, z. B. `team@gemeinde.de`).

- Man gibt das Passwort **einmal** ein, danach merkt sich der Browser die Anmeldung.
- Danach wie geplant: einfach den eigenen Namen aus einer Liste wählen. Kein Passwort pro Person.
- Die Datenbank akzeptiert Zugriffe nur von Angemeldeten. Fremde sehen nichts.
- Aufwand für die Nutzer: nahezu null. Aufwand für uns: eine Zeile mehr Code.

**Was das nicht leistet:** Innerhalb des Teams kann sich weiterhin theoretisch jeder als jeder ausgeben. Für eine Gemeinde ist das in Ordnung – wir schützen gegen Fremde und Zufallsfunde, nicht gegen die eigenen Leute. Wer echten Schutz pro Person will, braucht E-Mail-Login (siehe Roadmap).

**Datensparsamkeit als zweite Sicherung:** In der Datenbank stehen nur Vornamen (+ ggf. erster Buchstabe des Nachnamens) und Dienste. **Keine Adressen, keine Telefonnummern, keine Geburtsdaten, keine Bilder.** Damit ist ein Leck maximal peinlich, aber nicht schädlich. Das ist zugleich der einfachste Weg, DSGVO-Fragen klein zu halten.

---

## 4. Korrektur 2: Nicht alles in eine Datei

Die Idee "eine `index.html`, fertig" klingt schlank, wird aber real ca. 1.500–2.000 Zeilen. Änderungen daran sind mühsam und fehleranfällig – gerade wenn ihr in einem halben Jahr etwas nachjustiert.

Aufteilung, die trotzdem ohne Build-Prozess auskommt:

```
index.html    – Gerüst und Struktur
app.css       – Aussehen
app.js        – Logik
config.js     – Supabase-Zugangsdaten (die einzige Datei, die man beim Umzug anfasst)
```

Vier Dateien statt einer. GitHub Pages ist das egal, ihr habt weiterhin keinen Build-Schritt – aber Fehlersuche und spätere Änderungen werden erheblich einfacher.

---

## 5. Korrektur 3: Betrieb ist Teil des Projekts

Erfahrungsgemäß scheitern solche Projekte nicht an der Technik, sondern daran, dass nach drei Monaten niemand mehr weiß, wie man einen Namen hinzufügt. Deshalb gehören dazu:

- **Backup ab Tag 1** (nicht "wenn wir mal Zeit haben")
- **Diese Dokumentation**, die mitwächst
- **Zwei Skills** (`skills/`), mit denen du in Zukunft mit Claude gezielt Änderungen machen kannst, ohne dass die ganze Vorgeschichte neu erklärt werden muss
- **Eine benannte Vertretung**

---

## 6. Das größte Risiko ist nicht technisch

Die App kann perfekt sein und trotzdem scheitern, weil die Leute weiter WhatsApp nutzen. Deshalb im Plan:

- Testlauf mit 3 Personen **vor** dem Rollout (Phase 5)
- Der Link kommt als Kachel auf den Handy-Startbildschirm – nicht als Lesezeichen, das keiner findet
- Die Bereichsleiter müssen sie benutzen wollen, sonst nutzt sie keiner
- Realistischer Erfolgsmaßstab: nach 6 Wochen tragen sich mehr als die Hälfte selbst ein. Wenn nicht, liegt es an der Bedienung – nicht an den Leuten.

---

## Entscheidungsprotokoll

| # | Entscheidung | Begründung | Datum |
|---|---|---|---|
| 1 | Eigenbau statt ChurchTools/Planning Center | Bedarf klein und spezifisch, 0 € laufend | 2026-07 |
| 2 | Supabase Free als Datenbank | Reicht um Faktor 100, kein Lock-in | 2026-07 |
| 3 | Ein gemeinsames Team-Passwort | Schützt gegen Fremde, kostet Nutzer fast nichts | 2026-07 |
| 4 | Vier Dateien statt einer HTML | Wartbarkeit, weiterhin kein Build | 2026-07 |
| 5 | Nur Vornamen speichern | Datensparsamkeit, DSGVO klein halten | 2026-07 |

_Neue Entscheidungen bitte hier ergänzen, damit in einem Jahr niemand rätselt, warum etwas so ist._
