// LES CONDITIONS ET LES INFOS PRATIQUES D'UN LOUEUR
// =================================================
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CE FICHIER N'EST LU QUE PAR App-location.jsx.                        │
// │ Il ne lit ni commun.jsx, ni config.js : on lui PASSE les réglages, et   │
// │ il rend des cartes. C'est ce qui permet de l'éprouver avec node, sans   │
// │ navigateur — outils/essayer-les-infos-location.mjs.                     │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 🚨 LA RÈGLE N°2 DE SA CONSIGNE N°24, ET ELLE EST ENTIÈRE ICI.
// « Côté client, une info n'apparaît QUE si le loueur l'a remplie. Aucun bloc
// vide, aucun "non renseigné". » Chaque carte ci-dessous se construit ligne
// par ligne, et une carte sans ligne n'est pas rendue. Une boutique où rien
// n'est réglé ne reçoit donc AUCUNE carte, et le bouton qui les ouvre ne
// s'affiche même pas.
//
// ⚠️ POURQUOI UN BOUTON SUR CHAQUE FICHE, ET PAS UNE PAGE À PART.
// L'arrêté du 17 mars 2015 demande que le prix, la durée, le kilométrage, la
// caution et la franchise soient connus AVANT la réservation. « À un clic de
// chaque véhicule », c'est sa consigne — et c'est aussi ce qui évite les
// litiges au retour.

import { eurosLocation } from "./location-prix.js";

/* Les papiers, écrits comme dans l'atelier. Les deux listes doivent dire la
   même chose : un contrôle le vérifie (essayer-les-infos-location.mjs), sinon
   un document coché dans l'éditeur s'afficherait vide chez le client. */
export const DOCUMENTS = {
  identite: { nom: "Pièce d'identité", emoji: "🪪" },
  permis: { nom: "Permis de conduire", emoji: "🚗" },
  domicile: { nom: "Justificatif de domicile", emoji: "🏠" },
  carte: { nom: "Carte bancaire au nom du conducteur", emoji: "💳" },
};

/* Les équipements d'un véhicule, écrits comme dans l'atelier. Mêmes mots des
   deux côtés : un contrôle le vérifie, sinon une case cochée dans l'éditeur
   s'afficherait vide chez le client. */
export const EQUIPEMENTS = {
  clim: { nom: "Clim", emoji: "❄️" },
  gps: { nom: "GPS", emoji: "🧭" },
  bluetooth: { nom: "Bluetooth", emoji: "🔊" },
  carplay: { nom: "CarPlay / Android Auto", emoji: "📱" },
  camera: { nom: "Caméra de recul", emoji: "🎥" },
  regulateur: { nom: "Régulateur", emoji: "🎚️" },
  radar: { nom: "Radar de stationnement", emoji: "📡" },
  attelage: { nom: "Attelage", emoji: "🪝" },
  siege: { nom: "Siège bébé disponible", emoji: "👶" },
  animaux: { nom: "Animaux acceptés", emoji: "🐾" },
};

/* Ce qu'on affiche sous les places et les portes. L'ordre est celui de la
   liste, pas celui des cases cochées : deux véhicules de la même flotte se
   comparent d'un coup d'œil. « Autre » ferme la marche, avec le mot du
   loueur. */
export function equipementsDe(v) {
  const ids = (v && Array.isArray(v.equipements)) ? v.equipements : [];
  const liste = Object.keys(EQUIPEMENTS)
    .filter((id) => ids.includes(id))
    .map((id) => ({ id, nom: EQUIPEMENTS[id].nom, emoji: EQUIPEMENTS[id].emoji }));
  const autre = String((v && v.equipementsAutre) || "").trim();
  if (autre) liste.push({ id: "autre", nom: autre, emoji: "✨" });
  return liste;
}

const CAUTIONS = {
  empreinte: "Empreinte bancaire (rien n'est débité)",
  especes: "En espèces",
  virement: "Par virement",
  cheque: "Par chèque",
};

