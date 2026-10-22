// LES PRIX D'UNE LOCATION — ET RIEN D'AUTRE
// =========================================
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CE FICHIER N'EST LU QUE PAR App-location.jsx.                        │
// │                                                                         │
// │ Rien ici ne doit remonter dans commun.jsx : une boutique de vente n'a   │
// │ ni unité de durée, ni prorata, et « euros » lui va très bien. C'est la  │
// │ règle n°1 de la consigne N°23 — toute amélioration de la location reste │
// │ dans la vitrine location.                                               │
// │                                                                         │
// │ outils/verifier-separation.mjs refuse la fabrication si App.jsx ou      │
// │ commun.jsx viennent y puiser.                                           │
// └─────────────────────────────────────────────────────────────────────────┘

/* ═══════════════════ LES EUROS D'UN LOUEUR ═══════════════════

   🚨 « 80,00 € » DEVIENT « 80 € », ET « 2500,00 € » DEVIENT « 2 500 € ».

   Dit le 22 octobre 2026. Le « euros » partagé écrit toujours deux décimales,
   parce qu'une boutique de vente affiche des 19,90 € et des 4,50 €. Un loueur
   affiche des 80 €, des 300 €, des 2 500 € : les « ,00 » qu'il n'a jamais
   tapés font bazar sur chaque carte, et un prix à quatre chiffres sans espace
   se lit mal — on hésite entre 2 500 et 25 000.

   ⚠️ LES CENTIMES NE DISPARAISSENT PAS, ILS SE TAISENT QUAND ILS SONT NULS.
   Un prorata tombe très souvent sur des centimes (300 ÷ 7 = 42,857…), et les
   cacher donnerait un total qui ne retombe pas sur ses pieds. On les montre
   dès qu'ils existent.

   L'espace des milliers et celui d'avant l'euro sont INSÉCABLES : sans eux,
   un retour à la ligne coupe « 2 500 » en deux, ou laisse le « € » tout seul
   en début de ligne. */
const INSECABLE = " ";

export const eurosLocation = (n) => {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const signe = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  const entier = Math.trunc(abs);
  const centimes = Math.round((abs - entier) * 100);
  const milliers = String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, INSECABLE);
  const fin = centimes ? "," + String(centimes).padStart(2, "0") : "";
  return signe + milliers + fin + INSECABLE + "€";
};

/* ═══════════════════ CE QUE L'UNITÉ VEUT DIRE ═══════════════════

   🚨 LE DÉFAUT QU'IL A SIGNALÉ, ET IL COÛTAIT CHER.

   « L'éditeur propose / heure, / jour, / week-end, / semaine, / mois, mais la
   boutique affiche toujours / jour et multiplie par le nombre de jours. Un
   véhicule à 300 € la semaine serait compté 300 € par jour. »

   Mesuré dans le code : App-location.jsx écrivait « / jour » en dur (sa
   ligne 168) et calculait « v.prix × jours ». Un Trafic à 300 € la semaine
   demandé dix jours annonçait 3 000 € au lieu de 428,57 €.

   ⚠️ ET TOUTES LES UNITÉS NE SE DIVISENT PAS. C'est le fond du problème :

     • « / jour », « / semaine », « / mois » sont des DURÉES. Elles se
       comptent : des semaines entières, puis les jours qui restent au
       prorata. Le calcul est juste, et il se montre.

     • « / heure » et « / week-end » sont des FORFAITS. Un jour ne vaut pas
       24 × le prix horaire, et un week-end ne vaut pas deux jours au même
       tarif — sinon le loueur n'aurait pas choisi ce mot. Inventer un total
       là serait pire que de n'en donner aucun : le client le lirait comme
       une promesse.

     • Un texte libre (« / la journée », « / le trajet »…) : on ne devine pas.

   Pour ces trois cas-là, la boutique affiche le prix TEL QUE LE LOUEUR L'A
   ÉCRIT, montre les dates et le nombre de jours, et dit franchement que le
   prix de cette durée se demande. C'est la règle n°3 du projet : l'écran ne
   ment pas.

   ⚠️ UNE UNITÉ VIDE RESTE « / jour », et c'est ce que font déjà toutes les
   boutiques en service : l'éditeur affiche « / jour » en gris quand rien
   n'est choisi. Aucun véhicule existant ne change de prix à cause de ce
   fichier. */
