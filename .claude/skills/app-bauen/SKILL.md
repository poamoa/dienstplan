---
name: app-bauen
description: Baut die Dienstplan-App (index.html, app.css, app.js) exakt nach docs/08-app-spezifikation.md, testet sie gegen die Abnahmekriterien und veröffentlicht sie. Nutzen bei /app-bauen, "bau die App", "erstelle die Oberfläche", "Phase 2" oder wenn index.html fehlt bzw. neu aufgebaut werden soll.
---

# App bauen (Phase 2)

## Vorgehen

1. **Spezifikation lesen:** `docs/08-app-spezifikation.md` vollständig, dazu `docs/02-datenmodell.md`. Bei Widerspruch gilt die Spezifikation; Abweichungswünsche des Nutzers vorher in der Spezifikation nachziehen, damit Doku und Code nicht auseinanderlaufen.
2. **Voraussetzung prüfen:** `config.js` muss existieren und gefüllt sein. Wenn nicht → zuerst `/setup`.
3. **Bauen:** genau drei Dateien – `index.html`, `app.css`, `app.js`. Kein Framework, kein Build, Supabase per CDN. Reihenfolge: Anmeldung → Meine Dienste → Eintragen (+Präferenzen-Overlay) → Plan → Verwaltung. Nach jedem Block kurz gegen die Spezifikation prüfen statt alles am Ende.
4. **Selbst testen:** alle 7 Abnahmekriterien aus der Spezifikation durchgehen. Kriterium 4 (Kinderdienst ohne Leiter niemals grün) ist das wichtigste – dafür notfalls Testdaten per SQL einspielen und danach wieder entfernen.
5. **Nutzer testen lassen:** `index.html` lokal im Browser öffnen lassen (funktioniert direkt von der Festplatte). Erst nach seinem Okay committen und pushen.
6. **Abschluss:** Eintrag in `docs/07-aenderungslog.md`, README-Checkliste Phase 2 abhaken, an Phase 5 erinnern (Testlauf mit 3 Personen, eine Woche – nicht überspringen).

## Grenzen

- Keine Funktionen einbauen, die in `docs/01-anforderungen.md` unter „Bewusst nicht in V1" stehen, auch wenn es verlockend ist. Bei Wunsch des Nutzers: auf die Roadmap verweisen und fragen, ob V1 wirklich wachsen soll.
- Eiserne Regeln aus `CLAUDE.md` gelten uneingeschränkt (RLS, keine Kontaktdaten, vier Dateien, Fehler sichtbar).