const mot = (l, cle) => String((l && l[cle]) || "").trim();
const nombre = (l, cle) => Math.max(0, Number((l && l[cle]) || 0));

/** Les papiers à apporter le jour du départ, dans l'ordre de la liste. */
export function documentsAApporter(location) {
  const ids = (location && Array.isArray(location.documents)) ? location.documents : [];
  return Object.keys(DOCUMENTS)
    .filter((id) => ids.includes(id))
    .map((id) => ({ id, nom: DOCUMENTS[id].nom, emoji: DOCUMENTS[id].emoji }));
}

/* 🚨 UNE ADRESSE NE PART PAS TELLE QUELLE DANS UN LIEN.
   Un « & » ou un espace dans une adresse casserait le lien — et une adresse
   est pleine des deux. encodeURIComponent n'est pas une précaution de style :
   sans lui, « 12 av. de Vizille, Grenoble » ouvre une recherche vide. */
export function lienMaps(adresse) {
  const a = String(adresse || "").trim();
  if (!a) return "";
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(a);
}

/* ═══════════════════ LES CARTES ═══════════════════
   Rend toujours la même forme : { id, emoji, titre, lignes[] }, où une ligne
   est { nom, valeur } ou { texte }. L'écran n'a jamais à deviner, et un essai
   peut lire ce qui sera affiché sans ouvrir un navigateur. */
export function cartesPratiques(location) {
  const l = location && typeof location === "object" ? location : {};
  const cartes = [];
  const carte = (id, emoji, titre, lignes) => {
    const vraies = lignes.filter(Boolean);
    if (vraies.length) cartes.push({ id, emoji, titre, lignes: vraies });
  };
  const ligne = (nom, valeur) => (valeur ? { nom, valeur } : null);

  /* ── Où et quand ── */
  const adresse = mot(l, "adresse");
  carte("ou-quand", "📍", "Où et quand", [
    adresse ? { nom: "Retrait", valeur: adresse, lien: lienMaps(adresse) } : null,
    mot(l, "horaires") ? { nom: "Horaires", texte: mot(l, "horaires") } : null,
    ligne("Fermé", mot(l, "fermes")),
  ]);

  /* ── Le conducteur ── */
  const age = nombre(l, "ageMin");
  const permis = nombre(l, "permisAns");
  carte("conducteur", "🧑", "Le conducteur", [
    age ? { nom: "Âge minimum", valeur: age + " ans" } : null,
    permis ? { nom: "Permis depuis", valeur: "au moins " + permis + " an" + (permis > 1 ? "s" : "") } : null,
  ]);

  /* ── Les papiers ── */
  const papiers = documentsAApporter(l);
  if (papiers.length) {
    cartes.push({
      id: "documents", emoji: "🪪", titre: "À apporter le jour J",
      lignes: papiers.map((d) => ({ texte: d.emoji + " " + d.nom })),
    });
  }

  /* ── La caution ── */
  carte("caution", "🔒", "La caution", [
    ligne("Prise", CAUTIONS[mot(l, "cautionMode")] || ""),
    ligne("Rendue", mot(l, "cautionRendue")),
  ]);

  /* ── Carburant et kilomètres ── */
  const regle = mot(l, "carburantRegle");
  const prixLitre = nombre(l, "carburantPrix");
  const km = nombre(l, "kmSupp");
  carte("carburant", "⛽", "Carburant et kilomètres", [
    regle === "plein" ? { nom: "Carburant", valeur: "à rendre avec le plein" } : null,
    regle === "prix"
      ? { nom: "Carburant", valeur: prixLitre ? "facturé " + eurosLocation(prixLitre) + " le litre manquant" : "facturé au litre manquant" }
      : null,
    km ? { nom: "Kilomètre en plus", valeur: eurosLocation(km) } : null,
  ]);

  /* ── L'assurance ──
     ⚠️ « rcIncluse » a trois états, et le troisième se tait. Afficher
     « non » quand le loueur n'a rien dit serait une affirmation qu'il n'a
     jamais faite — et sur une assurance, ça ne se fait pas. */
  const rc = mot(l, "rcIncluse");
  const franchise = nombre(l, "franchise");
  carte("assurance", "🛡️", "L'assurance", [
    rc === "oui" ? { nom: "Responsabilité civile", valeur: "incluse" } : null,
    rc === "non" ? { nom: "Responsabilité civile", valeur: "non incluse" } : null,
    franchise ? { nom: "Franchise", valeur: eurosLocation(franchise) } : null,
    mot(l, "exclusions") ? { nom: "Non couvert", texte: mot(l, "exclusions") } : null,
  ]);

  /* ── Retard et annulation ── */
  const retard = nombre(l, "retardJour");
  carte("retard", "⏰", "Retard et annulation", [
    retard ? { nom: "Jour de retard", valeur: eurosLocation(retard) } : null,
    mot(l, "annulation") ? { nom: "Annulation", texte: mot(l, "annulation") } : null,
  ]);

  /* ── Le légal ── */
  const mediateur = mot(l, "mediateurNom");
  const site = mot(l, "mediateurSite");
  const conditions = mot(l, "lienConditions");
  carte("legal", "⚖️", "En cas de désaccord", [
    mediateur || site
      ? { nom: "Médiateur", valeur: mediateur || site, lien: site }
      : null,
    conditions ? { nom: "Conditions de location", valeur: "les lire", lien: conditions } : null,
  ]);

  return cartes;
}