const DUREES = [
  { cle: "jour", jours: 1, mot: "jour", mots: "jours", unite: "/ jour",
    dits: ["jour", "jours", "journee", "journees", "j"] },
  { cle: "semaine", jours: 7, mot: "semaine", mots: "semaines", unite: "/ semaine",
    dits: ["semaine", "semaines", "sem"] },
  { cle: "mois", jours: 30, mot: "mois", mots: "mois", unite: "/ mois",
    dits: ["mois"] },
];

/* On lit ce que le loueur a tapé sans exiger la forme exacte du bouton :
   « / semaine », « semaine », « /semaine », « par semaine », « / la journée »
   disent tous la même chose. Les accents, les majuscules et le petit article
   ne comptent pas.

   ⚠️ ON RECONNAÎT, ON NE DEVINE PAS. La liste « dits » tient les mots d'une
   durée, et seulement eux. Tout le reste — « / le trajet », « / aller-retour »
   — reste un forfait qu'on n'invente pas. Mieux vaut un « prix à confirmer »
   de trop qu'un total faux. */
const nu = (t) => String(t || "")
  .toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/^\s*(\/|par)\s*/, "")
  .replace(/^\s*(la |le |l'|une |un )\s*/, "")
  .trim();

export function dureeDe(unite) {
  const m = nu(unite);
  if (!m) return DUREES[0]; // rien d'écrit = par jour, comme aujourd'hui
  /* L'égalité stricte, et pas « contient » : « week-end » contient « week »,
     et un « / mois de juillet » n'est pas une durée de trente jours. */
  return DUREES.find((d) => d.dits.includes(m)) || null;
}

/* Ce que la boutique écrit à côté du gros chiffre. Le loueur a choisi un mot :
   c'est le sien qu'on montre, pas « / jour » en dur. */
export function uniteAffichee(unite) {
  /* 🚨 « PAR JOUR » NE S'ÉCRIT PAS « / PAR JOUR ».
     Vu à l'écran le 22 octobre 2026, sur la vitrine de location : son
     catalogue porte « par jour », et la barre ajoutée devant donnait
     « 39 € / par jour ». L'éditeur, lui, écrit « / jour ». Les deux disent la
     même chose : on enlève le « par » avant d'ajouter la barre.

     ⚠️ ET SEULEMENT LE MOT « PAR » EN TÊTE : « / par-brise » n'existe pas,
     mais un loueur qui écrirait « parcours » garderait son mot. */
  const ecrit = String(unite || "").trim().replace(/^par\s+/i, "");
  if (!ecrit) return "/ jour";
  return ecrit.startsWith("/") ? ecrit : "/ " + ecrit;
}

/* ═══════════════════ LE COMPTE ═══════════════════

   Rend toujours la même forme, pour que l'écran n'ait jamais à deviner :

     calculable  false → on ne sait pas faire le total de cette durée
     total       le montant, en euros (0 si on ne sait pas)
     lignes      le détail à afficher, ligne à ligne — c'est ce qui rend le
                 compte VÉRIFIABLE. Un total nu se croit ou ne se croit pas ;
                 un total détaillé se refait de tête.
     unite       le mot du loueur, tel qu'il l'a écrit */
export function prixLocation(prix, unite, jours) {
  const p = Math.max(0, Number(prix) || 0);
  const j = Math.max(0, Math.trunc(Number(jours) || 0));
  const duree = dureeDe(unite);
  const mot = uniteAffichee(unite);

  if (!duree || p <= 0 || j <= 0) {
    return { calculable: false, total: 0, lignes: [], unite: mot, duree: null };
  }

  /* Le prorata se fait sur le PRIX PAR JOUR de l'unité choisie, et il n'est
     jamais arrondi en route : on arrondit le total, une seule fois. Arrondir
     chaque ligne ferait un total qui ne retombe pas sur la somme affichée —
     et c'est exactement le genre d'écart qui fait douter de tout le reste. */
  const parJour = p / duree.jours;
  const entieres = Math.floor(j / duree.jours);
  const reste = j - entieres * duree.jours;
  const total = Math.round((entieres * p + reste * parJour) * 100) / 100;

  const lignes = [];

  /* La décomposition, en français, quand il y a quelque chose à décomposer.
     Pour une location au jour, « 3 jours = 3 jours » n'apprend rien. */
  /* ⚠️ ET SEULEMENT SI ELLE DÉCOMPOSE VRAIMENT. Vu à l'écran le 22 octobre
     sur cinq jours au tarif hebdomadaire : « 5 jours … 5 jours ». La ligne
     n'apprenait rien et faisait douter du reste du compte. Elle ne s'affiche
     donc que quand il y a DEUX morceaux — « 1 semaine + 3 jours ». */
  if (duree.jours > 1 && entieres && reste) {
    const bouts = [];
    if (entieres) bouts.push(entieres + " " + (entieres > 1 ? duree.mots : duree.mot));
    if (reste) bouts.push(reste + " jour" + (reste > 1 ? "s" : ""));
    lignes.push({
      nom: j + " jour" + (j > 1 ? "s" : ""),
      valeur: bouts.join(" + "),
    });
  }

  if (entieres) {
    lignes.push({
      nom: entieres + " × " + eurosLocation(p),
      valeur: eurosLocation(Math.round(entieres * p * 100) / 100),
    });
  }
  if (reste) {
    lignes.push({
      nom: reste + " × " + eurosLocation(parJour)
        + (duree.jours > 1 ? " (" + eurosLocation(p) + " ÷ " + duree.jours + ")" : ""),
      valeur: eurosLocation(Math.round(reste * parJour * 100) / 100),
    });
  }

  return { calculable: true, total, lignes, unite: mot, duree, parJour };
}

/* ═══════════════════ LES FORFAITS DU LOUEUR ═══════════════════ — N°24, C.2

   🚨 LE MEILLEUR PRIX POUR LE CLIENT, ET IL SE VOIT.
   « Le calendrier calcule automatiquement le meilleur prix pour les dates
   choisies et montre le détail (Forfait week-end appliqué) » — sa consigne.
   Easy Lease écrit aujourd'hui ses forfaits à la main dans la description :
   « FORFAITS : week-end 300 € · 7 jours 600 € · 1 mois sur devis ». Personne
   ne les applique, et c'est le client qui doit faire le calcul.

   ⚠️ ON CALCULE TOUTES LES FORMULES, ET ON GARDE LA MOINS CHÈRE.
   Pas la dernière écrite, pas la plus flatteuse : la moins chère. Un loueur
   qui pose un forfait semaine plus cher que sept jours au tarif du jour ne
   doit pas le voir appliqué — ce serait une mauvaise surprise signée DMïana.

   ⚠️ ET « SUR DEVIS » ARRÊTE TOUT, C'EST SON SENS.
   Un loueur qui écrit « 1 mois sur devis » n'a pas donné son prix au mois :
   au-delà de trente jours, la boutique ne propose aucun total. Elle le dit. */

/* Un week-end, c'est un samedi ou un dimanche DANS la période. Écrit ici, et
   non pris dans location-dates.js : ce fichier ne doit rien importer, c'est
   ce qui permet de l'éprouver sans navigateur. Date.UTC et getUTCDay : aucun
   fuseau ne peut faire basculer un samedi sur un vendredi. */
export function contientUnWeekEnd(du, au) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(du || "")) || !/^\d{4}-\d{2}-\d{2}$/.test(String(au || ""))) return false;
  const [a1, m1, j1] = du.split("-").map(Number);
  const [a2, m2, j2] = au.split("-").map(Number);
  let t = Date.UTC(a1, m1 - 1, j1);
  const fin = Date.UTC(a2, m2 - 1, j2);
  if (fin < t) return false;
  /* Au plus 366 pas : une période absurde ne doit pas tourner sans fin. */
  for (let i = 0; t <= fin && i < 366; i += 1, t += 86400000) {
    const jour = new Date(t).getUTCDay();
    if (jour === 0 || jour === 6) return true;
  }
  return false;
}

