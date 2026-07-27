/* app.js – Dienstplan Gemeinde
 *
 * Vanilla JS, kein Build. Aufbau der Datei:
 *   1. Konstanten und kleine Helfer
 *   2. Anmeldung und Personenwahl
 *   3. Daten laden
 *   4. Die vier Reiter
 *   5. Präferenz-Overlay
 *   6. Start
 *
 * Grundsatz aus docs/08: nach jedem Schreibvorgang alles neu laden. Die
 * Datenmengen sind winzig, ein lokaler Zustandsabgleich lohnt sich nicht und
 * wäre die häufigste Fehlerquelle.
 */

// ---------------------------------------------------------------- 1. Basis

// E-Mail des gemeinsamen Team-Kontos. Muss zu dem Konto passen, das im Setup
// unter Authentication -> Users angelegt wurde. Nicht in config.js, weil
// scripts/setup.sh diese Datei komplett überschreibt.
const TEAM_EMAIL = "team@gemeinde.de";

const TERMINE_ANSICHT = 8;   // Reiter "Eintragen"
const TERMINE_PLAN = 12;     // Reiter "Plan" (etwas weiter voraus, für den Filter)
const TERMINE_ADMIN = 12;    // Reiter "Verwaltung"

const SPEICHER_PERSON = "dienstplan_person_id";
// Der Adminbereich ist absichtlich versteckt: er wird pro Gerät durch eine
// Geste (5× auf den eigenen Namen tippen) freigeschaltet, nicht durch die Wahl
// einer Person. Das ist – wie in sql/03_rls.sql dokumentiert – nur eine
// Sicht-Sperre gegen versehentlichen Zugriff, kein echter Schutz.
const SPEICHER_ADMIN = "dienstplan_admin";
// Gewählter Dienst-Filter im Plan-Reiter (bereich_id oder "" = alle), pro Gerät.
const SPEICHER_PLANFILTER = "dienstplan_planfilter";

const STATUS_TEXT = { rot: "unterbesetzt", gelb: "knapp", gruen: "besetzt" };

let sb = null;               // Supabase-Client
let personId = null;         // gewählte Person (localStorage)
let ich = null;              // Datensatz dieser Person
let aktiverTab = "meine";
let aktiverUnterTab = "ampel";
let editTerminId = null;        // welcher Termin gerade im Bearbeiten-Modus ist
let planFilter = "";            // Dienst-Filter im Plan (bereich_id oder "")

// Daten, bei jedem Laden frisch
let bereiche = [];
let personen = [];
let termine = [];
let einteilungen = [];
let besetzung = new Map();   // "terminId|bereichId" -> Zeile aus v_besetzung
let meinePraeferenzen = [];

const $ = (id) => document.getElementById(id);

/** localStorage kann werfen (blockierte Cookies, abgeschottete Umgebungen).
 *  Ohne Absicherung bliebe die Seite dann komplett weiß. Fällt auf einen
 *  Speicher im Arbeitsspeicher zurück – dann muss man die Person eben bei
 *  jedem Start neu wählen, statt gar nichts zu sehen. */
const ersatzSpeicher = {};
const speicher = {
  lesen(schluessel) {
    try { return window.localStorage.getItem(schluessel); }
    catch { return ersatzSpeicher[schluessel] ?? null; }
  },
  schreiben(schluessel, wert) {
    try { window.localStorage.setItem(schluessel, wert); }
    catch { ersatzSpeicher[schluessel] = wert; }
  },
  loeschen(schluessel) {
    try { window.localStorage.removeItem(schluessel); }
    catch { delete ersatzSpeicher[schluessel]; }
  },
};

/** Ist der Adminbereich auf diesem Gerät freigeschaltet? */
function adminFrei() { return speicher.lesen(SPEICHER_ADMIN) === "1"; }

/** Element bauen. Text wird immer als textContent gesetzt, nie als HTML –
 *  Namen aus der Datenbank dürfen niemals als Markup interpretiert werden. */
function e(tag, attrs = {}, kinder = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "text") n.textContent = v;
    else if (k === "class") n.className = v;
    else if (k === "dataset") Object.assign(n.dataset, v);
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, "");
    else n.setAttribute(k, v);
  }
  for (const kind of [].concat(kinder)) {
    if (kind) n.appendChild(typeof kind === "string" ? document.createTextNode(kind) : kind);
  }
  return n;
}

function leeren(knoten) { while (knoten.firstChild) knoten.removeChild(knoten.firstChild); }