/* ═══════════ LES CONDITIONS, ARTICLE PAR ARTICLE ═══════════ — N°25

   🚨 QUINZE PAGES D'UN SEUL BLOC NE SE LISENT PAS.
   Le texte arrive en Markdown — « # » pour le titre, « ## ARTICLE 3 » pour
   chaque article. On le découpe sur ces titres : le client ouvre l'article
   qui l'intéresse au lieu de faire défiler quinze pages sur un téléphone.

   ⚠️ ET ON NE REND PAS DU HTML. Le texte d'un loueur est du texte : il
   s'affiche tel quel, retours à la ligne compris. Interpréter du Markdown
   ouvrirait la porte à autre chose. */
export function sectionsDesConditions(texte) {
  const brut = String(texte || "").trim();
  if (!brut) return [];

  /* 🚨 LES RETOURS À LA LIGNE DE WINDOWS CASSAIENT LE DÉCOUPAGE.
     Le modèle est écrit sur un PC : git le rend en CRLF, et chaque ligne
     finit par un « \r ». Or « . » ne traverse pas un retour chariot en
     JavaScript : « ^## (.+)$ » ne reconnaissait plus un seul titre, et les
     quinze pages de conditions s'affichaient en UN SEUL bloc chez le client.
     Trouvé par le contrôle, le 22 octobre 2026. */
  const lignes = brut.replace(/\r/g, "").split("\n");
  const sections = [];
  let courante = null;

  for (const ligne of lignes) {
    const titre = /^#{1,3}\s+(.+)$/.exec(ligne);
    if (titre) {
      if (courante) sections.push(courante);
      courante = { titre: titre[1].trim(), texte: "" };
      continue;
    }
    if (!courante) courante = { titre: "", texte: "" };
    courante.texte += (courante.texte ? "\n" : "") + ligne;
  }
  if (courante) sections.push(courante);

  return sections
    .map((s) => ({ titre: s.titre, texte: s.texte.trim() }))
    .filter((s) => s.titre || s.texte);
}

/** Y a-t-il quelque chose à montrer ? Sinon, pas de bouton du tout. */
export function aDesInfosPratiques(location) {
  return cartesPratiques(location).length > 0;
}

/* L'adresse et les horaires, pour l'onglet Infos : c'est là qu'on cherche
   « où est-ce, et c'est ouvert quand ? ». La même carte que dans le panneau,
   et rien si le loueur n'a rempli ni l'une ni l'autre. */
export function carteOuQuand(location) {
  return cartesPratiques(location).find((c) => c.id === "ou-quand") || null;
}