/* Le prix d'une journée au tarif ordinaire, quelle que soit l'unité choisie.
   C'est lui qui sert à compter les jours qui dépassent un forfait. */
function parJourDe(prix, unite) {
  const d = dureeDe(unite);
  const p = Math.max(0, Number(prix) || 0);
  return d ? p / d.jours : 0;
}

const arrondi = (n) => Math.round(n * 100) / 100;

/* ═══════════════════ LE MEILLEUR PRIX ═══════════════════

   Rend la même forme que prixLocation, plus :
     forfait   le nom du forfait appliqué, ou "" — c'est ce qui s'affiche
     options   ce que le client a coché, et ce que ça coûte
     devis     vrai quand le loueur renvoie à un devis (aucun total) */
export function meilleurPrix(v, du, au, jours, optionsCochees, reglages) {
  const vehicule = v && typeof v === "object" ? v : {};
  const j = Math.max(0, Math.trunc(Number(jours) || 0));
  const prix = Math.max(0, Number(vehicule.prix) || 0);
  const unite = uniteAffichee(vehicule.unite);
  const parJour = parJourDe(vehicule.prix, vehicule.unite);

  /* Les options de la boutique, moins celles que ce véhicule a retirées,
     plus les siennes — N°25. Sans réglages, ce sont les siennes, comme
     avant. */
  const options = optionsChoisies(optionsDuVehicule(vehicule, reglages), optionsCochees, j);
  const vide = { calculable: false, total: 0, lignes: [], unite, forfait: "", devis: false, options };

  if (j <= 0 || prix <= 0) return vide;

  /* 🚨 « SUR DEVIS » PASSE AVANT TOUT LE RESTE. Le loueur a dit qu'au mois il
     fait un prix à part : lui en inventer un serait parler à sa place. */
  const moisSurDevis = vehicule.moisSurDevis === true && !(Number(vehicule.forfaitMois) > 0);
  if (moisSurDevis && j >= 30) {
    return { ...vide, devis: true };
  }

  const candidats = [];

  const base = prixLocation(vehicule.prix, vehicule.unite, j);
  if (base.calculable) candidats.push({ nom: "", total: base.total, lignes: base.lignes });

  /* Le week-end : un forfait, donc une somme et pas un calcul. Il ne vaut que
     pour une période courte QUI CONTIENT un samedi ou un dimanche — trois
     jours en semaine ne sont pas un week-end. */
  const we = Math.max(0, Number(vehicule.forfaitWeekEnd) || 0);
  if (we > 0 && j <= 3 && contientUnWeekEnd(du, au)) {
    candidats.push({
      nom: "Forfait week-end",
      total: we,
      lignes: [{ nom: "Forfait week-end", valeur: eurosLocation(we) }],
    });
  }

  /* La semaine : des semaines entières au forfait, puis les jours qui restent
     au tarif du jour. */
  const sem = Math.max(0, Number(vehicule.forfaitSemaine) || 0);
  if (sem > 0 && j >= 7) {
    const semaines = Math.floor(j / 7);
    const reste = j - semaines * 7;
    const total = arrondi(semaines * sem + reste * parJour);
    const lignes = [{ nom: semaines + " × forfait 7 jours", valeur: eurosLocation(arrondi(semaines * sem)) }];
    if (reste) lignes.push({ nom: reste + " × " + eurosLocation(parJour), valeur: eurosLocation(arrondi(reste * parJour)) });
    candidats.push({ nom: "Forfait 7 jours", total, lignes });
  }

  /* Ou une remise en pourcentage à partir de sept jours, pour le loueur qui
     préfère annoncer « −15 % » plutôt qu'un prix. */
  const remise = Math.max(0, Number(vehicule.remiseSemaine) || 0);
  if (remise > 0 && j >= 7 && base.calculable) {
    const total = arrondi(base.total * (100 - remise) / 100);
    candidats.push({
      nom: "−" + remise + " % à partir de 7 jours",
      total,
      lignes: [
        { nom: j + " jours au tarif normal", valeur: eurosLocation(base.total) },
        { nom: "Remise de " + remise + " %", valeur: "−" + eurosLocation(arrondi(base.total - total)) },
      ],
    });
  }

  /* Le mois, pour les longues durées. */
  const mois = Math.max(0, Number(vehicule.forfaitMois) || 0);
  if (mois > 0 && j >= 30) {
    const nb = Math.floor(j / 30);
    const reste = j - nb * 30;
    const total = arrondi(nb * mois + reste * parJour);
    const lignes = [{ nom: nb + " × forfait 1 mois", valeur: eurosLocation(arrondi(nb * mois)) }];
    if (reste) lignes.push({ nom: reste + " × " + eurosLocation(parJour), valeur: eurosLocation(arrondi(reste * parJour)) });
    candidats.push({ nom: "Forfait 1 mois", total, lignes });
  }

  if (!candidats.length) return vide;

  /* ⚠️ LA MOINS CHÈRE, ET À ÉGALITÉ LA PLUS SIMPLE (celle sans nom, le tarif
     ordinaire) : annoncer « forfait appliqué » sans rien faire gagner au
     client serait une promesse creuse. */
  candidats.sort((a, b) => (a.total - b.total) || (a.nom ? 1 : -1));
  const gagnant = candidats[0];

  return {
    calculable: true,
    total: arrondi(gagnant.total + options.total),
    lignes: gagnant.lignes,
    unite,
    forfait: gagnant.nom,
    devis: false,
    options,
    /* Le prix de la location seule, sans les options : c'est ce qu'on affiche
       au-dessus de la ligne des suppléments. */
    location: arrondi(gagnant.total),
  };
}