function fehlerZeigen(text) {
  $("fehler-text").textContent = text;
  $("fehler").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function fehlerVerbergen() { $("fehler").hidden = true; }

/** Einheitliche Behandlung von Supabase-Fehlern: sichtbar machen, nie schlucken. */
function melden(kontext, fehler) {
  console.error(kontext, fehler);
  const detail = fehler && fehler.message ? fehler.message : "unbekannter Fehler";
  fehlerZeigen(`${kontext}: ${detail}`);
}

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/** "2026-07-26" -> "So 26.07." – ohne Zeitzonen-Überraschungen. */
function datumKurz(iso) {
  const [j, m, t] = iso.split("-").map(Number);
  const d = new Date(j, m - 1, t);
  return `${WOCHENTAGE[d.getDay()]} ${String(t).padStart(2, "0")}.${String(m).padStart(2, "0")}.`;
}

/** Heutiges Datum als ISO, in lokaler Zeit (nicht UTC – sonst springt es abends). */
function heuteIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Ampelpunkt + Textform. Die Textform ist nicht Deko, sondern
 *  Barrierefreiheit: Farbe allein darf keine Information tragen. */
function ampel(zeile, b) {
  // Optionale Pools (mit_ampel = false, z. B. Band, allg. Helfer) tragen keine
  // Ampel – bei "unbestimmter Anzahl" gibt es kein Über-/Unterbesetzt.
  if (b && b.mit_ampel === false) return null;
  const s = (zeile && zeile.status) || "rot";
  return e("span", {
    class: `punkt ${s}`,
    text: "●",
    title: STATUS_TEXT[s] || s,
    "aria-label": STATUS_TEXT[s] || s,
  });
}

function belegungText(zeile, b) {
  if (!zeile) return "";
  // Ohne Ampel zählt nur, wer dabei ist – kein "x/min", kein "Leiter fehlt".
  if (b && b.mit_ampel === false) return zeile.anzahl ? `${zeile.anzahl} dabei` : "";
  let t = `${zeile.anzahl}/${zeile.min_personen}`;
  if (zeile.braucht_leiter && !zeile.leiter_da) t += " · Leiter fehlt";
  return t;
}

const bereichVon = (id) => bereiche.find((b) => b.id === id);
const personVon = (id) => personen.find((p) => p.id === id);
const terminVon = (id) => termine.find((t) => t.id === id);
const besetzungVon = (terminId, bereichId) => besetzung.get(`${terminId}|${bereichId}`);

// Sondertermine (Lobpreisabend, Leitertreffen, …): nur Info, kein Dienstplan,
// keine Ampel. Erkennbar an braucht_dienste = false.
const istInfoTermin = (t) => t.braucht_dienste === false;

// ------------------------------------------------------- 2. Anmeldung

function ansichtZeigen(name) {
  for (const a of ["anmeldung", "person", "app"]) {
    $(`ansicht-${a}`).hidden = a !== name;
  }
}

async function anmelden(ereignis) {
  ereignis.preventDefault();
  fehlerVerbergen();
  const knopf = $("knopf-anmelden");
  knopf.disabled = true;
  knopf.textContent = "Anmelden…";

  const { error } = await sb.auth.signInWithPassword({
    email: TEAM_EMAIL,
    password: $("passwort").value,
  });

  knopf.disabled = false;
  knopf.textContent = "Anmelden";

  if (error) {
    // Bewusst freundlich formuliert: der häufigste Fall ist ein Tippfehler,
    // nicht ein Angriff.
    fehlerZeigen(
      error.message && /invalid/i.test(error.message)
        ? "Das Passwort stimmt nicht. Bitte noch einmal versuchen – bei Bedarf beim Bereichsleiter nachfragen."
        : `Anmeldung fehlgeschlagen: ${error.message}`
    );
    return;
  }
  $("passwort").value = "";
  await nachAnmeldung();
}

async function abmelden() {
  await sb.auth.signOut();
  speicher.loeschen(SPEICHER_PERSON);
  personId = null;
  ich = null;
  ansichtZeigen("anmeldung");
}

/** Nach erfolgreicher Anmeldung: Person wählen oder direkt in die App. */
async function nachAnmeldung() {
  await kerndatenLaden();
  if (!personen.length) return;   // Fehler wurde bereits gemeldet

  personId = speicher.lesen(SPEICHER_PERSON);
  ich = personId ? personVon(personId) : null;

  if (!ich) {
    // Gespeicherte Person gibt es nicht mehr oder ist inaktiv -> neu wählen
    speicher.loeschen(SPEICHER_PERSON);
    personId = null;
    personenauswahlZeigen();
    return;
  }
  appZeigen();
}

function personenauswahlZeigen() {
  const liste = $("liste-personen");
  leeren(liste);
  for (const p of personen) {
    liste.appendChild(
      e("li", {}, [
        e("button", {
          type: "button",
          text: p.name,
          onclick: () => {
            personId = p.id;
            ich = p;
            speicher.schreiben(SPEICHER_PERSON, p.id);
            appZeigen();
          },
        }),
      ])
    );
  }
  ansichtZeigen("person");
}

function appZeigen() {
  $("fuss-name").textContent = ich.name;
  $("reiter-verwaltung").hidden = !adminFrei();
  if (aktiverTab === "verwaltung" && !adminFrei()) aktiverTab = "meine";
  ansichtZeigen("app");
  tabZeigen(aktiverTab);
}

// ----------------------------------------------------- 3. Daten laden

async function kerndatenLaden() {
  const [bErg, pErg] = await Promise.all([
    sb.from("bereiche").select("*"),
    sb.from("personen").select("*").eq("aktiv", true),
  ]);

  if (bErg.error) { melden("Bereiche konnten nicht geladen werden", bErg.error); return; }
  if (pErg.error) { melden("Personen konnten nicht geladen werden", pErg.error); return; }

  // Clientseitig sortieren: v_besetzung liefert kuerzel/sortierung nicht mit,
  // und die Sortierung einer Datenbank-Ansicht ist über die API ohnehin nicht
  // garantiert.
  bereiche = bErg.data.sort((a, b) => a.sortierung - b.sortierung || a.name.localeCompare(b.name, "de"));
  personen = pErg.data.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

/** Termine, Einteilungen und Besetzungsstand für die nächsten n Termine. */
async function planLaden(anzahl) {
  const heute = heuteIso();

  const tErg = await sb
    .from("termine")
    .select("*")
    .eq("abgesagt", false)
    .gte("datum", heute)
    .order("datum", { ascending: true })
    .limit(anzahl);

  if (tErg.error) { melden("Termine konnten nicht geladen werden", tErg.error); return false; }
  termine = tErg.data;

  if (!termine.length) { einteilungen = []; besetzung = new Map(); return true; }
  const ids = termine.map((t) => t.id);

  const [eErg, vErg] = await Promise.all([
    sb.from("einteilungen").select("*").in("termin_id", ids),
    sb.from("v_besetzung").select("*").in("termin_id", ids),
  ]);

  if (eErg.error) { melden("Einteilungen konnten nicht geladen werden", eErg.error); return false; }
  if (vErg.error) { melden("Besetzungsstand konnte nicht geladen werden", vErg.error); return false; }

  einteilungen = eErg.data;
  besetzung = new Map(vErg.data.map((z) => [`${z.termin_id}|${z.bereich_id}`, z]));
  return true;
}

async function praeferenzenLaden() {
  const { data, error } = await sb.from("praeferenzen").select("*").eq("person_id", personId);
  if (error) { melden("Präferenzen konnten nicht geladen werden", error); return false; }
  meinePraeferenzen = data;
  return true;
}

// -------------------------------------------------------- 4. Die Reiter

function tabZeigen(name) {
  // Verwaltung nur, wenn freigeschaltet – sonst zurück auf "Meine Dienste".
  if (name === "verwaltung" && !adminFrei()) name = "meine";
  aktiverTab = name;
  for (const t of ["meine", "eintragen", "plan", "verwaltung"]) {
    $(`tab-${t}`).hidden = t !== name;
  }
  for (const knopf of document.querySelectorAll("#reiter button")) {
    knopf.classList.toggle("aktiv", knopf.dataset.tab === name);
  }
  window.scrollTo({ top: 0 });

  if (name === "meine") tabMeine();
  else if (name === "eintragen") tabEintragen();
  else if (name === "plan") tabPlan();
  else if (name === "verwaltung") tabVerwaltung();
}

/* --- Reiter 1: Meine Dienste ---------------------------------------- */

async function tabMeine() {
  const ziel = $("meine-inhalt");
  ziel.className = "lade";
  ziel.textContent = "Lade…";

  // Weiter voraus schauen als die Eintragen-Ansicht: eigene Dienste will man
  // auch dann sehen, wenn sie zwei Monate entfernt sind.
  if (!(await planLaden(TERMINE_ADMIN))) return;

  const meine = einteilungen
    .filter((x) => x.person_id === personId)
    .map((x) => ({ ...x, termin: terminVon(x.termin_id) }))
    .filter((x) => x.termin)
    .sort((a, b) => a.termin.datum.localeCompare(b.termin.datum));

  ziel.className = "";
  leeren(ziel);

  if (!meine.length) {
    ziel.appendChild(e("p", { class: "leer", text: "Du bist aktuell für keine Dienste eingetragen." }));
    return;
  }

  for (const x of meine) {
    const b = bereichVon(x.bereich_id);
    ziel.appendChild(
      e("div", { class: "karte" }, [
        e("div", { class: "zeile" }, [
          e("div", { class: "wachsen" }, [
            e("div", {}, [
              e("strong", { text: datumKurz(x.termin.datum) }),
              " · ",
              b ? b.name : "Unbekannter Bereich",
              x.als_leiter ? e("span", { class: "abzeichen", text: "Leiter" }) : null,
            ]),
            x.termin.titel ? e("div", { class: "namen", text: x.termin.titel }) : null,
          ]),
          e("button", {
            type: "button",
            class: "knopf-klein",
            text: "Austragen",
            onclick: () => austragen(x),
          }),
        ]),
      ])
    );
  }
}

/** Austragen mit Warnung, falls der Dienst dadurch unterbesetzt wird. */
async function austragen(eintrag) {
  const zeile = besetzungVon(eintrag.termin_id, eintrag.bereich_id);
  const b = bereichVon(eintrag.bereich_id);

  // Wird der Bereich durch das Austragen rot? Nachrechnen wie in docs/02.
  let wirdRot = false;
  if (zeile && b && b.mit_ampel !== false) {
    const anzahlDanach = zeile.anzahl - 1;
    const leiterDanach = eintrag.als_leiter
      ? einteilungen.some((x) =>
          x.termin_id === eintrag.termin_id &&
          x.bereich_id === eintrag.bereich_id &&
          x.person_id !== eintrag.person_id &&
          x.als_leiter)
      : zeile.leiter_da;
    wirdRot = anzahlDanach < zeile.min_personen || (b.braucht_leiter && !leiterDanach);
  }

  const frage = wirdRot
    ? "Dadurch ist der Dienst unterbesetzt. Trotzdem austragen? Bitte sag deinem Bereichsleiter Bescheid."
    : "Wirklich austragen?";
  if (!confirm(frage)) return;

  const { error } = await sb.from("einteilungen").delete().eq("id", eintrag.id);
  if (error) { melden("Austragen fehlgeschlagen", error); return; }
  fehlerVerbergen();
  tabZeigen(aktiverTab);
}

/* --- Reiter 2: Eintragen -------------------------------------------- */

async function tabEintragen() {
  const ziel = $("eintragen-inhalt");
  ziel.className = "lade";
  ziel.textContent = "Lade…";

  if (!(await praeferenzenLaden())) return;
  if (!(await planLaden(TERMINE_ANSICHT))) return;

  ziel.className = "";
  leeren(ziel);

  // Angeboten werden: deine Präferenzen + Pools, die für alle offen sind
  // (z. B. allgemeine Helfer – dafür braucht es keine Präferenz).
  const meineBereiche = bereiche.filter(
    (b) => b.offen_fuer_alle || meinePraeferenzen.some((p) => p.bereich_id === b.id)
  );

  if (!meineBereiche.length) {
    ziel.appendChild(
      e("div", { class: "karte" }, [
        e("p", { text: "Du hast noch nicht angegeben, welche Dienste für dich infrage kommen. Danach siehst du hier die offenen Plätze." }),
        e("button", { type: "button", class: "knopf", text: "Präferenzen festlegen", onclick: overlayOeffnen }),
      ])
    );
    return;
  }

  if (!termine.length) {
    ziel.appendChild(e("p", { class: "leer", text: "Es sind noch keine Termine angelegt." }));
    return;
  }

  // Sondertermine haben keine Dienste – hier nicht anzeigen.
  const eintragbar = termine.filter((t) => !istInfoTermin(t));
  if (!eintragbar.length) {
    ziel.appendChild(e("p", { class: "leer", text: "In nächster Zeit stehen keine Termine zum Eintragen an." }));
    return;
  }

  for (const t of eintragbar) {
    const karte = e("div", { class: "karte" }, [
      e("div", { class: "karte-kopf" }, [
        e("span", { class: "datum", text: datumKurz(t.datum) }),
        t.titel ? e("span", { class: "titel", text: t.titel }) : null,
      ]),
    ]);

    for (const b of meineBereiche) {
      const zeile = besetzungVon(t.id, b.id);
      const meiner = einteilungen.find(
        (x) => x.termin_id === t.id && x.bereich_id === b.id && x.person_id === personId
      );
      const pref = meinePraeferenzen.find((p) => p.bereich_id === b.id);

      karte.appendChild(
        e("div", { class: "zeile" }, [
          ampel(zeile, b),
          e("div", { class: "wachsen" }, [
            e("div", { text: b.name }),
            e("div", { class: "namen", text: belegungText(zeile, b) }),
          ]),
          meiner
            ? e("button", {
                type: "button",
                class: "knopf-klein",
                text: "Austragen",
                onclick: () => austragen(meiner),
              })
            : e("button", {
                type: "button",
                class: "knopf-klein primaer",
                text: "Eintragen",
                onclick: () => selbstEintragen(t, b, pref),
              }),
        ])
      );
    }
    ziel.appendChild(karte);
  }
}

async function selbstEintragen(termin, bereich, pref) {
  // Wo die Person leiten darf, erst fragen WIE sie sich einträgt – aber mit
  // echten, beschrifteten Buttons statt einem OK/Abbrechen-Dialog.
  if (bereich.braucht_leiter && pref && pref.kann_leiten) {
    rolleWaehlen(termin, bereich);
    return;
  }
  await eintragSpeichern(termin, bereich, false);
}

/** Kleines Sheet: als Leiter oder als Mitarbeiter eintragen. */
function rolleWaehlen(termin, bereich) {
  const inhalt = e("div", {}, [
    e("p", { class: "hinweis", text: "Wie möchtest du dich eintragen?" }),
    e("button", {
      type: "button",
      class: "knopf",
      text: "Als Leiter eintragen",
      onclick: async () => { overlaySchliessen(); await eintragSpeichern(termin, bereich, true); },
    }),
    e("button", {
      type: "button",
      class: "knopf zweit",
      text: "Als Mitarbeiter eintragen",
      onclick: async () => { overlaySchliessen(); await eintragSpeichern(termin, bereich, false); },
    }),
  ]);
  overlayZeigen(`${bereich.name} · ${datumKurz(termin.datum)}`, inhalt);
}

async function eintragSpeichern(termin, bereich, alsLeiter) {
  const { error } = await sb.from("einteilungen").insert({
    termin_id: termin.id,
    bereich_id: bereich.id,
    person_id: personId,
    als_leiter: alsLeiter,
    quelle: "selbst",
  });
  if (error) { melden("Eintragen fehlgeschlagen", error); return; }
  fehlerVerbergen();
  tabZeigen(aktiverTab);
}

/* --- Reiter 3: Plan ------------------------------------------------- */

async function tabPlan() {
  const ziel = $("plan-inhalt");
  ziel.className = "lade";
  ziel.textContent = "Lade…";

  if (!(await planLaden(TERMINE_PLAN))) return;

  ziel.className = "";
  planRender();
}

/** Zeichnet den Plan aus den bereits geladenen Daten – ohne Nachladen, damit
 *  das Umschalten des Filters sofort reagiert. */
function planRender() {
  const ziel = $("plan-inhalt");
  leeren(ziel);
  ziel.appendChild(planFilterLeiste());

  if (!termine.length) {
    ziel.appendChild(e("p", { class: "leer", text: "Es sind noch keine Termine angelegt." }));
    return;
  }

  const gewaehlt = bereichVon(planFilter);       // undefined, wenn "alle" oder Bereich weg
  const welche = gewaehlt ? [gewaehlt] : bereiche;
  const zeigeInfos = !gewaehlt;                  // Sondertermine nur in der Gesamtansicht

  if (gewaehlt) {
    ziel.appendChild(e("div", { class: "gruppe-titel", text: gewaehlt.name + " – kommende Termine" }));
  }

  let gezeigt = 0;
  for (const t of termine) {
    if (istInfoTermin(t)) {
      if (zeigeInfos) ziel.appendChild(infoKarte(t));
      continue;
    }
    ziel.appendChild(planKarte(t, welche, false));
    gezeigt++;
  }

  if (gewaehlt && !gezeigt) {
    ziel.appendChild(e("p", { class: "leer", text: "Für diesen Dienst stehen keine Termine an." }));
  }
}

/** Auswahlleiste zum Filtern des Plans nach einem einzelnen Dienst. */
function planFilterLeiste() {
  const sel = e("select", { "aria-label": "Plan nach Dienst filtern" });
  sel.appendChild(e("option", { value: "", text: "Alle Dienste" }));
  for (const b of bereiche) sel.appendChild(e("option", { value: b.id, text: b.name }));
  sel.value = bereichVon(planFilter) ? planFilter : "";

  sel.addEventListener("change", () => {
    planFilter = sel.value;
    speicher.schreiben(SPEICHER_PLANFILTER, planFilter);
    planRender();
  });

  return e("div", { class: "plan-filter" }, [
    e("label", { class: "plan-filter-label", text: "Dienst" }),
    sel,
  ]);
}

/** Karte für einen Sondertermin: nur Datum, Titel, optional Notiz. Keine Ampel. */
function infoKarte(t) {
  return e("div", { class: "karte karte-info" }, [
    e("div", { class: "karte-kopf" }, [
      e("span", { class: "datum", text: datumKurz(t.datum) }),
      e("span", { class: "abzeichen", text: "Sondertermin" }),
    ]),
    e("div", { class: "zeile" }, [
      e("div", { class: "wachsen" }, [
        e("div", { text: t.titel || "Sondertermin" }),
        t.notiz ? e("div", { class: "namen", text: t.notiz }) : null,
      ]),
    ]),
  ]);
}

/** Eine Terminkarte mit allen Bereichen. Wird von Plan und Verwaltung genutzt. */
function planKarte(t, welcheBereiche, anklickbar) {
  const karte = e("div", { class: "karte" }, [
    e("div", { class: "karte-kopf" }, [
      e("span", { class: "datum", text: datumKurz(t.datum) }),
      t.titel ? e("span", { class: "titel", text: t.titel }) : null,
    ]),
  ]);

  for (const b of welcheBereiche) {
    const zeile = besetzungVon(t.id, b.id);
    const drin = einteilungen
      .filter((x) => x.termin_id === t.id && x.bereich_id === b.id)
      .map((x) => {
        const p = personVon(x.person_id);
        return (p ? p.name : "?") + (x.als_leiter ? " ★" : "");
      })
      .sort((a, b2) => a.localeCompare(b2, "de"));

    karte.appendChild(
      e("div", { class: "zeile" }, [
        ampel(zeile, b),
        e("div", { class: "wachsen" }, [
          e("div", {}, [
            e("strong", { text: b.kuerzel }),
            " ",
            e("span", { class: "status-text", text: belegungText(zeile, b) }),
          ]),
          e("div", {
            class: drin.length ? "namen" : "namen offen",
            text: drin.length ? drin.join(", ") : "noch niemand",
          }),
        ]),
      ])
    );
  }

  if (anklickbar) {
    karte.appendChild(
      e("button", {
        type: "button",
        class: "knopf-klein",
        text: "Einteilen",
        onclick: () => adminTerminDetail(t.id),
      })
    );
  }
  return karte;
}

/* --- Reiter 4: Verwaltung ------------------------------------------- */

async function tabVerwaltung() {
  for (const knopf of document.querySelectorAll(".unterreiter button")) {
    knopf.classList.toggle("aktiv", knopf.dataset.unter === aktiverUnterTab);
  }
  if (aktiverUnterTab === "ampel") await adminAmpel();
  else if (aktiverUnterTab === "personen") await adminPersonen();
  else await adminTermine();
}

async function adminAmpel() {
  const ziel = $("verwaltung-inhalt");
  ziel.className = "lade";
  ziel.textContent = "Lade…";

  if (!(await planLaden(TERMINE_ADMIN))) return;
  // Für die Sortierung des "+ Person"-Dropdowns in der Detailansicht.
  if (!(await allePraeferenzenLaden())) return;

  ziel.className = "";
  leeren(ziel);

  if (!termine.length) {
    ziel.appendChild(e("p", { class: "leer", text: "Es sind noch keine Termine angelegt." }));
    return;
  }

  // Nur reguläre Termine haben eine Ampel; Sondertermine werden nie "rot".
  const istRot = (t) => !istInfoTermin(t) && bereiche.some((b) => {
    if (b.mit_ampel === false) return false;   // optionale Pools nie als Mangel werten
    const z = besetzungVon(t.id, b.id);
    return z && z.status === "rot";
  });

  const rote = termine.filter(istRot);
  const roteIds = new Set(rote.map((t) => t.id));
  const rest = termine.filter((t) => !roteIds.has(t.id));   // chronologisch, inkl. Sondertermine

  const zeichne = (t) => istInfoTermin(t) ? infoKarte(t) : planKarte(t, bereiche, true);

  if (rote.length) {
    ziel.appendChild(e("div", { class: "gruppe-titel warnung", text: "Braucht Aufmerksamkeit" }));
    for (const t of rote) ziel.appendChild(planKarte(t, bereiche, true));
  }
  if (rest.length) {
    ziel.appendChild(e("div", { class: "gruppe-titel", text: rote.length ? "Übrige Termine" : "Alle Termine" }));
    for (const t of rest) ziel.appendChild(zeichne(t));
  }
}

/** Detailansicht eines Termins: einteilen, entfernen, Leiter setzen. */
function adminTerminDetail(terminId) {
  const t = terminVon(terminId);
  if (!t) return;

  const inhalt = e("div");

  for (const b of bereiche) {
    const zeile = besetzungVon(t.id, b.id);
    const drin = einteilungen.filter((x) => x.termin_id === t.id && x.bereich_id === b.id);

    const block = e("div", { class: "karte" }, [
      e("div", { class: "zeile" }, [
        ampel(zeile, b),
        e("div", { class: "wachsen" }, [
          e("h3", { text: b.name }),
          e("div", { class: "namen", text: belegungText(zeile, b) }),
        ]),
      ]),
    ]);

    for (const x of drin) {
      const p = personVon(x.person_id);
      block.appendChild(
        e("div", { class: "zeile" }, [
          e("div", { class: "wachsen" }, [
            e("div", { text: p ? p.name : "Unbekannt" }),
            b.braucht_leiter
              ? e("label", { class: "mit-box" }, [
                  e("input", {
                    type: "checkbox",
                    checked: x.als_leiter,
                    onchange: (ev) => leiterSetzen(x, ev.target.checked),
                  }),
                  " ist hier Leiter",
                ])
              : null,
          ]),
          e("button", {
            type: "button",
            class: "knopf-klein",
            text: "Entfernen",
            onclick: () => adminEntfernen(x),
          }),
        ])
      );
    }

    block.appendChild(personDropdown(t, b, drin));
    inhalt.appendChild(block);
  }

  overlayZeigen(`${datumKurz(t.datum)}${t.titel ? " · " + t.titel : ""}`, inhalt);
}

/** Dropdown "+ Person": Präferenz gewichtung=1, dann 2, dann der Rest. */
function personDropdown(t, b, drin) {
  const drinIds = new Set(drin.map((x) => x.person_id));
  const anDiesemTermin = new Set(
    einteilungen.filter((x) => x.termin_id === t.id).map((x) => x.person_id)
  );

  const auswahl = e("select");
  auswahl.appendChild(e("option", { value: "", text: "+ Person hinzufügen" }));

  const beschriften = (p) => {
    // Wer an diesem Termin schon woanders eingeteilt ist, wird markiert –
    // sonst teilt man dieselbe Person versehentlich doppelt ein.
    if (!anDiesemTermin.has(p.id)) return p.name;
    const anderer = einteilungen.find((x) => x.termin_id === t.id && x.person_id === p.id);
    const ab = anderer ? bereichVon(anderer.bereich_id) : null;
    return `${p.name} (bereits im ${ab ? ab.kuerzel : "Dienst"})`;
  };

  const frei = personen.filter((p) => !drinIds.has(p.id));
  const prefFuer = (p, g) =>
    allePraeferenzen.some(
      (x) => x.person_id === p.id && x.bereich_id === b.id && x.gewichtung === g
    );

  const gern = frei.filter((p) => prefFuer(p, 1));
  const gehtAuch = frei.filter((p) => prefFuer(p, 2));
  const ohne = frei.filter((p) => !gern.includes(p) && !gehtAuch.includes(p));

  for (const [titel, gruppe] of [["mache ich gern", gern], ["geht auch", gehtAuch], ["ohne Präferenz", ohne]]) {
    if (!gruppe.length) continue;
    const g = e("optgroup", { label: titel });
    for (const p of gruppe) g.appendChild(e("option", { value: p.id, text: beschriften(p) }));
    auswahl.appendChild(g);
  }

  auswahl.addEventListener("change", async (ev) => {
    const id = ev.target.value;
    if (!id) return;
    ev.target.disabled = true;
    await adminEinteilen(t, b, id);
  });

  return e("div", { class: "zeile" }, [auswahl]);
}

// Präferenzen ALLER Personen – nur der Admin braucht sie, für die Sortierung
// des Dropdowns.
let allePraeferenzen = [];

async function allePraeferenzenLaden() {
  const { data, error } = await sb.from("praeferenzen").select("*");
  if (error) { melden("Präferenzen konnten nicht geladen werden", error); return false; }
  allePraeferenzen = data;
  return true;
}

async function adminEinteilen(t, b, pId) {
  const { error } = await sb.from("einteilungen").insert({
    termin_id: t.id,
    bereich_id: b.id,
    person_id: pId,
    als_leiter: false,
    quelle: "admin",
  });
  if (error) { melden("Einteilen fehlgeschlagen", error); return; }
  fehlerVerbergen();
  await adminNeuZeichnen(t.id);
}

async function adminEntfernen(eintrag) {
  const { error } = await sb.from("einteilungen").delete().eq("id", eintrag.id);
  if (error) { melden("Entfernen fehlgeschlagen", error); return; }
  fehlerVerbergen();
  await adminNeuZeichnen(eintrag.termin_id);
}

async function leiterSetzen(eintrag, wert) {
  const { error } = await sb.from("einteilungen").update({ als_leiter: wert }).eq("id", eintrag.id);
  if (error) { melden("Ändern fehlgeschlagen", error); return; }
  fehlerVerbergen();
  await adminNeuZeichnen(eintrag.termin_id);
}

/** Nach jeder Admin-Änderung: Daten neu holen und das Overlay neu aufbauen. */
async function adminNeuZeichnen(terminId) {
  if (!(await planLaden(TERMINE_ADMIN))) return;
  adminTerminDetail(terminId);
}

async function adminPersonen() {
  const ziel = $("verwaltung-inhalt");
  ziel.className = "lade";
  ziel.textContent = "Lade…";

  // Hier bewusst ALLE Personen, auch inaktive – man muss sie wieder
  // aktivieren können.
  const { data, error } = await sb.from("personen").select("*");
  if (error) { melden("Personen konnten nicht geladen werden", error); return; }
  const alle = data.sort((a, b) => a.name.localeCompare(b.name, "de"));

  ziel.className = "";
  leeren(ziel);

  const feld = e("input", { type: "text", placeholder: "Name, z. B. Anna M." });
  const admin = e("input", { type: "checkbox" });

  ziel.appendChild(
    e("div", { class: "karte" }, [
      e("h3", { text: "Person anlegen" }),
      feld,
      e("label", { class: "mit-box" }, [admin, " darf einteilen (Admin)"]),
      e("button", {
        type: "button",
        class: "knopf",
        text: "Anlegen",
        onclick: async () => {
          const name = feld.value.trim();
          if (!name) { fehlerZeigen("Bitte einen Namen eingeben."); return; }
          const { error: f } = await sb.from("personen").insert({ name, ist_admin: admin.checked });
          if (f) {
            melden(/duplicate|unique/i.test(f.message || "")
              ? "Diesen Namen gibt es schon"
              : "Anlegen fehlgeschlagen", f);
            return;
          }
          fehlerVerbergen();
          await kerndatenLaden();
          adminPersonen();
        },
      }),
      e("p", { class: "namen", text: "Nur der Name. Keine Telefonnummern, Adressen oder Geburtsdaten – das ist Absicht." }),
    ])
  );

  const liste = e("div", { class: "karte" }, [e("h3", { text: "Alle Personen" })]);
  for (const p of alle) {
    liste.appendChild(
      e("div", { class: "zeile" }, [
        e("div", { class: "wachsen" }, [
          e("div", {}, [p.name, p.ist_admin ? e("span", { class: "abzeichen", text: "Admin" }) : null]),
          e("div", { class: "namen", text: p.aktiv ? "aktiv" : "ausgeschieden" }),
        ]),
        e("button", {
          type: "button",
          class: "knopf-klein",
          text: p.aktiv ? "Deaktivieren" : "Aktivieren",
          onclick: async () => {
            const { error: f } = await sb.from("personen").update({ aktiv: !p.aktiv }).eq("id", p.id);
            if (f) { melden("Ändern fehlgeschlagen", f); return; }
            fehlerVerbergen();
            await kerndatenLaden();
            adminPersonen();
          },
        }),
      ])
    );
  }
  ziel.appendChild(liste);
}

async function adminTermine() {
  const ziel = $("verwaltung-inhalt");
  ziel.className = "lade";
  ziel.textContent = "Lade…";

  const { data, error } = await sb
    .from("termine")
    .select("*")
    .gte("datum", heuteIso())
    .order("datum", { ascending: true })
    .limit(TERMINE_ADMIN * 3);   // hier alle kommenden zeigen, nicht nur wenige
  if (error) { melden("Termine konnten nicht geladen werden", error); return; }

  ziel.className = "";
  leeren(ziel);

  // --- Neuen Termin anlegen ---
  const datum = e("input", { type: "date" });
  const titel = e("input", { type: "text", placeholder: "Titel, z. B. Taufgottesdienst" });
  const nurInfo = e("input", { type: "checkbox" });

  ziel.appendChild(
    e("div", { class: "karte" }, [
      e("h3", { text: "Termin anlegen" }),
      e("label", {}, ["Datum"]),
      datum,
      e("label", {}, ["Titel (optional)"]),
      titel,
      e("label", { class: "mit-box" }, [nurInfo, " nur Info, kein Dienstplan (z. B. Lobpreisabend)"]),
      e("button", {
        type: "button",
        class: "knopf",
        text: "Anlegen",
        onclick: async () => {
          if (!datum.value) { fehlerZeigen("Bitte ein Datum wählen."); return; }
          const { error: f } = await sb.from("termine").insert({
            datum: datum.value,
            titel: titel.value.trim() || null,
            braucht_dienste: !nurInfo.checked,
          });
          if (f) { melden(terminFehler(f), f); return; }
          fehlerVerbergen();
          datum.value = ""; titel.value = ""; nurInfo.checked = false;
          adminTermine();
        },
      }),
      e("p", { class: "namen", text: "Reguläre Sonntage sind schon angelegt. Datum eines Termins änderst du unten über den Bearbeiten-Knopf." }),
    ])
  );

  // --- Liste kommender Termine ---
  const liste = e("div", { class: "karte" }, [e("h3", { text: "Kommende Termine" })]);
  for (const t of data) {
    liste.appendChild(t.id === editTerminId ? terminBearbeitenZeile(t) : terminAnzeigeZeile(t));
  }
  ziel.appendChild(liste);
}

/** Einheitliche Fehlermeldung beim Speichern eines Termins. */
function terminFehler(f) {
  return /duplicate|unique/i.test(f.message || "")
    ? "Zu diesem Datum gibt es schon einen Termin"
    : "Speichern fehlgeschlagen";
}

/** Anzeigezeile eines Termins mit Bearbeiten / Absagen. */
function terminAnzeigeZeile(t) {
  return e("div", { class: "zeile" }, [
    e("div", { class: "wachsen" }, [
      e("div", {}, [
        e("strong", { text: datumKurz(t.datum) }),
        t.titel ? ` · ${t.titel}` : "",
        istInfoTermin(t) ? e("span", { class: "abzeichen", text: "Info" }) : null,
        t.abgesagt ? e("span", { class: "abzeichen", text: "abgesagt" }) : null,
      ]),
    ]),
    e("button", {
      type: "button",
      class: "knopf-klein",
      text: "Bearbeiten",
      onclick: () => { editTerminId = t.id; adminTermine(); },
    }),
    e("button", {
      type: "button",
      class: "knopf-klein",
      text: t.abgesagt ? "Doch" : "Absagen",
      onclick: async () => {
        if (!t.abgesagt && !confirm("Termin wirklich absagen? Die Einteilungen bleiben erhalten.")) return;
        const { error: f } = await sb.from("termine").update({ abgesagt: !t.abgesagt }).eq("id", t.id);
        if (f) { melden("Ändern fehlgeschlagen", f); return; }
        fehlerVerbergen();
        adminTermine();
      },
    }),
  ]);
}

/** Bearbeiten-Zeile: Datum, Titel und Info-Flag ändern. */
function terminBearbeitenZeile(t) {
  const datum = e("input", { type: "date", value: t.datum });
  const titel = e("input", { type: "text", value: t.titel || "", placeholder: "Titel (optional)" });
  const nurInfo = e("input", { type: "checkbox", checked: istInfoTermin(t) });

  return e("div", { class: "zeile zeile-edit" }, [
    e("div", { class: "wachsen" }, [
      e("label", {}, ["Datum"]),
      datum,
      e("label", {}, ["Titel (optional)"]),
      titel,
      e("label", { class: "mit-box" }, [nurInfo, " nur Info, kein Dienstplan"]),
      e("div", { class: "edit-knoepfe" }, [
        e("button", {
          type: "button",
          class: "knopf-klein primaer",
          text: "Speichern",
          onclick: async () => {
            if (!datum.value) { fehlerZeigen("Bitte ein Datum wählen."); return; }
            const { error: f } = await sb.from("termine").update({
              datum: datum.value,
              titel: titel.value.trim() || null,
              braucht_dienste: !nurInfo.checked,
            }).eq("id", t.id);
            if (f) { melden(terminFehler(f), f); return; }
            fehlerVerbergen();
            editTerminId = null;
            adminTermine();
          },
        }),
        e("button", {
          type: "button",
          class: "knopf-klein",
          text: "Abbrechen",
          onclick: () => { editTerminId = null; adminTermine(); },
        }),
      ]),
    ]),
  ]);
}

// -------------------------------------------------- 5. Präferenz-Overlay

function overlayZeigen(titel, inhalt) {
  $("overlay-titel").textContent = titel;
  const ziel = $("overlay-inhalt");
  leeren(ziel);
  ziel.appendChild(inhalt);
  $("overlay").hidden = false;
}

function overlaySchliessen() {
  $("overlay").hidden = true;
  // Nach dem Schließen kann sich alles geändert haben -> Reiter neu aufbauen.
  tabZeigen(aktiverTab);
}

async function overlayOeffnen() {
  if (!(await praeferenzenLaden())) return;

  const inhalt = e("div");
  inhalt.appendChild(
    e("p", { class: "hinweis", text: "Kreuze an, welche Dienste für dich infrage kommen. Nur diese werden dir zum Eintragen angeboten." })
  );

  for (const b of bereiche) {
    // Für alle offene Pools (allg. Helfer) brauchen keine Präferenz – weglassen.
    if (b.offen_fuer_alle) continue;
    const pref = meinePraeferenzen.find((p) => p.bereich_id === b.id);

    const detail = e("div", { class: "pref-detail" });
    detail.hidden = !pref;

    const gewichtung = e("select", {}, [
      e("option", { value: "1", text: "mache ich gern" }),
      e("option", { value: "2", text: "geht auch" }),
    ]);
    gewichtung.value = String(pref ? pref.gewichtung : 1);
    gewichtung.addEventListener("change", () => praeferenzSpeichern(b, true, gewichtung, leiten));

    const leiten = e("input", { type: "checkbox", checked: !!(pref && pref.kann_leiten) });
    leiten.addEventListener("change", () => praeferenzSpeichern(b, true, gewichtung, leiten));

    detail.appendChild(gewichtung);
    if (b.braucht_leiter) {
      detail.appendChild(e("label", { class: "mit-box" }, [leiten, " ich kann diesen Dienst leiten"]));
    }

    const an = e("input", { type: "checkbox", checked: !!pref });
    an.addEventListener("change", async () => {
      detail.hidden = !an.checked;
      await praeferenzSpeichern(b, an.checked, gewichtung, leiten);
    });

    inhalt.appendChild(
      e("div", { class: "pref-zeile" }, [
        e("label", { class: "pref-kopf" }, [an, b.name]),
        detail,
      ])
    );
  }

  overlayZeigen("Meine Präferenzen", inhalt);
}

async function praeferenzSpeichern(b, an, gewichtung, leiten) {
  if (!an) {
    const { error } = await sb
      .from("praeferenzen")
      .delete()
      .eq("person_id", personId)
      .eq("bereich_id", b.id);
    if (error) { melden("Speichern fehlgeschlagen", error); return; }
  } else {
    const { error } = await sb.from("praeferenzen").upsert(
      {
        person_id: personId,
        bereich_id: b.id,
        gewichtung: Number(gewichtung.value),
        kann_leiten: b.braucht_leiter ? leiten.checked : false,
      },
      { onConflict: "person_id,bereich_id" }
    );
    if (error) { melden("Speichern fehlgeschlagen", error); return; }
  }
  fehlerVerbergen();
  await praeferenzenLaden();
}

// ------------------------------------------------------------ 6. Start

function ereignisseVerdrahten() {
  $("form-anmeldung").addEventListener("submit", anmelden);
  $("fehler-zu").addEventListener("click", fehlerVerbergen);
  $("overlay-zu").addEventListener("click", overlaySchliessen);
  $("overlay").addEventListener("click", (ev) => {
    if (ev.target === $("overlay")) overlaySchliessen();
  });

  $("knopf-abmelden").addEventListener("click", abmelden);
  $("knopf-abmelden-person").addEventListener("click", abmelden);
  $("knopf-praeferenzen").addEventListener("click", overlayOeffnen);
  $("knopf-wechseln").addEventListener("click", () => {
    speicher.loeschen(SPEICHER_PERSON);
    personId = null;
    ich = null;
    personenauswahlZeigen();
  });

  for (const knopf of document.querySelectorAll("#reiter button")) {
    knopf.addEventListener("click", () => tabZeigen(knopf.dataset.tab));
  }
  for (const knopf of document.querySelectorAll(".unterreiter button")) {
    knopf.addEventListener("click", () => {
      aktiverUnterTab = knopf.dataset.unter;
      editTerminId = null;
      tabVerwaltung();
    });
  }

  // Versteckter Admin-Zugang: 5× auf den eigenen Namen in der Fußzeile tippen.
  adminGesteVerdrahten();
  $("knopf-admin-sperren").addEventListener("click", () => {
    speicher.loeschen(SPEICHER_ADMIN);
    aktiverTab = "meine";
    appZeigen();
  });
}

/** 5 Tipser auf #fuss-name innerhalb von 3 Sekunden schalten den Adminbereich
 *  auf diesem Gerät frei. Bewusst unauffällig – kein Knopf, kein Hinweis. */
function adminGesteVerdrahten() {
  let tipser = 0;
  let letzterTip = 0;
  $("fuss-name").addEventListener("click", () => {
    const jetzt = Date.now();
    tipser = jetzt - letzterTip < 3000 ? tipser + 1 : 1;
    letzterTip = jetzt;
    if (tipser >= 5) {
      tipser = 0;
      if (adminFrei()) return;            // schon frei, nichts tun
      speicher.schreiben(SPEICHER_ADMIN, "1");
      aktiverTab = "verwaltung";
      appZeigen();
      alert("Adminbereich freigeschaltet. Unten im Verwaltung-Reiter kannst du ihn wieder verbergen.");
    }
  });
}

async function start() {
  ereignisseVerdrahten();
  planFilter = speicher.lesen(SPEICHER_PLANFILTER) || "";

  if (!window.CONFIG || !window.CONFIG.SUPABASE_URL || !window.CONFIG.SUPABASE_ANON_KEY) {
    ansichtZeigen("anmeldung");
    fehlerZeigen(
      "Die Datei config.js ist noch nicht gefüllt. Führe zuerst die Einrichtung aus (/setup in Claude Code)."
    );
    $("knopf-anmelden").disabled = true;
    return;
  }

  sb = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);

  const { data } = await sb.auth.getSession();
  if (data && data.session) {
    await nachAnmeldung();
  } else {
    ansichtZeigen("anmeldung");
  }
}

start();
