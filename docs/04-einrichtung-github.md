# 04 – GitHub und GitHub Pages einrichten

## 1. Repository anlegen

1. Auf github.com: **New repository**
   - Name: `dienstplan`
   - **Public** (Pages ist für private Repos nur in bezahlten Plänen verfügbar)
   - Kein README ankreuzen – wir haben eins
2. Alle Dateien dieses Projekts hochladen (per **Add file → Upload files** reicht völlig; Drag & Drop des ganzen Ordners funktioniert).

**"Public" – ist das schlimm?** Nein, wenn zwei Dinge gelten:
- Im Repo stehen keine Personendaten. Es liegen nur Code und Doku dort, die Daten sind in Supabase.
- Der `service_role` key ist nicht im Repo.

Der `anon key` in `config.js` ist öffentlich unproblematisch, solange RLS aktiv ist (siehe `03-einrichtung-supabase.md`).

## 2. `config.js` ausfüllen

```js
// config.js – die einzige Datei mit projektspezifischen Werten
window.CONFIG = {
  SUPABASE_URL: "https://xxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi...",   // anon public key, NICHT service_role
};
```

## 3. Pages aktivieren

**Settings** → **Pages**:
- Source: **Deploy from a branch**
- Branch: `main`, Ordner `/ (root)`
- Save

Nach ein bis zwei Minuten ist die Seite erreichbar unter:
`https://DEIN-NUTZERNAME.github.io/dienstplan/`

## 4. Erste Prüfung

1. Seite öffnen → es kommt die Passwortabfrage
2. Team-Passwort eingeben → Namensauswahl erscheint mit den drei Testpersonen
3. Als "Test Admin" anmelden → Admin-Ansicht sichtbar
4. Im **privaten Fenster** die URL öffnen, **kein** Passwort eingeben → man darf **nichts** sehen. Wenn doch Daten auftauchen: RLS prüfen.

## 5. Auf dem Handy einrichten (für alle Mitarbeiter)

Das ist der Schritt, der über Erfolg oder Nichtnutzung entscheidet. Bitte in der Anleitung ans Team mitschicken:

**iPhone (Safari):** Seite öffnen → Teilen-Symbol → *Zum Home-Bildschirm*
**Android (Chrome):** Seite öffnen → ⋮ → *Zum Startbildschirm hinzufügen*

Danach sieht es aus wie eine App und wird auch so benutzt.

## 6. Änderungen später

Datei im Browser auf GitHub öffnen → Stift-Symbol → ändern → **Commit changes**. Nach ca. einer Minute ist die Seite aktualisiert.

**Vor jeder Änderung:** kurz in `07-aenderungslog.md` notieren, was und warum. Dauert 20 Sekunden und spart in einem Jahr eine Stunde.

## 7. Erledigt-Haken

- [ ] Repo `dienstplan` angelegt, Dateien hochgeladen
- [ ] `config.js` mit URL und anon key gefüllt
- [ ] Pages aktiv, Seite lädt
- [ ] Test im privaten Fenster: ohne Passwort keine Daten sichtbar
- [ ] Kachel auf dem eigenen Handy angelegt und ausprobiert