/* ═══════════ LES OPTIONS PAYANTES ═══════════ — consigne N°24, C.5
   Le client coche, ça s'ajoute. « par jour » multiplie, « une fois » non :
   un siège bébé à 5 €/jour sur dix jours fait 50 €, une livraison à 20 € fait
   20 € quelle que soit la durée. */
/* ═══════════ CE QUE CE VÉHICULE PROPOSE VRAIMENT ═══════════ — N°25

   🚨 SA DEMANDE DU 22 OCTOBRE 2026 : « Toutes ces options doivent être
   ajustables. Si la boutique ne veut pas offrir cette option, il doit pouvoir
   l'enlever. »

   Trois sources, dans cet ordre :
     1. les options de la BOUTIQUE, valables pour toute la flotte ;
     2. moins celles que CE véhicule a retirées (un utilitaire n'a pas de
        siège bébé) ;
     3. plus les siennes propres.

   ⚠️ ET À NOM ÉGAL, CELLE DU VÉHICULE GAGNE. C'est la règle « la plus
   précise l'emporte », déjà vraie pour les prix : un loueur qui facture le
   siège bébé plus cher sur son monospace l'écrit sur ce véhicule-là, et ça
   ne touche pas les autres. */
export function optionsDuVehicule(v, reglages) {
  const vehicule = v && typeof v === "object" ? v : {};
  const r = reglages && typeof reglages === "object" ? reglages : {};

  const retirees = Array.isArray(vehicule.optionsRetirees) ? vehicule.optionsRetirees : [];
  const deLaBoutique = (Array.isArray(r.options) ? r.options : [])
    .filter((o) => o && o.nom && !retirees.includes(o.nom));
  const duVehicule = (Array.isArray(vehicule.options) ? vehicule.options : [])
    .filter((o) => o && o.nom);

  /* Un seul nom une seule fois, et c'est la DERNIÈRE qui reste : celles du
     véhicule sont posées après celles de la boutique, donc les siennes
     gagnent. Une ligne, et elle se relit. */
  const liste = deLaBoutique.concat(duVehicule);
  const noms = liste.map((o) => o.nom);
  return liste.filter((o, i) => noms.lastIndexOf(o.nom) === i);
}

