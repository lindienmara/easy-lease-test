// LES DATES D'UNE LOCATION
// -----------------------
// Tout le calcul des jours, et RIEN d'autre : pas de React, pas de couleurs,
// pas de catalogue. C'est voulu — ce fichier se vérifie tout seul, avec node,
// sans navigateur. Une erreur de date ici ferait louer deux fois la même
// voiture le même jour : c'est la pièce qui doit être juste avant tout.
//
// ⚠️ CE FICHIER NE DOIT RIEN IMPORTER. Si un jour il importe config.js ou
// commun.jsx, on ne pourra plus l'éprouver sans construire la boutique
// entière, et on arrêtera de le faire.

/* 🚨 UN JOUR EST UN TEXTE, « AAAA-MM-JJ », ET IL LE RESTE.
   ────────────────────────────────────────────────────────
   On ne convertit pas en Date pour comparer. Deux raisons, payées ailleurs
   dans ce projet :

   — Rangés dans cet ordre, les jours se comparent comme du texte : "2026-03-09"
     est bien avant "2026-03-10", et « du <= au » suffit. Aucun fuseau horaire,
     aucune heure d'été ne peut s'en mêler.

   — `new Date("2026-11-03")` est lu par le navigateur comme MINUIT À GREENWICH.
     À l'ouest de Greenwich, ce minuit tombe la veille : demander son jour de
     la semaine renvoie le dimanche pour un mardi, et le calendrier se décale
     d'une case. Quand il nous faut une vraie date — pour dessiner un mois —
     on la construit chiffre par chiffre avec `new Date(a, m - 1, j)`, qui est
     lu dans l'heure locale. */

const FORME = /^(\d{4})-(\d{2})-(\d{2})$/;

// Un jour valable, et qui existe vraiment : le 31 février est refusé.
export function jourValide(s) {
  const m = FORME.exec(String(s || ""));
  if (!m) return false;
  const [, a, mo, j] = m.map(Number);
  if (mo < 1 || mo > 12 || j < 1 || j > 31) return false;
  const d = new Date(a, mo - 1, j);
  return d.getFullYear() === a && d.getMonth() === mo - 1 && d.getDate() === j;
}

// La date d'aujourd'hui, en texte. Le passé ne se loue pas.
export function aujourdhui(maintenant) {
  const d = maintenant ? new Date(maintenant) : new Date();
  return enTexte(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function enTexte(a, mo, j) {
  return String(a).padStart(4, "0") + "-" + String(mo).padStart(2, "0") + "-" + String(j).padStart(2, "0");
}

// Les trois nombres d'un jour. Pratique pour dessiner, jamais pour comparer.
export function morceaux(s) {
  const m = FORME.exec(String(s || ""));
  return m ? { a: Number(m[1]), mo: Number(m[2]), j: Number(m[3]) } : null;
}

/* 🚨 COMBIEN DE JOURS SE PAIENT — BORNES COMPRISES.
   ────────────────────────────────────────────────
   « Du 3 au 5 » fait TROIS jours, pas deux. C'est le choix tenu partout dans
   ce moteur, et il n'est pas innocent :

   — Le calendrier colore trois cases. Un client qui en voit trois et lit
     « 2 jours » se croit trompé, et il a raison de le croire.
   — Le véhicule est bien immobilisé trois jours : on ne peut pas le relouer
     le 5.

   Un loueur qui compte en tranches de 24 h (pris le 3 à 9 h, rendu le 5 à 9 h
   = 2 jours) n'a pas tort non plus — mais il faudrait alors demander l'heure,
   et une boutique sans heure de départ ne peut pas le calculer honnêtement.
   On annonce donc « 3 jours, du 3 au 5 inclus » noir sur blanc à l'écran. */
export function nbJours(du, au) {
  if (!jourValide(du) || !jourValide(au) || au < du) return 0;
  const a = morceaux(du), b = morceaux(au);
  const d1 = Date.UTC(a.a, a.mo - 1, a.j);
  const d2 = Date.UTC(b.a, b.mo - 1, b.j);
  // Date.UTC : deux repères sans fuseau ni heure d'été entre les deux.
  return Math.round((d2 - d1) / 86400000) + 1;
}

/* Deux périodes se marchent-elles sur les pieds ? Bornes comprises des deux
   côtés : rendre une voiture le 5 et la reprendre le 5 est un chevauchement,
   parce que personne ne garantit l'heure. */
export function chevauche(a, b) {
  if (!a || !b) return false;
  if (!jourValide(a.du) || !jourValide(a.au) || !jourValide(b.du) || !jourValide(b.au)) return false;
  return a.du <= b.au && b.du <= a.au;
}

// Ce jour-là, le véhicule est-il déjà pris ? Renvoie la période fautive —
// l'écran peut ainsi dire POURQUOI, et pas seulement « non ».
export function prisLe(jour, periodes) {
  if (!jourValide(jour) || !Array.isArray(periodes)) return null;
  return periodes.find((p) => p && jour >= p.du && jour <= p.au) || null;
}

// Et sur toute une demande ? Première période qui gêne, ou rien.
export function periodeQuiGene(du, au, periodes) {
  if (!Array.isArray(periodes)) return null;
  return periodes.find((p) => chevauche({ du, au }, p)) || null;
}

/* Les jours d'un mois, rangés en semaines qui commencent le LUNDI.
   `getDay()` compte le dimanche comme 0 : un calendrier français décalé de
   six cases. Le `+ 6) % 7` remet lundi en premier.

   Les cases vides du début et de la fin sont des `null` : l'écran les dessine
   transparentes, et la grille reste alignée. */
export function grilleMois(annee, mois) {
  const premier = new Date(annee, mois - 1, 1);
  const combien = new Date(annee, mois, 0).getDate();
  const decalage = (premier.getDay() + 6) % 7;

  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= combien; j++) cases.push(enTexte(annee, mois, j));
  while (cases.length % 7 !== 0) cases.push(null);

  const semaines = [];
  for (let i = 0; i < cases.length; i += 7) semaines.push(cases.slice(i, i + 7));
  return semaines;
}

// Le mois suivant, le mois précédent — sans jamais fabriquer un mois 13.
export function moisDecale(annee, mois, pas) {
  const total = annee * 12 + (mois - 1) + pas;
  return { annee: Math.floor(total / 12), mois: (total % 12) + 1 };
}

export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export const JOURS_COURTS = ["L", "M", "M", "J", "V", "S", "D"];

// « 3 novembre 2026 ». Pour un récapitulatif qu'un humain relit.
export function enClair(s, avecAnnee = false) {
  const m = morceaux(s);
  if (!m) return "";
  return m.j + " " + MOIS[m.mo - 1] + (avecAnnee ? " " + m.a : "");
}

/* « du 3 au 5 novembre », « du 30 octobre au 2 novembre ». On ne répète le
   mois que s'il change : c'est ce qu'un humain écrit. */
export function periodeEnClair(du, au) {
  const a = morceaux(du), b = morceaux(au);
  if (!a || !b) return "";
  if (du === au) return "le " + enClair(du, a.a !== b.a);
  if (a.mo === b.mo && a.a === b.a) return "du " + a.j + " au " + enClair(au);
  return "du " + enClair(du, a.a !== b.a) + " au " + enClair(au, a.a !== b.a);
}