export function optionsChoisies(v, cochees, jours) {
  /* On accepte une liste toute faite (celle de optionsDuVehicule) comme un
     véhicule : les deux appels existent, et aucun ne doit se tromper. */
  const liste = Array.isArray(v) ? v : ((v && Array.isArray(v.options)) ? v.options : []);
  const prises = Array.isArray(cochees) ? cochees : [];
  const j = Math.max(1, Math.trunc(Number(jours) || 0));

  const lignes = liste
    .map((o, i) => ({ ...o, i }))
    .filter((o) => prises.includes(o.i) || prises.includes(o.nom))
    .map((o) => {
      /* 🚨 « parJour » EST ABSENT QUAND IL EST VRAI.
         Le catalogue d'une boutique n'écrit la clé que si elle vaut FAUX —
         c'est ce qui garde les fichiers courts. Lue telle quelle, une option
         sans la clé passait pour « une seule fois », et un siège bébé à 5 €
         le jour se facturait 5 € pour dix jours. Vu à l'écran le 22 octobre
         2026, sur la vitrine de location. */
      const parJour = o.parJour !== false;
      const total = arrondi(parJour ? o.prix * j : o.prix);
      return {
        nom: o.nom + (parJour ? " (" + eurosLocation(o.prix) + " × " + j + " jour" + (j > 1 ? "s" : "") + ")" : ""),
        valeur: eurosLocation(total),
        total,
      };
    });

  return { lignes, total: arrondi(lignes.reduce((s, l) => s + l.total, 0)) };
}

/* Ce qu'on écrit au loueur dans la demande : le même compte, en une ligne.
   Quand il n'est pas calculable, on dit le tarif et la durée — et on ne
   fabrique pas de total. Le loueur fera son prix, c'est son métier. */
export function ligneDeCompte(prix, unite, jours) {
  const c = prixLocation(prix, unite, jours);
  if (!c.calculable) {
    return "💰 " + eurosLocation(prix) + " " + c.unite
      + " — " + jours + " jour" + (jours > 1 ? "s" : "") + " : prix à confirmer";
  }
  if (c.duree.jours === 1) {
    return "💰 " + jours + " × " + eurosLocation(prix) + " = " + eurosLocation(c.total);
  }
  return "💰 " + eurosLocation(prix) + " " + c.unite
    + " × " + jours + " jour" + (jours > 1 ? "s" : "")
    + " = " + eurosLocation(c.total);
}
