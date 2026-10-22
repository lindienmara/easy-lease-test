// LE TRONC COMMUN DU MOTEUR
// -------------------------
// Tout ce que les DEUX types de boutique partagent : les donnees lues, les
// couleurs, les photos, les prix, la commande, la fiche d'un produit.
// Une correction faite ici profite a TOUTES les boutiques, quel que soit
// leur type. C'est la « meme sauvegarde » qui s'applique partout.
//
// Ce qui distingue un type de l'autre ne vit PAS ici : voir type-familles.jsx
// et type-liste.jsx. Ces deux fichiers ne se lisent jamais l'un l'autre, et
// c'est exactement ce qui permet de corriger l'un sans abimer l'autre.

import React, { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Search, ShoppingCart, Plus, Minus, X,
  Home, Info, Link2, Star, MessageCircle, Maximize2, PlayCircle, Package,
  Check,
} from "lucide-react";
import { BOUTIQUE as BOUTIQUE_PUBLIEE, COULEURS as COULEURS_PUBLIEES } from "./config.js";
import { FAMILLES as FAMILLES_PUBLIEES } from "./catalogue.js";
import { visuelFamille, visuelProduit } from "./visuels.js";

/* 🚨 ON NE CHARGE QUE LES CARACTÈRES QU'ON UTILISE.

   Importer les quatre familles « au cas où » ferait télécharger à chaque
   visiteur deux polices qu'il ne verra jamais — sur un partage de connexion,
   c'est de l'attente devant une page blanche. L'allure est connue au moment où
   la boutique est fabriquée : on écrit donc l'import qui correspond, et lui
   seul. */
const ALLURE_PUBLIEE = (BOUTIQUE_PUBLIEE && BOUTIQUE_PUBLIEE.allure) || "atelier";

/* 🚨 EN APERÇU, C'EST L'HABIT ESSAYÉ QUI COMMANDE LES POLICES.
   ─────────────────────────────────────────────────────────────
   La boutique choisit son import de polices d'après l'habit PUBLIÉ, et
   c'est juste pour un visiteur : il ne verra jamais que celui-là, et on
   ne lui fait pas télécharger six familles pour rien.

   Mais en aperçu, l'habit essayé n'est pas l'habit publié. Mesuré le
   16 octobre 2026 en essayant « artisan » sur une vitrine en « atelier » :
   le texte demandait bien Fraunces, et le navigateur avait téléchargé
   Anton et Inter. Il affichait donc Georgia — la police de secours. Le
   vendeur aurait jugé un habit qu'il n'avait pas sous les yeux.

   ⚠️ ET C'EST VRAI DES ANGLES AUSSI : ils voyagent dans la même feuille.

   ⚠️ LE BROUILLON NE SE DÉCODE QU'UNE FOIS. Il pèse une vingtaine de
   kilo-octets ; le relire ici et plus bas, c'était deux décodages base64
   et deux analyses JSON avant la première image. */
let brouillonLu = null;
let brouillonFait = false;
function brouillonUneFois() {
  if (!brouillonFait) { brouillonFait = true; brouillonLu = brouillon(); }
  return brouillonLu;
}
const ALLURE_AFFICHEE = (() => {
  const d = brouillonUneFois();
  return (d && d.BOUTIQUE && d.BOUTIQUE.allure) || ALLURE_PUBLIEE;
})();

/* 🚨 UNE LIGNE PAR ALLURE, ET LA BOUTIQUE N'EN CHARGE QU'UNE.

   C'était trois `? :` en cascade tant qu'il y avait trois allures. À sept,
   une cascade devient illisible et on finit par oublier une branche — c'est
   une table, et on la lit d'un coup d'œil.

   ⚠️ CE QUI N'A PAS CHANGÉ, ET QUI COMPTE : la boutique n'importe QUE sa
   propre ligne. Sept allures ne pèsent pas plus lourd qu'une seule chez le
   visiteur. L'allure est connue au moment de la fabrication. */
const IMPORTS = {
  atelier: "Anton&family=Inter:wght@400;500;600;700;800",
  maison: "Cormorant+Garamond:wght@300;400;500&family=Jost:wght@200;300;400;500",
  or: "Oswald:wght@300;400;500;600;700&family=Jost:wght@200;300;400;500",
  /* 🚨 DEUX FAMILLES PAR LIGNE, ET LA POLICE D'AFFICHE NE SERT QU'AU TITRE.
     Du Monoton sur un paragraphe de description serait illisible, et du
     Caveat sur un prix ferait douter du montant. Le caractère se joue sur
     le nom et les titres, jamais sur le corps du texte. */
  editorial: "Abril+Fatface&family=Inter:wght@400;500;600;700;800",
  studio: "Italiana&family=Jost:wght@200;300;400;500",
  artisan: "Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700;800",
  tendre: "Lobster&family=Quicksand:wght@400;500;600;700",
  nuit: "Monoton&family=Jost:wght@200;300;400;500",
  rond: "Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700",
};
/* 🚨 LES ANGLES, EN UN SEUL ENDROIT POUR TOUTE LA BOUTIQUE.
   ────────────────────────────────────────────────────────
   Cent vingt-cinq cadres portent une classe d'arrondi dans le moteur.
   Les reprendre un par un pour obéir à l'habit aurait été un chantier de
   cent vingt-cinq corrections — et cent vingt-cinq occasions d'en oublier
   une. On redéfinit donc les trois classes UNE fois, ici, et les cent
   vingt-cinq suivent sans qu'aucune ne soit touchée.

   🚨 ET SEULEMENT POUR LES QUATRE HABITS NÉS LE 16 OCTOBRE 2026.
   « atelier », « maison » et « or » n'émettent RIEN : elles gardent
   exactement les arrondis qu'elles ont depuis toujours. Amira Luxury
   tourne en « maison » et Mapuche Arts en « atelier » — aucune boutique
   en service ne doit bouger d'un pixel parce qu'on en ajoute d'autres.

   ⚠️ « rounded-full » N'EST JAMAIS TOUCHÉ : il fait les pastilles, les
   ronds de logo et les boutons circulaires. Les carrer les casserait.

   ⚠️ Et l'`@import` doit rester la PREMIÈRE règle de la feuille — une
   règle d'import placée après une autre règle est ignorée. D'où ces
   lignes ajoutées après, jamais avant. */
const ANGLES_CSS = {
  editorial: [2, 2, 3],
  studio: [0, 0, 0],
  artisan: [8, 10, 12],
  tendre: [14, 18, 22],
  /* Un tube de néon est rond : le carrer ferait panneau de chantier. */
  nuit: [12, 16, 20],
  /* Le plus arrondi de tous : la lettre est ronde, les cadres suivent. */
  rond: [16, 20, 26],
};

function anglesDeLHabit(cle) {
  const a = ANGLES_CSS[cle];
  if (!a) return "";
  return `
.rounded-lg{border-radius:${a[0]}px}
.rounded-xl{border-radius:${a[1]}px}
.rounded-2xl{border-radius:${a[2]}px}`;
}

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=${IMPORTS[ALLURE_AFFICHEE] || IMPORTS.atelier}&display=swap');${anglesDeLHabit(ALLURE_AFFICHEE)}`;

// APERÇU — l'éditeur ouvre la boutique avec le brouillon dans l'adresse, après
// le dièse : .../?apercu=1#<données>. La partie après le dièse ne quitte jamais
// le navigateur, et ce mécanisme fonctionne même quand l'éditeur est hébergé
// ailleurs que la boutique. Sans ce paramètre, rien ne change.
function brouillon() {
  try {
    /* 🚨 DEUX FORMES, ET LA SECONDE EXISTE POUR UNE RAISON PRÉCISE.

         .../?apercu=1#<données>    l'atelier ouvre une boutique EN LIGNE
         .../index.html#apercu=<données>   la vitrine livrée avec l'atelier

       La seconde ne se sert que du dièse. L'atelier s'ouvre aussi par
       double-clic depuis un disque, et là, rien ne garantit qu'une adresse
       de fichier transporte sa partie « ? » : la boutique s'afficherait
       alors telle qu'elle est publiée, c'est-à-dire pas du tout dans le
       type qu'on voulait montrer. Le dièse, lui, ne quitte jamais le
       navigateur et survit partout. */
    const diese = location.hash.replace(/^#/, "");
    const charge = diese.startsWith("apercu=")
      ? diese.slice(7)
      : (new URLSearchParams(location.search).get("apercu") === "1" ? diese : "");
    if (!charge) return null;
    const binaire = atob(charge);
    const octets = Uint8Array.from(binaire, (c) => c.charCodeAt(0));
    const d = JSON.parse(new TextDecoder().decode(octets));
    if (!d || !d.BOUTIQUE || !d.COULEURS || !Array.isArray(d.FAMILLES)) return null;
    return d;
  } catch (e) {
    return null;
  }
}

export const APERCU = brouillonUneFois();

/* CE QU'ON VENAIT VOIR
   ════════════════════

   L'atelier glisse un mot dans le brouillon pour dire sur quoi il
   travaillait au moment du clic :

     "ouverture" → l'animation se joue, et un bouton la rejoue ;
     "boutique"  → l'animation est sautée, on arrive sur le catalogue.

   Rien, c'est l'ancien comportement : l'ouverture se joue. Un atelier plus
   ancien que cette idée n'envoie pas ce mot, et la boutique se conduit
   alors exactement comme avant.

   ⚠️ Ce mot ne vit QUE dans l'aperçu. Un visiteur n'a pas de brouillon :
   pour lui, VERS vaut "" et l'ouverture suit sa règle habituelle, une fois
   par visite.  */
export const VERS = APERCU && typeof APERCU.VERS === "string" ? APERCU.VERS : "";

/* CET APPAREIL REFUSE-T-IL LES ANIMATIONS ?

   Quand il les refuse, la règle « prefers-reduced-motion » plus bas coupe
   TOUTES les animations d'ouverture. C'est voulu : on n'impose pas du
   mouvement à qui demande de s'en passer.

   Mais le vendeur qui règle son ouverture sur un tel appareil ne voit rien
   bouger et croit sa boutique cassée — deux séances perdues là-dessus. En
   aperçu, on le lui dit. Un visiteur, lui, n'a rien à savoir de ça. */
export const MOUVEMENT_REDUIT = typeof matchMedia === "function"
  && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const BOUTIQUE = APERCU ? { ...BOUTIQUE_PUBLIEE, ...APERCU.BOUTIQUE } : BOUTIQUE_PUBLIEE;
export const COULEURS = APERCU ? { ...COULEURS_PUBLIEES, ...APERCU.COULEURS } : COULEURS_PUBLIEES;

/* 🚨 EN APERÇU, LE FOND DE PAGE SUIT AUSSI.
   ─────────────────────────────────────────
   « html,body{background:…} » est écrit DANS LA PAGE au moment de la
   fabrication, d'après les couleurs publiées (vite.config.js). Il ne peut
   donc pas suivre un aperçu : on essaie l'accord vert d'« Artisan » sur une
   vitrine publiée en bordeaux, et il reste un cadre bordeaux autour.

   Sur un téléphone, l'application remplit l'écran et ça ne se voit presque
   pas. Sur l'écran d'un PC — là où le vendeur regarde ses aperçus — c'est
   un cadre de la mauvaise couleur autour de tout.

   ⚠️ UNIQUEMENT EN APERÇU. Pour un visiteur, la couleur écrite à la
   fabrication est la bonne, et elle a l'avantage d'être là AVANT que le
   JavaScript ne tourne : la toucher coûterait un clignotement à chaque
   arrivée, pour rien. */
if (APERCU && typeof document !== "undefined") {
  try {
    const f = COULEURS.fond;
    if (f) {
      document.documentElement.style.background = f;
      document.body.style.background = f;
    }
  } catch (e) { /* rien : un fond de page n'empêche pas de montrer la boutique */ }
}
/* ───────────── UN RAYON PEUT FERMER SANS DISPARAÎTRE ─────────────
   Le fournisseur n'a pas livré, la saison est finie, le vendeur s'absente une
   semaine. Jusqu'ici la seule sortie était de SUPPRIMER la famille — et avec
   elle ses articles, ses prix, ses photos et ses descriptions, tout à
   ressaisir au retour. Personne ne devrait avoir à détruire son rayon pour
   dire « pas cette semaine ».

   Une famille porte donc un interrupteur, « dispo ». Fermée, elle reste
   visible et se visite : le client voit ce qui existe, comprend que ce n'est
   pas commandable aujourd'hui, et revient. Un seul geste la rouvre, intacte.

   Le réglage est appliqué ICI, une seule fois, en marquant chaque article
   épuisé. Tout le reste de la boutique — étiquettes, panier, bouton de
   commande, vedettes — sait déjà traiter un article épuisé : aucun écran n'a à
   connaître la notion de rayon fermé. */
export const EN_RUPTURE = (f) => !!f && f.dispo === false;

const RAYON_FERME = (f) => (!EN_RUPTURE(f) ? f : {
  ...f,
  gammes: (f.gammes || []).map((g) => ({
    ...g,
    produits: (g.produits || []).map((p) => ({ ...p, dispo: false })),
  })),
});

/* ───────────── LES PROMOTIONS, APPLIQUÉES UNE SEULE FOIS ─────────────

   Une remise peut être posée à trois niveaux : sur un produit, sur une gamme,
   ou sur une famille entière. La plus PRÉCISE l'emporte — une remise écrite
   sur un produit gagne sur celle de sa gamme, qui gagne sur celle de sa
   famille. C'est l'ordre naturel : on solde un rayon, puis on fait une offre
   à part sur un article de ce rayon.

   ★ POURQUOI ON RÉÉCRIT LE PRIX ICI, ET PAS À L'AFFICHAGE.

   La tentation était de barrer l'ancien prix au moment de le dessiner, et de
   n'y toucher nulle part ailleurs. C'était un piège : le panier, le total et
   le message de commande lisent « produit.prix » chacun de leur côté. Le
   client aurait vu −50 % sur la fiche, puis le plein tarif dans son message —
   et ce message est ce qu'il envoie pour commander.

   Alors le prix EST le prix remisé, dès le chargement du catalogue. Tout ce
   qui compte de l'argent est juste sans rien avoir à savoir des promotions.
   L'ancien prix est conservé à côté, sous « prixInitial », et ne sert qu'à
   être barré. */
const REMISE = (v) => {
  const n = Number(v) || 0;
  // Au-delà de 90 % on vend à perte par accident ; en dessous de 1, ce n'est
  // pas une promotion, c'est une erreur de frappe.
  return n >= 1 && n <= 90 ? Math.round(n) : 0;
};

/* LE PRIX PROMOTIONNEL ÉCRIT À LA MAIN.

   Il doit être strictement INFÉRIEUR au prix normal : à prix égal ce n'est
   pas une promotion, et au-dessus c'est une faute de frappe qu'il vaut mieux
   ignorer que publier. Dans les deux cas on retombe sur le comportement
   d'avant — les pourcentages reprennent la main. */
const PRIX_PROMO = (v, prixNormal) => {
  const n = Math.round((Number(v) || 0) * 100) / 100;
  return n > 0 && n < prixNormal ? n : 0;
};

/* Ce qu'on AFFICHE sur la pastille, à partir des deux prix. Arrondi vers le
   BAS : une remise annoncée doit toujours être tenue. 200 € → 155 € vaut
   22,5 %, et on écrit « −22 % ». */
const TAUX_VU = (avant, apres) =>
  avant > 0 && apres < avant ? Math.floor(((avant - apres) / avant) * 100) : 0;

/* ⚠️ LA PROMOTION S'ARRÊTE TOUTE SEULE.
   ──────────────────────────────────────
   « Une semaine ou deux » ne se termine jamais le bon jour : on y repense le
   mardi suivant, et la boutique a vendu trois jours de plus à −25 %.

   Le dernier jour est écrit dans les réglages. La boutique le compare à la
   date du visiteur à chaque visite, et reprend ses prix normaux le lendemain
   — sans que personne ait à republier quoi que ce soit, ni même à y penser.

   On compare des JOURS, écrits « AAAA-MM-JJ », et jamais des heures : dans
   cette écriture, comparer deux textes revient à comparer deux dates, et
   aucun décalage horaire ne peut faire basculer la boutique une nuit trop
   tôt. Le jour inscrit est inclus — c'est encore un jour de promotion. */
const PROMOTIONS_TERMINEES = (() => {
  const fin = String(BOUTIQUE.promoFin || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fin)) return false;
  const d = new Date();
  const jour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return jour > fin;
})();

const EN_PROMOTION = (famille) => (PROMOTIONS_TERMINEES ? famille : {
  ...famille,
  gammes: (famille.gammes || []).map((gamme) => ({
    ...gamme,
    produits: (gamme.produits || []).map((produit) => {
      /* ⚠️ AUCUNE REMISE SUR UN ARTICLE ÉPUISÉ, NULLE PART.
         ────────────────────────────────────────────────────
         Pas même dans son propre rayon, où il reste pourtant affiché pour
         annoncer son retour. Un « 20,00 € barré, 10,00 €, −50 % » sur une
         pièce qu'on ne peut pas commander, c'est une promesse en l'air : le
         client la lit, veut l'acheter, et découvre ÉPUISÉ. Il garde donc son
         prix normal, sans prix barré ni pastille.

         Cela vaut aussi quand la remise vient de la GAMME ou de la FAMILLE
         entière : une remise posée sur tout un rayon saute les pièces
         épuisées de ce rayon, une par une.

         Et rien n'est perdu : le calcul se refait à chaque visite. Le jour où
         tu remets l'article en vente — même au milieu de la promotion — il
         retrouve sa remise tout seul, sans que tu aies à la reposer. */
      if (produit.dispo === false) return produit;

      const avant = Number(produit.prix) || 0;
      if (avant <= 0) return produit; // rien à remiser sur un prix non renseigné

      /* 🚨 UN PRIX ÉCRIT À LA MAIN GAGNE SUR TOUS LES POURCENTAGES.

         C'est la suite de la règle « la plus précise l'emporte » : un prix
         écrit sur un article est plus précis qu'un −25 % posé sur tout son
         rayon. Et c'est la seule façon d'atteindre certains prix — les
         pourcentages entiers laissent des trous (200 € ne peut pas donner
         155 €, seulement 156 ou 154). */
      const ecrit = PRIX_PROMO(produit.prixPromo, avant);
      if (ecrit) {
        return { ...produit, prix: ecrit, prixInitial: avant, remise: TAUX_VU(avant, ecrit) };
      }

      const taux = REMISE(produit.remise) || REMISE(gamme.remise) || REMISE(famille.remise);
      if (!taux) return produit;

      // Arrondi au centime : un prix à 18,749999 € s'affiche mal et se
      // calcule encore plus mal une fois multiplié par la quantité.
      const apres = Math.round(avant * (100 - taux)) / 100;
      return { ...produit, prix: apres, prixInitial: avant, remise: taux };
    }),
  })),
});

export const FAMILLES = (APERCU ? APERCU.FAMILLES : FAMILLES_PUBLIEES)
  .map(RAYON_FERME)
  .map(EN_PROMOTION);

// Une famille peut être une galerie de vidéos au lieu d'un rayon de produits.
// Elle se place où on veut dans la liste, et rien ne s'y achète : ni prix, ni
// panier. C'est le seul champ qui distingue les deux.
export const EST_VIDEOS = (f) => f.type === "videos";

// Un produit peut porter plusieurs photos. « images » est la liste complète,
// « image » la première — gardée pour les catalogues écrits avant la galerie.
export const GALERIE = (p) =>
  Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);

/* ★ POURQUOI UNE CLÉ, ET PAS LA RÉFÉRENCE DU PRODUIT
   React identifie chaque carte d'une liste par une « clé ». Deux cartes de même
   clé, et il les confond : en changeant de famille, il garde les anciennes
   cartes, en oublie de nouvelles, et mélange les deux. À l'écran, ça donne des
   articles qui manquent et des articles d'une autre famille qui s'ajoutent à la
   suite — sans la moindre erreur signalée.

   Or rien n'oblige une référence à être unique : REF-003 peut servir dans trois
   collections différentes, et c'est bien légitime. La clé est donc construite
   ici, à partir de l'endroit exact où le produit se trouve — famille, gamme,
   rang. Deux produits ne peuvent pas occuper la même place.

   Conséquence : les catalogues qui réutilisent leurs références s'affichent
   correctement, sans avoir à les renuméroter. */
export const CLE = (f, g, i, p) => `${f.id}|${g.id}|${i}|${p.ref || ""}`;

export const TOUS_PRODUITS = FAMILLES.filter((f) => !EST_VIDEOS(f)).flatMap((f) =>
  f.gammes.flatMap((g) => g.produits.map((p, i) => ({ ...p, famille: f, gamme: g, cle: CLE(f, g, i, p) })))
);
export const SELECTION_CHEF = TOUS_PRODUITS.filter((p) => p.chef);

// Les produits mis en vedette occupent le haut de l'accueil, en petits carrés
// noirs, quatre par ligne. Volontairement compacts : le catalogue doit rester
// visible juste dessous, sans faire défiler.
export const VEDETTES = TOUS_PRODUITS.filter((p) => p.vedette).slice(0, 8);

/* ⚠️ UNE PROMOTION QUE PERSONNE NE TROUVE N'EN EST PAS UNE.
   ────────────────────────────────────────────────────────
   Les remises étaient bien appliquées : le prix barré s'affichait, mais
   seulement une fois le client ARRIVÉ sur la bonne collection. Sur l'accueil,
   rien ne disait qu'une promotion était en cours. Il fallait ouvrir les
   rayons un par un pour tomber dessus — autrement dit, personne ne la voyait.

   D'où ce rayon, qui n'existe que les jours de promotion et disparaît tout
   seul le reste du temps. Aucun réglage à faire : il se remplit de ce qui est
   remisé, où que ce soit dans le catalogue.

   Il NE FAIT PAS PARTIE du catalogue — « TOUS_PRODUITS », la recherche et les
   comptes sont calculés avant lui. Sans cette précaution, chaque article
   remisé serait apparu deux fois dans la présentation « tout sur une page »,
   et « 83 articles » en aurait annoncé 87. */
/* ⚠️ UN ARTICLE ÉPUISÉ N'A RIEN À FAIRE DANS LES PROMOTIONS.
   Le rayon est fait pour donner envie d'acheter. Y laisser un article qu'on
   ne peut pas commander, c'est promettre −50 % sur rien : le client clique,
   lit « ÉPUISÉ », et repart. Il reste visible dans son rayon d'origine, lui,
   parce que là il annonce honnêtement un retour.

   « dispo » suffit à les écarter tous les deux : un rayon entier mis en
   rupture pose déjà « dispo: false » sur chacun de ses articles, plus haut
   dans ce fichier. */
/* 🚨 ON REGARDE LES PRIX, ET NON LA REMISE STOCKÉE.

   Ce test exigeait « remise > 0 ». Un prix écrit à la main ne stocke aucune
   remise — et quand il vaut moins de 1 % du prix normal, la pastille elle-
   même disparaît. Ces articles étaient donc absents du rayon des promotions
   alors que leur prix était bel et bien baissé.

   « Le prix d'origine est-il plus haut que le prix actuel ? » répond juste
   pour les deux écritures, et ne peut pas se désynchroniser d'elles. */
const EN_PROMOTION_MAINTENANT = (p) =>
  Number(p.prixInitial) > Number(p.prix) && p.dispo !== false;

export const PRODUITS_EN_PROMOTION = TOUS_PRODUITS.filter(EN_PROMOTION_MAINTENANT);

/* La plus forte baisse du jour. Elle sert à écrire « JUSQU'À −50 % » sur la
   porte du rayon : un chiffre vrai, recalculé à chaque chargement, et qui
   disparaît tout seul le jour où les promotions se terminent.

   ⚠️ ELLE SE CALCULE SUR LES PRIX, et non sur les remises stockées : un prix
   écrit à la main n'en stocke aucune, et le bloc doré aurait annoncé
   « JUSQU'À −0 % » sur une boutique pleine de promotions. */
export const REMISE_MAXIMALE = PRODUITS_EN_PROMOTION.reduce(
  (m, p) => Math.max(m, TAUX_VU(Number(p.prixInitial) || 0, Number(p.prix) || 0)),
  0,
);

/* Un groupe par rayon d'origine, et non un seul tas : « DRAPEAUX » puis
   « SERVIETTES » se parcourt, trente articles en vrac ne se parcourt pas. */
export const FAMILLE_PROMOTIONS = PRODUITS_EN_PROMOTION.length
  ? {
    id: "promotions",
    nom: "TOUTES LES PROMOTIONS",
    emoji: "🏷️",
    glyphe: "etoile",
    image: "",
    video: "",
    type: "produits",
    dispo: true,
    promotions: true,              // ce rayon-ci n'est pas un rayon du vendeur
    /* ⚠️ ON LIT « COULEURS », ET NON « rose » ET « jaune ».
       Ces deux raccourcis sont déclarés plus bas dans ce fichier. Les employer
       ici les emploierait AVANT leur déclaration : la boutique s'arrêtait net
       au chargement — « Cannot access before initialization » — et la page
       restait blanche. Le réglage, lui, existe dès le début du fichier. */
    couleurs: [COULEURS.rose, COULEURS.jaune],
    gammes: FAMILLES
      .filter((f) => !EST_VIDEOS(f))
      .map((f) => ({
        id: "promo-" + f.id,
        nom: f.nom,
        etiquette: "%",
        sousTitre: "",
        produits: (f.gammes || []).flatMap((g) => (g.produits || []).filter(EN_PROMOTION_MAINTENANT)),
      }))
      .filter((g) => g.produits.length),
  }
  : null;

/* ═══════ LES DEUX RAYONS D'ÉTAT (N°20) ═══════

   « Je veux deux rayons automatiques de plus, exactement sur le même
   modèle : même grande carte sur l'accueil, même rayon qui s'ouvre, même
   calcul automatique, mais avec leurs propres couleurs. » — 22 oct. 2026.

   🔁 BIENTÔT DE RETOUR  : un produit épuisé qui revient.
   ✨ NOUVEL ARRIVAGE     : un produit annoncé, pas encore vendable.

   ⚠️ CE SONT DES PRODUITS « dispo: false », ET C'EST VOULU : rien ne s'y
   commande, l'atelier et la donnée le garantissent tous les deux. Ils sont
   donc déjà absents des promotions (voir EN_PROMOTION_MAINTENANT) et du
   panier. Le rayon ne fait que les RASSEMBLER — il ne les rend pas
   achetables.

   ⚠️ ET ILS RESTENT DANS LEUR RAYON D'ORIGINE, comme les promotions : un
   client qui parcourt « DRAPEAUX » doit voir qu'un drapeau revient. Le
   rayon automatique est un RACCOURCI, pas un déménagement.

   ⚠️ « COULEURS » ET NON « rose » : c'est la même contrainte que pour les
   promotions, vingt lignes plus haut. Les raccourcis de couleur sont
   déclarés PLUS BAS dans ce fichier ; les employer ici arrêtait la boutique
   au chargement, page blanche. */
const DANS_L_ETAT = (quoi) => (p) => p.etat === quoi;

/* 🚨 LE RAYON DES NOUVEAUTÉS SUIT L'ÉTIQUETTE, PAS L'ÉTAT — 22 oct. 2026.

   Il suivait « etat: arrivage », donc il ne contenait QUE des produits pas
   encore arrivés. Un client lisait « ✨ NOUVEAU » et n'avait pas de bouton
   pour l'acheter : « on dirait qu'ils sont déjà là », et c'était trompeur
   dans les deux sens.

   Une nouveauté EN VENTE y a maintenant sa place, avec son bouton. C'est le
   cas le plus courant d'une boutique : la marchandise est arrivée. */
/* 🚨 ET IL RECONNAÎT LES CATALOGUES D'AVANT. « arrivage » voulait dire
   « nouvel arrivage » : c'était le seul moyen de dire « c'est neuf ». Une
   boutique dont le moteur se met à jour NE REPUBLIE PAS son catalogue — il
   reste celui d'hier. Sans cette seconde moitié, le raccourci et le badge
   disparaissaient de sa boutique à la minute où le moteur montait. Mesuré
   sur Mapuche Arts le 22 octobre 2026, trois minutes après la mise en ligne.

   ⚠️ « undefined » = ce catalogue ne connaît pas encore l'étiquette.
   « false » = le vendeur l'a retirée, et ça on n'y touche pas. */
export const EST_UNE_NOUVEAUTE = (p) => (p.nouveaute === undefined
  ? p.etat === "arrivage"
  : p.nouveaute === true);

/* Un seul fabricant pour les deux : ils ne diffèrent que par leur mot, leur
   nom et leurs couleurs. Deux copies auraient divergé au premier défaut
   corrigé d'un seul côté.

   ⚠️ LE RAYON DES PROMOTIONS N'EST PAS PASSÉ PAR ICI, exprès : il marche,
   il est éprouvé par essayer-les-promotions.mjs, et il a sa propre grande
   carte dorée. On n'est pas venu le réécrire. */
/* ⚠️ « dedans » EST UN ARGUMENT DEPUIS LE 22 OCTOBRE : les retours se
   reconnaissent à leur état, les nouveautés à leur étiquette. Un seul
   fabricant pour les deux, deux façons d'y entrer. */
function rayonDEtat(quoi, nom, emoji, couleurs, filtre = null) {
  const dedans = filtre || DANS_L_ETAT(quoi);
  const produits = TOUS_PRODUITS.filter(dedans);
  if (!produits.length) return null;
  return {
    id: "etat-" + quoi,
    nom,
    emoji,
    glyphe: "etoile",
    image: "",
    video: "",
    type: "produits",
    dispo: true,                   // le RAYON s'ouvre ; ses produits, non
    rayonEtat: quoi,               // ce rayon-ci n'est pas un rayon du vendeur
    couleurs,
    /* Un groupe par rayon d'origine, comme pour les promotions : « DRAPEAUX »
       puis « SERVIETTES » se parcourt, trente articles en vrac non. */
    gammes: FAMILLES
      .filter((f) => !EST_VIDEOS(f))
      .map((f) => ({
        id: "etat-" + quoi + "-" + f.id,
        nom: f.nom,
        etiquette: emoji,
        sousTitre: "",
        /* 🚨 D'OÙ VIENT CETTE GAMME. Sans cette ligne, un article ouvert
           depuis le rayon d'état ne savait plus à quel rayon du vendeur il
           appartient — et le bouton « [Rayon] disponibles › », celui qui ne
           perd pas la vente, disparaissait. Vu à l'écran le 22 octobre 2026,
           pas dans le code. */
        origine: f,
        produits: (f.gammes || []).flatMap((g) => (g.produits || []).filter(dedans)),
      }))
      .filter((g) => g.produits.length),
  };
}

/* 🚨 DEUX COULEURS QUI SONT VRAIMENT DEUX — MESURÉ, PAS SUPPOSÉ.

   Vu à l'écran le 22 octobre 2026 sur la palette « Rouge et or » : « jaune »,
   « vert » et « cyan » y valent TOUS LES TROIS le même doré #F7C873. Le
   dégradé du rayon devenait un aplat, et les deux rayons étaient de la même
   couleur — donc impossibles à distinguer l'un de l'autre.

   On prend donc la première couleur de la liste qui diffère vraiment. Les
   palettes où tout se ressemble retombent sur la couleur principale, qui par
   construction n'est jamais celle des accents. */
const MEME_TEINTE = (a, b) => String(a || "").trim().toLowerCase()
  === String(b || "").trim().toLowerCase();

const PAIRE = (premiere, ...candidates) => {
  const seconde = candidates.find((c) => c && !MEME_TEINTE(premiere, c));
  return [premiere, seconde || premiere];
};

export const FAMILLE_RETOUR = rayonDEtat(
  "retour", "ILS REVIENNENT BIENTÔT", "🔔",
  PAIRE(COULEURS.cyan, COULEURS.violet, COULEURS.rose),
);
export const FAMILLE_ARRIVAGE = rayonDEtat(
  "arrivage", "NOUVEAUTÉS", "✨",
  PAIRE(COULEURS.vert, COULEURS.rose, COULEURS.violet),
  EST_UNE_NOUVEAUTE,
);

/* Les deux ensemble, dans l'ordre où ils se montrent. Les jours où aucun
   produit n'est dans ces états, la liste est vide et rien ne paraît. */
export const RAYONS_D_ETAT = [FAMILLE_RETOUR, FAMILLE_ARRIVAGE].filter(Boolean);

// La liste des rayons telle qu'on la MONTRE : le rayon des promotions en tête,
// les jours où il existe. C'est la seule liste qui le contient.
/* 🚨 LES DEUX RAYONS D'ÉTAT NE SONT PLUS DANS CETTE LISTE — N°21.

   Ils y étaient, en grandes cartes, comme celui des promotions. Sa demande
   du 22 octobre 2026, après avoir revu le dessin : « je n'en veux plus ».
   Et il a raison : une nouveauté se découvre EN PARCOURANT les produits,
   rangée avec les autres. Deux grandes cartes de plus poussaient les vrais
   rayons du vendeur sous le pli.

   Ils existent toujours, entiers — on y entre par les deux petits
   raccourcis (« RaccourcisDEtat », plus bas) et par les boutons du bas
   d'une fiche. Seule leur place dans CETTE liste a disparu.

   ⚠️ LA GRANDE CARTE DORÉE DES PROMOTIONS, ELLE, NE BOUGE PAS. C'est écrit
   en toutes lettres dans la consigne, et elle est éprouvée ailleurs. */
export const FAMILLES_AFFICHEES = FAMILLE_PROMOTIONS
  ? [FAMILLE_PROMOTIONS, ...FAMILLES]
  : FAMILLES;

/* Combien de produits dans chaque état, pour les raccourcis et les badges.
   Recalculé à chaque chargement, comme le compte des promotions : un chiffre
   faux rassure plus mal qu'une absence de chiffre. */
export const NB_RETOUR = TOUS_PRODUITS.filter(DANS_L_ETAT("retour")).length;
export const NB_ARRIVAGE = TOUS_PRODUITS.filter(EST_UNE_NOUVEAUTE).length;
/* ⚠️ COMBIEN DE NOUVEAUTÉS NE SONT PAS ENCORE LÀ : le raccourci le dit quand
   elles le sont TOUTES, et ne le dit pas sinon. « 6 bientôt dispo » sur un
   rayon où cinq s'achètent serait un mensonge dans l'autre sens. */
export const NB_NOUVEAUTES_A_VENIR = TOUS_PRODUITS
  .filter((p) => EST_UNE_NOUVEAUTE(p) && p.dispo === false).length;

/* ⚠️ ET PAR FAMILLE, pour le petit badge doré « ✨ 6 nouveautés » posé sur sa
   tuile. On compte DANS la famille du vendeur, pas dans le rayon d'état :
   c'est la tuile « DRAPEAUX » qui doit le dire, pas une carte à part. */
export const COMPTE_D_ETAT = (f, quoi) => (f.gammes || []).reduce(
  (n, g) => n + (g.produits || [])
    .filter(quoi === "nouveaute" ? EST_UNE_NOUVEAUTE : DANS_L_ETAT(quoi)).length,
  0,
);

// « −50 % » posé sur une photo. Le même repère partout : sur la tuile du
// rayon, sur les vedettes de l'accueil, sur une carte de produit.
export function EtiquettePromo({ taux, className = "absolute top-2 left-2", petit = false }) {
  if (!(Number(taux) > 0)) return null;
  return (
    <span
      className={className}
      style={{
        background: rose, color: ENCRE(rose), fontFamily: CORPS, fontWeight: 800,
        fontSize: petit ? 8.5 : 10.5, letterSpacing: ".02em",
        borderRadius: petit ? 4 : 6, padding: petit ? "1px 3px" : "2px 7px",
        whiteSpace: "nowrap", boxShadow: "0 1px 4px #000A",
      }}
    >
      −{taux}%
    </span>
  );
}

// Deux façons de présenter le même catalogue :
//   « familles » : on descend famille → gamme → produit
//   « liste »    : tout sur une page, avec recherche et pastilles de catégories
// C'est un réglage, pas un moteur séparé : les deux profitent des mêmes
// nouveautés, et une boutique peut changer d'avis sans rien perdre.
// Le dessin de secours d un produit : le meme visuel, sans sa photo.
export const SECOURS = (p, famille) => visuelProduit({ ...p, image: "", images: [] }, famille.couleurs, famille.glyphe);

export const PRESENTATION = ["liste", "luxe", "marques", "location"].includes(BOUTIQUE.presentation)
  ? BOUTIQUE.presentation : "familles";

/* 🚨 LA LOCATION N'EST PAS UNE PRÉSENTATION DE PLUS : C'EST UN AUTRE MOTEUR.
   ─────────────────────────────────────────────────────────────────────────
   « liste », « luxe » et « marques » sont des façons de ranger les mêmes
   articles : on vend, on met au panier, on choisit une taille. Passer de
   l'une à l'autre ne fait rien perdre, et c'est pour ça qu'elles vivent dans
   un seul moteur.

   Louer un véhicule n'a rien de tout ça. Pas de quantité — une voiture se
   loue une fois à la fois. Pas de taille, pas de couleur. Pas de frais
   d'envoi. En revanche il y a des DATES, une caution, un calendrier, et un
   véhicule déjà pris qu'il faut refuser.

   Mêler les deux dans App.jsx aurait donné un fichier où chaque correction
   d'un côté risque l'autre : un panier qui compte des voitures, une taille
   demandée pour une Clio, un « envoi offert dès 50 € » sur une caution.
   L'aiguillage se fait donc AVANT, dans main.jsx :

       App.jsx            la vente        — ne connaît ni date ni caution
       App-location.jsx   la location     — ne connaît ni panier ni taille
       commun.jsx         le socle        — ce qui est vrai des deux

   Le contrôle outils/verifier-separation.mjs refuse la fabrication si l'un
   déborde sur l'autre. Ce n'est pas une règle de style : c'est ce qui
   garantit qu'on peut toucher à l'un sans rien casser chez l'autre. */
export const EST_LOCATION = PRESENTATION === "location";

// Cadrage des photos. « carre » remplit le cadre quitte à couper les bords,
// « entier » montre toute l'image quitte à laisser des bandes. Jamais de
// déformation dans un cas comme dans l'autre.
export const AJUSTEMENT = (p) =>
  ((p && p.cadrage) || (BOUTIQUE.imageEntiere ? "entier" : "carre")) === "entier"
    ? "contain"
    : "cover";

// Forme du cadre réservé aux photos. Sans elle, une photo en hauteur resterait
// petite au milieu d'un carré : c'est la place disponible qu'il faut changer,
// pas seulement la façon de remplir.
const PROPORTIONS = { carre: "1 / 1", portrait: "3 / 4", paysage: "4 / 3", libre: "" };
export const PROPORTION_PHOTO = PROPORTIONS[BOUTIQUE.formatPhoto] ?? "1 / 1";

// « libre » : aucune proportion imposée, la carte prend la hauteur de l'image,
// qui s'affiche donc entière et sans bande. Sinon le cadre garde sa forme.
export const STYLE_PHOTO = (p) =>
  PROPORTION_PHOTO
    ? { aspectRatio: PROPORTION_PHOTO, objectFit: AJUSTEMENT(p), background: fondCarte }
    : { height: "auto", background: fondCarte };

/* ─────────────────────── LE CADRAGE EST UN AFFICHAGE ───────────────────────
   Les photos sont enregistrées entières. Ce qui est visible dans la boutique
   n'est pas un découpage du fichier mais un réglage : un point de visée et un
   grossissement, appliqués à l'affichage.

   Conséquence : changer de forme — carré, portrait, paysage — ou déplacer le
   cadre ne demande jamais de renvoyer une photo, et ne fait jamais perdre un
   morceau de l'original. */
export function Photo({ produit, source, alt, style, className, secours }) {
  const zoom = Number(produit && produit.cadrageZoom) || 1;
  const visee = (produit && produit.cadragePos) || "50% 50%";
  const cadre = style || STYLE_PHOTO(produit);

  // Un fichier absent — photo pas encore envoyée, boutique dupliquée sans ses
  // images — ne doit pas laisser un cadre vide : on retombe sur le dessin.
  const surEchec = (e) => {
    if (secours && e.target.src !== secours) e.target.src = secours;
  };

  // Sans grossissement, une simple image suffit : moins de couches, même rendu.
  if (zoom <= 1) {
    return <img src={source} alt={alt} className={className} onError={surEchec} style={{ ...cadre, objectPosition: visee }} />;
  }
  const { objectFit, ...boite } = cadre;
  return (
    <span className={className} style={{ ...boite, display: "block", overflow: "hidden" }}>
      <img
        src={source}
        alt={alt}
        onError={surEchec}
        className="block w-full h-full"
        style={{ objectFit, objectPosition: visee, transform: `scale(${zoom})`, transformOrigin: visee }}
      />
    </span>
  );
}

export const { fond, fondCarte, bordure, texte, texteDoux, rose, violet, vert, jaune, cyan } = COULEURS;

/* ══════════ CLAIR OU SOMBRE ══════════
   🚨 LE MOTEUR A TOUJOURS SUPPOSÉ UN FOND NOIR, SANS LE DIRE.

   Les six palettes proposées sont sombres, toutes. Alors le noir s'est
   installé en dur, un peu partout : le fond de page était « #060505 », les
   barres du haut et du bas « #0B0B0B », et l'encre posée sur les dégradés
   « #fff ». Tant que le fond était noir, ça marchait et rien ne se voyait.

   Demandée en or et blanc, une boutique restait donc noire : « fond:
   #FFFFFF » était bien écrit dans ses réglages, lu, publié — et ignoré.

   Ces deux outils réparent ça sans rien changer aux boutiques sombres :
   elles repassent exactement par les mêmes valeurs qu'avant.

     CLAIR   le fond de la boutique est-il clair ? Mesuré sur la couleur,
             pas déclaré à la main : une palette n'a rien de nouveau à
             renseigner, et une couleur changée dans l'atelier suit toute
             seule.

     ENCRE   de quelle couleur écrire SUR une couleur donnée. Du blanc sur
             de l'or ne se lit pas. La question ne se posait pas tant que
             les dégradés étaient rose et violet. */
const CANAUX = (hex) => {
  const h = String(hex || "").replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  if (n.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
};

/* La clarté perçue, et non la moyenne des trois canaux : l'œil voit le vert
   bien plus que le bleu. Un bleu nuit et un jaune vif ont la même moyenne,
   et l'un se lit en blanc quand l'autre se lit en noir. */
export function clarte(hex) {
  const c = CANAUX(hex);
  if (!c) return 0;
  const [r, v, b] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * v + 0.0722 * b;
}

export const CLAIR = clarte(COULEURS.fond) > 0.5;

/* 🚨 ON COMPARE LES DEUX LISIBILITÉS, ON NE SE DONNE PAS UN SEUIL.

   Premier essai : « au-dessus de 42 % de clarté, on écrit en noir ». L'or
   #C9A227 tombe à 38 %, donc juste en dessous — et le bandeau s'est écrit
   en blanc sur de l'or, c'est-à-dire presque pas.

   Un seuil deviné se trompe toujours sur une couleur ou sur une autre. On
   calcule donc les deux contrastes pour de bon, dans les deux sens, et on
   garde le meilleur. Sur l'or, le noir l'emporte de loin ; sur un bleu
   nuit, c'est le blanc. Plus rien à deviner. */
const ENCRE_SOMBRE = "#15130E";
const CONTRASTE = (a, b) => {
  const [x, y] = [clarte(a) + 0.05, clarte(b) + 0.05];
  return x > y ? x / y : y / x;
};
export const ENCRE = (sur) =>
  (CONTRASTE(sur, ENCRE_SOMBRE) >= CONTRASTE(sur, "#FFFFFF") ? ENCRE_SOMBRE : "#FFFFFF");

/* L'encre des dégradés — barres de section, boutons, bandeau. Un dégradé a
   deux bouts : on choisit l'encre pour le plus CLAIR des deux, parce que
   c'est là que le blanc disparaîtrait. */
export const ENCRE_DEGRADE = ENCRE(clarte(rose) >= clarte(violet) ? rose : violet);

/* Les deux barres collantes — l'en-tête et le menu du bas. Presque opaques,
   pour que le catalogue passe dessous sans se lire au travers. */
export const BARRE = CLAIR ? COULEURS.fond + "EE" : "#0B0B0BEE";
export const BARRE_BASSE = CLAIR ? COULEURS.fond + "F2" : "#0B0B0BF2";

// Image de fond facultative, posée derrière toute la boutique. Un voile sombre
// est ajouté par-dessus pour que les textes restent lisibles, et la colonne
// centrale devient légèrement transparente pour laisser voir l'image.
export const FOND_IMAGE = (BOUTIQUE.fondImage || "").trim();
// Quand une image de fond est posée, la colonne et les espaces deviennent
// transparents : seuls les blocs de contenu gardent un fond, légèrement
// translucide, pour que l'image se voie partout entre les éléments.
export const COLONNE = FOND_IMAGE ? "transparent" : COULEURS.fond;
export const CARTE = FOND_IMAGE ? COULEURS.fondCarte + "D9" : COULEURS.fondCarte;
export const VOILE = (couleur, alpha) => (FOND_IMAGE ? couleur + alpha : couleur);

export const FOND_PAGE = FOND_IMAGE
  ? {
      backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.78)), url("${FOND_IMAGE}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }
  : { background: `radial-gradient(circle at 50% 0%, ${COULEURS.halo || "#17240F"} 0%, ${CLAIR ? COULEURS.fond : "#060505"} 62%)` };
export const DEGRADE = `linear-gradient(90deg, ${rose}, ${violet})`;
/* ═══════════ L'ALLURE : L'HABIT DE LA BOUTIQUE ═══════════

   « presentation » dit comment la boutique est RANGÉE. « allure » dit comment
   elle est HABILLÉE — et rien d'autre. Les deux sont séparés exprès : une
   boutique rangée par marques peut vouloir l'habit d'une maison de couture.

   ⚠️ ABSENTE = « atelier », exactement ce qui existe aujourd'hui. Aucune
   boutique déjà faite ne bouge d'un pixel. */
/* 🚨 DEUX NIVEAUX D'ALLURE, ET IL NE FAUT PAS LES CONFONDRE.
   ─────────────────────────────────────────────────────────
   ① « maison » et « or » ont un DÉCOUPAGE à elles : elles changent la mise
      en page, pas seulement les polices. L'enseigne y remplace le titre, le
      rayon des promotions s'y dessine autrement, les onglets du bas n'y ont
      pas les mêmes étiquettes. Cela vit dans SOIXANTE-DIX branches réparties
      dans App.jsx, type-marques.jsx, type-familles.jsx et type-luxe.jsx.

   ② Les autres ne sont QUE des habits : la police du titre, celle du texte,
      le dessin des étiquettes, l'arrondi des angles. Partout ailleurs elles
      tombent dans le `sinon` qui existe déjà — la mise en page standard.

   ⚠️ UNE ALLURE AJOUTÉE ICI N'A DONC RIEN À APPRENDRE AU RESTE DU MOTEUR.
   C'est voulu, et c'est la seule façon d'en ajouter sans écrire un
   « sinon si » à soixante-dix endroits. Le jour où l'une d'elles mérite son
   propre découpage, elle rejoindra le niveau ①, et ce sera un travail en
   soi — pas une ligne de plus dans cette table.

   ⚠️ ABSENTE OU INCONNUE = « atelier », exactement ce qui existe aujourd'hui.
   Une boutique publiée avec une allure qu'un vieux moteur ne connaît pas
   s'habille en atelier : elle est sobre, jamais cassée. */
const HABITS = {
  atelier: {
    enseigne: { taille: 19, poids: 400, ecart: ".5px", sousTaille: 11 },
    titre: "'Anton', 'Arial Narrow', Impact, sans-serif",
    corps: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    poids: 700, ecart: ".05em", angles: [14, 10],
  },
  maison: {
    enseigne: { taille: 25, poids: 400, ecart: ".06em", filet: true, etiquette: true, sousTaille: 9 },
    titre: "'Cormorant Garamond', 'Times New Roman', Georgia, serif",
    corps: "'Jost', -apple-system, 'Segoe UI', sans-serif",
    poids: 300, ecart: ".22em", angles: [2, 2],
  },
  or: {
    enseigne: { taille: 23, poids: 600, ecart: ".13em", capitales: true, metal: true, etiquette: true, sousTaille: 8, grandNom: true },
    titre: "'Oswald', 'Arial Narrow', Impact, sans-serif",
    corps: "'Jost', -apple-system, 'Segoe UI', sans-serif",
    poids: 300, ecart: ".34em", angles: [2, 2],
  },

  /* ───── LES QUATRE HABITS DU 16 OCTOBRE 2026 ─────
     Chacun vise un métier, parce qu'une allure ne se choisit pas « parce
     qu'elle est jolie » : elle se choisit parce qu'elle ressemble à ce
     qu'on vend. */

  /* Mode, beauté, décoration. Abril Fatface est une « didone grasse » : des
     pleins très épais et des déliés en cheveu, dans la même lettre. C'est le
     contraste le plus fort qu'un caractère puisse porter — on le voit avant
     même de lire le mot. */
  editorial: {
    enseigne: { taille: 30, poids: 400, ecart: "0", filet: true, etiquette: true, sousTaille: 9, grandNom: true },
    titre: "'Abril Fatface', Georgia, 'Times New Roman', serif",
    corps: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    poids: 500, ecart: ".12em", angles: [2, 2],
  },

  /* Galerie, architecte, photographe. Italiana est un roman en CHEVEU :
     presque aucune graisse, des empattements en pointe. Étalée en capitales
     largement espacées, elle ne dit rien d'autre que « regardez ce qu'il y a
     autour ». Les angles à ZÉRO achèvent le propos. */
  studio: {
    enseigne: { taille: 23, poids: 400, ecart: ".26em", capitales: true, etiquette: true, sousTaille: 9, grandNom: true },
    titre: "'Italiana', Georgia, 'Times New Roman', serif",
    corps: "'Jost', -apple-system, 'Segoe UI', sans-serif",
    poids: 300, ecart: ".30em", angles: [0, 0],
  },

  /* Fait main : savon, poterie, pain, marché. Caveat est une ÉCRITURE À LA
     MAIN, et c'est le seul habit qui en porte une. Rien ne dit « ce n'est
     pas sorti d'une usine » plus vite qu'un trait de stylo.

     ⚠️ ELLE DEMANDE D'ÊTRE GRANDE. À 20 px une écriture manuscrite fait
     brouillon ; à 36 px elle fait enseigne. D'où la plus grosse enseigne
     de tous les habits. */
  artisan: {
    enseigne: { taille: 36, poids: 700, ecart: "0", sousTaille: 11, grandNom: true },
    titre: "'Caveat', 'Segoe Script', cursive",
    corps: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    poids: 500, ecart: ".10em", angles: [10, 8],
  },

  /* Café, glacier, pizzeria, food truck. Lobster est une SCRIPT PENCHÉE et
     grasse, celle des devantures peintes et des enseignes de bord de route.
     Elle est penchée, Caveat ne l'est pas : deux écritures, deux gestes.

     ⚠️ Le TEXTE reste en Quicksand : une script sur un paragraphe de
     description ne se lit pas. */
  tendre: {
    enseigne: { taille: 30, poids: 400, ecart: "0", sousTaille: 11, grandNom: true },
    titre: "'Lobster', 'Brush Script MT', cursive",
    corps: "'Quicksand', -apple-system, 'Segoe UI', sans-serif",
    poids: 600, ecart: ".08em", angles: [18, 12],
  },

  /* ───── LES DEUX DERNIERS, DU 16 OCTOBRE 2026 ─────
     « On doit voir de réels changements dans la police d'écriture », puis
     « je ne demande pas 20 styles de boutique à proposer, mais les
     différents doivent être totalement différents les uns des autres ».

     🚨 C'EST LA RÈGLE DE LA LISTE, ET ELLE VAUT MIEUX QU'UN CATALOGUE.
     Quatre lettrages en capitales avaient été préparés — Bebas, Archivo
     Black, Cinzel, Josefin. Ils ont été retirés : à côté d'« or » et de
     « maison », ce sont des VARIANTES, pas des différences. Neuf habits
     qu'on distingue d'un coup d'œil valent mieux que vingt qu'il faut
     comparer.

     ⚠️ AVANT D'EN AJOUTER UN : à quelle SORTE de lettre appartient-il ?
     S'il tombe dans une sorte déjà prise, il n'a rien à faire dans la
     liste. Les neuf sortes : grasse condensée, serif clair, capitales
     métal, didone grasse, capitales en cheveu, écriture à la main, script
     penchée, tube de néon, très arrondi. */

  /* Bar, concert, tatoueur, salle de jeux — tout ce qui ouvre le soir.
     Monoton dessine des lettres en TUBE : chaque trait est doublé d'un
     filet clair, comme un néon éteint. C'est le seul habit qui imite un
     objet au lieu d'une écriture. */
  nuit: {
    enseigne: { taille: 24, poids: 400, ecart: ".04em", capitales: true, etiquette: true, sousTaille: 9, grandNom: true },
    titre: "'Monoton', Impact, sans-serif",
    corps: "'Jost', -apple-system, 'Segoe UI', sans-serif",
    poids: 400, ecart: ".22em", angles: [16, 12],
  },

  /* Enfants, jouets, parc de jeux, anniversaire. Fredoka est une grasse
     dont TOUTES les terminaisons sont rondes — il n'y a pas un seul angle
     dans la lettre. Les cadres les plus arrondis de tous les habits
     (26 px) prolongent la rondeur du caractère. */
  rond: {
    enseigne: { taille: 28, poids: 600, ecart: ".01em", sousTaille: 11, grandNom: true },
    titre: "'Fredoka', 'Segoe UI', sans-serif",
    corps: "'Quicksand', -apple-system, 'Segoe UI', sans-serif",
    poids: 600, ecart: ".06em", angles: [22, 16],
  },
};
const HABIT = HABITS[BOUTIQUE.allure] || HABITS.atelier;

/* 🚨 CES DEUX-LÀ RESTENT, ET VALENT EXACTEMENT CE QU'ELLES VALAIENT.
   Soixante-dix endroits les lisent. Les remplacer par une lecture de table
   aurait été un chantier dans quatre fichiers pour aucun gain : ce sont
   deux allures à découpage, et elles sont nommées. */
export const MAISON = BOUTIQUE.allure === "maison";

/* 🚨 « OR » N'EST PAS UNE MAISON EN PLUS SOMBRE.

   Une maison de couture se dit par le vide, les déliés et le silence. Une
   marque de rue se dit par le contraste, la capitale et le métal. Habiller
   la seconde comme la première l'éteint — c'est une erreur faite, montrée,
   et renvoyée en un mot : « non, ce n'est pas beau ».

   Oswald est une condensée qui tient la capitale très espacée sans se
   fermer : elle occupe la largeur, ce qu'aucun serif ne fait. Jost reste
   pour les petites lignes, comme en allure maison. */
export const OR = BOUTIQUE.allure === "or";

/* 🚨 C'EST LE CARACTÈRE QUI FAIT LE PRIX, AVANT TOUT LE RESTE.

   Une grasse condensée en capitales — Anton — dit « application » : c'est net,
   c'est lisible, et ça ressemble à un bouton. Un serif léger dit « maison ».
   Rien d'autre ne change aussi vite ce qu'un visiteur croit payer.

   Cormorant Garamond est choisi pour ses déliés fins : à 34 px il respire, là
   où un serif épais ferait « vieux journal ». Jost l'accompagne — une
   géométrique sans empattement qui supporte le très grand interlettrage des
   petites capitales sans se fermer. */
export const TITRE = HABIT.titre;
export const CORPS = HABIT.corps;

/* Les étiquettes d'une maison : minuscules capitales, très espacées, légères.
   C'est ce qui remplace les pastilles et les cadres — on sépare par le vide et
   par le rythme des lettres, pas par des traits. */
export const ETIQUETTE = {
  fontFamily: CORPS, fontWeight: HABIT.poids,
  letterSpacing: HABIT.ecart, textTransform: "uppercase",
};

/* 🚨 L'ARRONDI DES ANGLES DIT AUTANT QUE LA POLICE.

   C'était `MAISON || OR ? 2 : 14`, écrit trois fois à trois endroits du
   fichier. Trois endroits qui disent la même chose finissent toujours par
   ne plus être d'accord : on en corrige deux et on oublie le troisième.

   Deux valeurs, parce qu'il y a deux tailles de cadre dans une boutique :
   la grande carte d'un produit, et la petite pastille d'un prix. Un même
   arrondi sur les deux fait soit une carte molle, soit une pastille carrée.

   ⚠️ « studio » est à ZÉRO, et c'est le point de l'allure, pas un oubli. */
/* 🚨 L'ENSEIGNE : CE QU'ON VOIT EN PREMIER, ET CE QUI MANQUAIT.
   ──────────────────────────────────────────────────────────
   « Je ne vois pas vraiment de réel changement, je n'arrive pas à
   comprendre ce qui le rend premium. » Dit le 16 octobre 2026 devant les
   quatre nouveaux habits — et c'était juste.

   La taille du nom en haut de la boutique était écrite EN DUR, pour deux
   allures seulement : 25 px pour « maison », 23 px pour « or », 19 px
   pour tout le reste. Les quatre habits nouveaux tombaient donc dans le
   « tout le reste » : même enseigne qu'« atelier », à la police près.
   Une police seule ne se vend pas.

   C'est pour ça qu'Amira a l'air plus chère que La Maison Mapuche : son
   nom fait 25 px en serif fin avec un filet dessous. Rien d'autre.

   ⚠️ « maison » ET « or » GARDENT LEURS VALEURS AU PIXEL PRÈS. Elles sont
   recopiées telles quelles dans la table — on déplace la décision, on ne
   la change pas. Aucune boutique en service ne bouge.

   ⚠️ « grandNom » : quand une boutique prend des COMMANDES, le nom passe
   en 11 px sous le logo au lieu de l'enseigne. « or » y échappait déjà ;
   les quatre nouveaux y échappent aussi, sinon leur enseigne ne se
   verrait jamais sur une vraie boutique qui vend. « maison » garde son
   comportement d'aujourd'hui — le changer toucherait Amira Luxury. */
export const ENSEIGNE = HABIT.enseigne || HABITS.atelier.enseigne;

export const ANGLE = HABIT.angles[0];
export const ANGLE_PETIT = HABIT.angles[1];

/* L'or en FILET, jamais en aplat. Un bandeau doré plein est ce qui fait le plus
   « gratuit » ; un trait de 1 px sous un nom fait l'inverse. */
export const TRAIT_OR = `1px solid ${COULEURS.jaune || COULEURS.rose}`;

/* 🚨 LE MÉTAL N'EST PAS UNE COULEUR, C'EST UN DÉGRADÉ DANS LA LETTRE.

   Un doré plat (#C9A227 posé sur du texte) reste du jaune-brun. Ce qui fait
   le métal, c'est la variation DANS la hauteur du caractère : clair en haut,
   bronze au milieu, reflet en bas. On peint donc le dégradé et on découpe le
   texte dedans.

   Il se construit sur les trois couleurs de la boutique — jaune, rose,
   violet — et non sur un or écrit en dur : une boutique argentée ou cuivrée
   obtient le même effet avec sa propre palette.

   ⚠️ Le repli compte autant que l'effet : un navigateur qui ne découpe pas
   le texte doit AFFICHER LA LETTRE, pas du vide. D'où la couleur posée en
   premier, que WebkitTextFillColor ne remplace que s'il est compris. */
export const METAL = OR
  ? {
    color: COULEURS.jaune || COULEURS.rose,
    backgroundImage: `linear-gradient(175deg, ${COULEURS.jaune} 4%, ${COULEURS.rose} 36%, ${COULEURS.violet} 64%, ${COULEURS.jaune} 96%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }
  : null;

/* Le trait sous un nom de rayon : 3 px, dégradé, court. C'est lui qui donne
   la prestance — un filet de 1 px se perd sur une photo. */
export const TRAIT_ACCENT = OR
  ? `linear-gradient(90deg, ${COULEURS.jaune}, ${COULEURS.violet})`
  : null;

// Ouverture facultative, jouée une fois par visite. Cinq styles dessinés
// par le téléphone, qui ne coûtent rien à charger ; une vidéo seulement si
// le propriétaire de la boutique en a déposé une.
/* 🚨 CE QUE LE MOTEUR SAIT DESSINER, ÉCRIT NOIR SUR BLANC.

   C'est la liste qui empêche l'écran noir. Sept boutiques en ligne nomment
   encore une ouverture retirée — « lettres », « balayage », « titre ». Si
   le moteur allumait la couche sur la foi de « introActive » seul, elles
   s'ouvriraient sur du noir pendant toute la durée réglée, sur la première
   chose que voit un client.

   ⚠️ UN NOM AJOUTÉ ICI DOIT ÊTRE DESSINÉ DANS OuvertureDessinee LE MÊME
   JOUR. L'inverse aussi : un dessin que cette liste ignore n'est jamais
   atteint. Le contrôle de fabrication refuse les deux. */
/* 🚨 LANCÉE DEPUIS LE RACCOURCI, OU OUVERTE PAR UN LIEN ?

   Deux arrivées, deux publics, et une seule des deux mérite une ouverture.

   Depuis le raccourci de l'écran d'accueil, Android affiche SON écran de
   lancement — le logo en grand sur le fond de la boutique — avant qu'une
   ligne de notre code ne tourne, et rien ne peut l'en empêcher. Jouer
   ensuite une ouverture qui révèle ce même logo, c'est révéler ce qui vient
   d'être montré.

   ⚠️ UN LIEN NE SUFFIT PAS À DIRE « NAVIGATEUR ». Android lance
   l'application installée quand elle existe, même depuis un lien Telegram :
   c'est ce qui a égaré le diagnostic pendant deux heures. Ce qui tranche,
   c'est le MODE D'AFFICHAGE, que seul le téléphone connaît.

   « navigator.standalone » pour iPhone, qui ne connaît pas display-mode. */
const DEPUIS_LE_RACCOURCI = (() => {
  try {
    if (typeof matchMedia === "function"
      && matchMedia("(display-mode: standalone)").matches) return true;
    return navigator.standalone === true;
  } catch (e) {
    return false;
  }
})();

const DESSINABLES = ["sceau", "fente", "lamelles", "cartes", "dorure", "mur", "noel", "halloween", "nouvelan"];

/* 🚨 LES OUVERTURES QUI DÉCOUVRENT LA BOUTIQUE AU LIEU DE LA CACHER.

   La couche d'ouverture est opaque : elle couvre tout, joue son animation,
   puis s'efface. « La fente de lumière » fait autre chose — elle ÉCARTE deux
   moitiés et laisse voir le catalogue derrière. Pour celle-là, la couche
   doit être transparente, sinon les moitiés s'écarteraient sur du noir.

   ⚠️ Ce ne sont pas les moitiés qui sont transparentes : elles portent le
   fond de la boutique. C'est la couche QUI LES CONTIENT. */
const COUCHE_TRANSPARENTE = ["fente", "lamelles"];

export const INTRO = {
  /* 🚨 PENDANT LA REFONTE : PAS D'OUVERTURE SANS VIDÉO.

     Sept boutiques en ligne ont encore « introActive: true » et nomment une
     ouverture dessinée qui n'existe plus. Sans cette condition, leur couche
     s'afficherait VIDE ET NOIRE pendant toute la durée réglée — le pire
     accueil possible, et justement sur la première chose que voit un client.

     Quand la première nouvelle ouverture arrivera, cette ligne redeviendra
     « BOUTIQUE.introActive === true ». */
  /* 🚨 L'OUVERTURE JOUE AUSSI DEPUIS L'ICÔNE — ET C'EST UN RETOUR EN
     ARRIÈRE ASSUMÉ.
     ────────────────────────────────────────────────────────────────
     Signalé le 16 octobre 2026 : « les lamelles ne fonctionnent pas une
     fois la boutique allumée. Avant de publier, en prévisualisant, ça
     fonctionne — mais pas une fois publiée. »

     Ce n'était pas une panne : c'était cette ligne. L'ouverture était
     annulée quand la boutique est lancée depuis l'icône de l'écran
     d'accueil, « sauf en aperçu » — exactement le symptôme décrit.

     LE RAISONNEMENT D'ALORS : l'écran de lancement du téléphone montre
     déjà le logo sur le fond de la boutique, avant que notre code ne
     tourne. Jouer ensuite une ouverture qui révèle ce même logo, c'est
     révéler ce qui vient d'être montré.

     POURQUOI IL ÉTAIT TROP LARGE. Il vaut pour le SCEAU, dont tout
     l'objet est de faire apparaître la marque. Il ne vaut pas pour la
     fente ni les lamelles, qui ne remontrent pas le logo : elles
     découvrent LE CATALOGUE derrière. Une règle écrite pour une
     ouverture s'appliquait aux trois.

     ⚠️ ET SURTOUT : L'ÉCRAN PROMETTAIT CETTE OUVERTURE. Le vendeur l'a
     choisie, l'aperçu la lui a montrée, et la boutique l'annulait en
     silence. Une promesse faite à l'écran et retirée dans le code n'est
     pas une optimisation — c'est un défaut.

     Si le sceau paraît redondant après l'écran de lancement, c'est au
     vendeur de le dire : il a un bouton pour l'éteindre. */
  /* 🚨 L'OUVERTURE JOUE POUR TOUT LE MONDE — DÉCISION DU 16 OCTOBRE 2026.
     ──────────────────────────────────────────────────────────────────────
     « Ça ne marche toujours pas. C'est incroyable qu'un si petit truc
     puisse bloquer toute mon application. »

     Il a raison sur le fond, et j'ai corrigé deux fois À CÔTÉ : d'abord le
     lancement depuis l'icône, puis l'écran mort. Les deux étaient de vrais
     défauts — aucun des deux n'était CELUI qui l'empêchait de voir son
     ouverture. Le voici, et il tenait dans une ligne de style :

         @media (prefers-reduced-motion: reduce) {
           .atelier-ouverture:not(.forcee) * { animation: none !important; }
         }

     Son appareil demande « moins d'animations » — sur Android, le mode
     économie d'énergie l'active tout seul — et cette ligne figeait
     l'ouverture quoi qu'on change ailleurs.

     CE QU'ON ABANDONNE, ET POURQUOI C'EST ASSUMÉ. « prefers-reduced-motion »
     protège des gens que le mouvement incommode vraiment. On cesse de
     l'honorer POUR CETTE SEULE COUCHE, parce que : elle dure une à trois
     secondes, elle ne clignote pas, elle ne défile pas, et c'est un choix
     délibéré du vendeur pour sa propre boutique. Tout le reste de la
     boutique — cartes, glissements, apparitions — continue de l'honorer.

     ⚠️ SI ÇA DOIT REVENIR UN JOUR, c'est ici et dans la règle CSS, pas
     ailleurs : les deux ensemble, sinon on obtient une couche visible et
     immobile, c'est-à-dire le pire des deux. */
  /* (ancien commentaire conservé pour mémoire)
     ANIMATIONS RÉDUITES : PAS D'OUVERTURE DU TOUT, PLUTÔT QU'UNE
     OUVERTURE FIGÉE.
     ──────────────────────────────────────────────────────────────
     Mesuré le 16 octobre 2026 sur la boutique en ligne, dans un
     navigateur réglé comme le sien :

         couche d'ouverture : présente
         lamelles : 6
         animation calculée : « none »   ← la règle CSS les fige

     Le résultat n'était donc pas « une belle affiche » comme on l'avait
     cru en l'écrivant : c'était un écran d'une seule couleur, immobile,
     pendant les trois secondes réglées, puis la boutique. Soit exactement
     ce qu'il décrit — « l'écran laisse apparaître la boutique simplement ».

     Honorer « animations réduites » doit vouloir dire SAUTER l'ouverture,
     pas en montrer une morte. Trois secondes de rien n'ont jamais protégé
     personne du mouvement : elles font seulement attendre.

     ⚠️ SAUF EN APERÇU, où le vendeur l'a demandée explicitement — c'est la
     même exception que la classe « forcee » dans la feuille de style, et
     pour la même raison : sans elle, il ne peut pas juger son travail sur
     son propre appareil. */
  active: BOUTIQUE.introActive === true
    && ((BOUTIQUE.introVideo || "").trim() !== ""
      || DESSINABLES.includes((BOUTIQUE.introStyle || "").trim())),
  texte: (BOUTIQUE.introTexte || "").trim() || `BIENVENUE — ${(BOUTIQUE.nom || "").toUpperCase()}`,
  video: (BOUTIQUE.introVideo || "").trim(),
  /* Le style n'est plus corrigé en douce. Il retombait sur « titre » pour
     ne jamais laisser d'écran noir ; « titre » n'existe plus, et c'est
     désormais INTRO.active qui tient cette promesse, plus haut. Le nom
     traverse tel quel : une fiche garde le choix de son propriétaire. */
  style: (BOUTIQUE.introStyle || "").trim(),
  duree: Math.min(15, Math.max(1, Number(BOUTIQUE.introDuree) || 3)),
  /* La photographie posée derrière l'ouverture, s'il y en a une. Vide : le
     décor est dessiné, comme avant. */
  fond: (BOUTIQUE.introFond || "").trim(),
};

export const ANIMATIONS = `
@keyframes atelier-apparition {
  from { opacity: 0; transform: scale(.86) translateY(14px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes atelier-lueur {
  0%, 100% { filter: brightness(1); }
  50%      { filter: brightness(1.35); }
}
@keyframes atelier-sortie {
  to { opacity: 0; visibility: hidden; }
}

/* ───────── ① LE SCEAU ─────────
   La première ouverture de la refonte, choisie sur storyboard.

   Le cachet tombe de haut et s'écrase à sa taille : l'étape à 58 % passe
   SOUS la taille finale, celle à 78 % la dépasse un peu. C'est ce
   dépassement qui fait « posé » plutôt que « apparu » — sans lui, le logo
   grandit et s'arrête, et ça ne ressemble à rien.

   L'onde ne doit PAS suivre le cachet : elle part de lui et s'en va. Elle
   est donc dessinée en dehors de l'élément qui grossit — sinon elle
   grandirait avec lui, et on verrait un anneau collé au bord.

   ⚠️ « letter-spacing » refait la mise en page du paragraphe à chaque
   image, là où « transform » ne fait que redessiner. C'est le seul endroit
   où on se le permet : UN paragraphe, pendant trois quarts de seconde, et
   c'est précisément ce resserrement qui donne l'impression de gravure. Un
   dégradé ne la donne pas, une apparition non plus. */
/* 🚨 L'ÉTAPE À 58 % PASSE SOUS LA TAILLE FINALE, CELLE À 78 % LA DÉPASSE.
   C'est ce dépassement qui fait « posé » plutôt qu'« apparu » : sans lui, le
   logo grandit, s'arrête, et ça ne ressemble à rien.

   ⚠️ ON A ESSAYÉ DE LE FAIRE DÉMARRER VISIBLE, À LA TAILLE DE L'ICÔNE DE
   L'ÉCRAN DE LANCEMENT D'ANDROID, pour que celui-ci se confonde avec la
   première image. Abandonné le jour même : « tu ne vas pas t'amuser à
   superposer l'image sur d'autres ouvertures ». Ça ne marchait que pour le
   sceau, et il faudrait tout refaire à chaque nouvelle ouverture. */
@keyframes atelier-sceau-pose {
  0%   { opacity: 0; transform: scale(1.85) rotate(-7deg); }
  58%  { opacity: 1; transform: scale(.93) rotate(1.5deg); }
  78%  { transform: scale(1.035) rotate(0deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes atelier-sceau-onde {
  0%   { opacity: 0; transform: scale(.55); }
  16%  { opacity: .55; }
  100% { opacity: 0; transform: scale(2.6); }
}
/* L'éclat : une BANDE de lumière qui traverse le métal en biais, une seule
   fois, au moment du choc.

   🚨 C'ÉTAIT UN APLAT BLANC, ET ÇA EFFAÇAIT LE LOGO. Mesuré à 520 ms :
   0,78 d'opacité sur toute la surface du médaillon, pile à l'instant où le
   sceau se pose. Une ouverture dont le but est de montrer la marque la
   faisait donc disparaître. Un reflet sur du métal est une bande, pas un
   voile — et une bande laisse voir ce qu'il y a dessous. */
@keyframes atelier-sceau-eclat {
  0%   { transform: translateX(-170%) rotate(24deg); opacity: 0; }
  30%  { opacity: .55; }
  100% { transform: translateX(170%) rotate(24deg); opacity: 0; }
}
@keyframes atelier-sceau-grave {
  from { opacity: 0; letter-spacing: .36em; }
  to   { opacity: 1; letter-spacing: .02em; }
}
@keyframes atelier-sceau-filet {
  from { width: 0; opacity: 0; }
  to   { width: 92px; opacity: 1; }
}

/* ───────── ② LA FENTE DE LUMIÈRE ─────────
   Dessinée d'après une référence Canva : du noir, et une fente de lumière
   dorée au centre.

   🚨 LES DEUX MOITIÉS SONT FERMÉES AU REPOS, ET C'EST L'INVERSE DU RIDEAU
   D'AVANT. Le rideau gardait ses panneaux écartés parce que, sans
   animation, un panneau fermé aurait caché la boutique. Ici le nom et le
   trait sont VISIBLES au repos : un appareil en « animations réduites »
   voit donc exactement l'image de Canva — un noir, un trait, un nom —
   pendant la durée réglée, puis la boutique. C'est une belle affiche, pas
   un écran noir.

   Le trait grandit par « scaleX » et non par « width » : une largeur refait
   la mise en page à chaque image, une échelle ne fait que redessiner. */
/* Le trait : étiré à 45 % de son temps, il brille encore un moment, puis
   s'éteint pendant que le noir s'écarte. */
@keyframes atelier-fente-trait {
  0%   { opacity: 0; transform: scaleX(0); }
  20%  { opacity: 1; }
  45%  { opacity: 1; transform: scaleX(1); }
  75%  { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0; transform: scaleX(1); }
}
@keyframes atelier-fente-haut {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(0, -100%, 0); }
}
@keyframes atelier-fente-bas {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(0, 100%, 0); }
}
/* 🚨 LE NOM DOIT AVOIR DISPARU AVANT QUE LE NOIR NE S'ÉCARTE, et ce n'était
   pas le cas : mesuré à 2 150 ms, le catalogue apparaissait et le nom
   flottait encore par-dessus. Il durait jusqu'à 2,65 s quand l'écartement
   commençait à 1,55 s — une seconde entière de chevauchement.

   Écrire l'intention en commentaire ne suffisait pas : il fallait compter.
   Il paraît maintenant à 0,85 s, se lit une seconde pleine, et il est PARTI
   à 1,90 s — l'instant où le noir commence à s'écarter. */
@keyframes atelier-fente-nom {
  0%   { opacity: 0; transform: translateY(8px); letter-spacing: .22em; }
  28%  { opacity: 1; transform: translateY(0); letter-spacing: .06em; }
  72%  { opacity: 1; }
  100% { opacity: 0; }
}

/* ───────── ③ LES LAMELLES ─────────
   Le noir disparaît par bandes verticales, l'une après l'autre, et le
   catalogue se découvre derrière. L'effet « tableau de départs ».

   🚨 ELLES MONTENT, ELLES NE S'EFFACENT PAS. Une bande qui perd son opacité
   laisse voir le catalogue à travers un voile gris pendant une demi-seconde
   — c'est sale. Une bande qui SORT DE L'ÉCRAN découvre franchement ce
   qu'il y a dessous, et le téléphone ne fait que la déplacer : rien n'est
   redessiné.

   ⚠️ L'état au repos est FERMÉ, comme pour la fente : avec le nom visible,
   un appareil en « animations réduites » voit une affiche propre pendant la
   durée réglée, puis la boutique. */
@keyframes atelier-lamelle {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(0, -101%, 0); }
}

/* ───────── LES AUTRES OUVERTURES : EN COURS DE REFONTE ─────────

   Les images clés des six ouvertures retirées le 14 octobre 2026 vivaient
   ici : médaillon, anneau, reflet, montée, trait centré, les deux
   panneaux du rideau, le halo, la lettre et le balayage. Elles sont dans
   l'historique git, au commit qui porte ce texte.

   Celles qui restent au-dessus servent encore : « apparition » et
   « lueur » portent le titre posé sur une vidéo, « sortie » referme la
   couche. Ne pas les retirer en faisant le ménage. */
/* ───────── LE PASSAGE D'UN ÉCRAN À L'AUTRE ─────────
   On entrait dans un rayon d'un coup sec : l'écran changeait, sans que rien
   ne dise d'où l'on venait ni qu'on était descendu d'un cran. C'est ce qui
   fait « page web » plutôt qu'« application ».

   Le rayon arrive donc depuis la droite, et le retour repart vers la gauche :
   le geste raconte le sens de la navigation. 220 ms — assez pour se voir,
   assez court pour ne pas agacer au dixième clic. */
@keyframes atelier-entre-droite {
  from { opacity: 0; transform: translate3d(22px, 0, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes atelier-entre-gauche {
  from { opacity: 0; transform: translate3d(-22px, 0, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
/* « clip » et non « hidden » : le décalage de 22 px ne doit pas faire
   apparaître une barre de défilement horizontale — mais « hidden » ferait de
   ce bloc un conteneur de défilement, et casserait les éléments collants. */
.atelier-ecran { overflow-x: clip; }
.atelier-glisse-avant   { animation: atelier-entre-droite .22s ease-out both; }
.atelier-glisse-arriere { animation: atelier-entre-gauche .22s ease-out both; }

/* ───────── LES CARTES, L'UNE APRÈS L'AUTRE ─────────
   Surgir toutes ensemble donne un bloc qui clignote. Décalées de quelques
   centièmes, elles donnent l'impression que le rayon se remplit.

   Le décalage est PLAFONNÉ par celui qui l'applique : sur 83 articles, une
   cascade intégrale durerait deux secondes et le client attendrait devant un
   écran vide. */
@keyframes atelier-carte {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.atelier-carte { animation: atelier-carte .26s ease-out both; }

/* ───────── ④ LES CARTES QUI SE POSENT ─────────
   Les articles de la boutique arrivent du bas, un par un, et se posent
   en éventail. C'est la première ouverture qui montre LA MARCHANDISE :
   deux boutiques n'auront jamais la même.

   🚨 LA CARTE PART DE PLUS BAS QUE L'ÉCRAN, ET REVIENT DROITE.
   L'inclinaison finale est portée par le PARENT, jamais par
   l'animation : une rotation dans l'image clé obligerait à écrire une
   image clé par carte, et l'état au repos d'une carte sans animation
   serait « droite » au lieu de « inclinée ». L'éventail se déferait.

   ⚠️ « 118 % » ET NON « 100 % » : une carte translatée de sa propre
   hauteur affleure encore le bas de l'écran sur les téléphones courts,
   et on la voit attendre son tour.

   Le léger dépassement à 72 % — l'échelle passe à 1.04 avant de
   revenir — est ce qui fait « posé » plutôt qu'« apparu ». Le même
   principe que le sceau, en plus discret : une carte qui rebondit trop
   fait jouet. */
@keyframes atelier-carte-posee {
  from { opacity: 0; transform: translate3d(0, 118%, 0) scale(.92); }
  72%  { opacity: 1; transform: translate3d(0, -2%, 0) scale(1.04); }
  to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

/* LE NOM S'ECRIT LETTRE PAR LETTRE — 16 octobre 2026.
   « Le nom doit apparaitre lettre par lettre avec un beau lettrage adapte
   a la couleur de la boutique. »

   🚨 LE FLOU SE DISSIPE, IL NE S'AJOUTE PAS. Une lettre nette qui monte
   fait « liste qui se remplit ». La meme lettre floue qui se precise fait
   « ecriture ». Tout l'ecart entre les deux tient dans ce filter.

   ⚠️ « .42em » ET NON UNE VALEUR EN PIXELS : la taille du nom change avec
   la longueur du nom (voir NomQuiTient). En pixels, un nom long — donc
   ecrit petit — verrait ses lettres monter de trois fois leur hauteur.

   ⚠️ ET L'ETAT AU REPOS EST L'ETAT FINAL, comme partout ici : « both »
   plus un « to » complet. Une lettre sans animation doit etre une lettre
   LISIBLE, pas une lettre invisible. */
@keyframes atelier-lettre-posee {
  from { opacity: 0; transform: translate3d(0, .42em, 0) scale(.9); filter: blur(4px); }
  to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
}

/* Le filet sous le nom. Il se tire du centre vers les bords quand la
   derniere lettre est posee : c'est lui qui dit « le nom est fini ».

   ⚠️ scaleX ET NON width : une largeur animee fait recalculer la mise en
   page a chaque image. Ici il n'y a qu'une transformation, donc rien a
   recalculer — et ca compte sur un telephone d'entree de gamme, pendant
   que dix lettres s'animent a cote. */
@keyframes atelier-filet-nom {
  from { opacity: 0; transform: scaleX(0); }
  to   { opacity: .8; transform: scaleX(1); }
}

/* 🚨 UN MOT NE SE COUPE PAS EN DEUX.
   « Tu dois faire attention que peu importe le nom de la boutique, il doit
   rentrer dans l'espace sans etre coupe. »

   Chaque mot est solidaire : il passe a la ligne en entier ou pas du tout.
   C'est la taille qui cede, pas le mot — voir NomQuiTient.

   ⚠️ SAUF UN SEUL CAS, et il faut bien le trancher : un nom d'un seul mot
   interminable (« BOUTIQUEDESMERVEILLESREUNIES ») ne rentre a aucune
   taille lisible. La classe « atelier-nom-coupe » est alors posee, et le
   mot se coupe — DANS l'ecran. Un mot coupe se lit encore ; un mot qui
   depasse ne se lit plus du tout. */
.atelier-mot { white-space: nowrap; }
.atelier-nom-coupe .atelier-mot { white-space: normal; word-break: break-all; }

/* ───────── ⑤ LA DORURE ─────────
   Tout est gravé dans le noir, presque éteint. Une large lame de lumière
   traverse l'écran en diagonale, et chaque chose s'allume AU MOMENT OU LA
   LUMIERE L'ATTEINT : le guilloché du fond, le cadre, le nom, puis le
   médaillon. Un seul geste, et tout l'écran y répond.

   🚨 L'ETAT AU REPOS EST L'ETAT ALLUME, et c'est l'inverse de ce qu'on
   écrit spontanément. La tentation était de poser « sombre » comme style
   de base et « clair » dans l'animation : une boutique dont l'animation ne
   joue pas — pour une raison qu'on n'a pas prévue — montrerait alors un
   écran noir avec un nom invisible. C'est l'image clé qui porte le noir
   de départ ; le style, lui, porte l'or.

   ⚠️ LA LAME EST UN SEUL ELEMENT, en « screen », qui PASSE AU-DESSUS de
   tout le reste. Elle n'éclaire pas chaque chose une par une : elle
   éclaircit ce qu'elle recouvre, quoi que ce soit. Les allumages
   échelonnés en dessous ne font que suivre son passage. */
@keyframes atelier-dore {
  0%   { background-position: 165% 0, 0 0; filter: brightness(.26); }
  50%  { filter: brightness(1.45) drop-shadow(0 0 16px rgba(255,222,155,.5)); }
  100% { background-position: -65% 0, 0 0; filter: brightness(1) drop-shadow(0 2px 12px rgba(255,200,120,.2)); }
}

/* Le reflet part un peu plus tard et reste plus sombre : une image dans du
   marbre poli n'est jamais aussi vive que ce qu'elle reflète. */
@keyframes atelier-dore-reflet {
  0%   { background-position: 165% 0, 0 0; opacity: .08; filter: brightness(.26); }
  50%  { opacity: .3; filter: brightness(1.05); }
  100% { background-position: -65% 0, 0 0; opacity: .2; filter: brightness(.8); }
}

/* ⚠️ 230vw DE COURSE, ET C'EST MESURE : la lame commence à 90 vw À GAUCHE
   de l'écran et doit en sortir entièrement à droite. Inclinée de 19°, son
   déplacement propre est plus long que la distance parcourue à l'écran. */
@keyframes atelier-lame {
  0%   { opacity: 0; transform: rotate(19deg) translateX(0); }
  12%  { opacity: 1; }
  82%  { opacity: 1; }
  100% { opacity: 0; transform: rotate(19deg) translateX(230vw); }
}

@keyframes atelier-trait-h { from { opacity: 0; transform: scaleX(0); } to { opacity: .55; transform: scaleX(1); } }
@keyframes atelier-trait-v { from { opacity: 0; transform: scaleY(0); } to { opacity: .4; transform: scaleY(1); } }

/* Le médaillon paraît d'abord éteint, puis la lumière le trouve. */
@keyframes atelier-parait-or { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
@keyframes atelier-allume-or {
  0%   { filter: brightness(.3) saturate(.5); }
  45%  { filter: brightness(1.5) saturate(1.2); }
  100% { filter: brightness(1) saturate(1); }
}
@keyframes atelier-onde-or { from { opacity: .8; transform: scale(.78); } to { opacity: 0; transform: scale(1.35); } }

@keyframes atelier-etincelle {
  0%   { opacity: 0; transform: scale(.2) rotate(0deg); }
  30%  { opacity: 1; transform: scale(1.25) rotate(30deg); }
  100% { opacity: 0; transform: scale(.5) rotate(70deg); }
}

/* Chaque grain dérive un peu sur le côté en montant : de la poussière qui
   monte tout droit fait pluie à l'envers. */
@keyframes atelier-grain-or {
  0%   { opacity: 0; transform: translate(0, 0) scale(.5); }
  16%  { opacity: .9; }
  65%  { opacity: .55; }
  100% { opacity: 0; transform: translate(var(--derive, 0px), -46vh) scale(1.15); }
}

@keyframes atelier-lueur-or {
  0%   { opacity: 0; transform: scale(.7); }
  35%  { opacity: 1; transform: scale(1); }
  100% { opacity: .5; transform: scale(1.06); }
}

/* Le guilloché : des cercles et des croisillons très fins, comme sur un
   billet. Invisible dans l'ombre, il prend la lumière au passage de la
   lame — et c'est lui qui fait comprendre que le fond est une MATIERE. */
/* ⚠️ DISCRET, ET MESURE SUR CAPTURE. A la moitie de cette opacite-ci, les
   cercles concentriques se lisaient comme un ECRAN RADAR : une cible au
   milieu de la boutique. Un guilloche doit se deviner, pas se regarder —
   on ne doit le voir QUE pendant la seconde ou la lame le traverse.

   Les cercles sont donc plus espaces et beaucoup plus pales ; ce sont les
   croisillons, eux, qui portent la matiere. */
.atelier-guilloche {
  position: absolute; inset: 0; pointer-events: none; opacity: .3;
  background:
    repeating-radial-gradient(circle at 50% 44%, transparent 0 15px, rgba(255,255,255,.03) 15px 16px),
    repeating-linear-gradient(58deg, transparent 0 9px, rgba(255,255,255,.04) 9px 10px),
    repeating-linear-gradient(-58deg, transparent 0 9px, rgba(255,255,255,.04) 9px 10px);
}

.atelier-lame {
  position: absolute; top: -60%; left: -90%; width: 60%; height: 220%;
  z-index: 6; pointer-events: none; opacity: 0; mix-blend-mode: screen;
  background: linear-gradient(90deg, transparent,
    rgba(255,236,196,.16) 34%, rgba(255,248,230,.46) 50%, rgba(255,236,196,.16) 66%, transparent);
  /* 🚨 L'ANIMATION EST ICI, ET ELLE Y A MANQUÉ UNE HEURE.
     Les images clés étaient écrites, le style aussi, l'élément bien posé
     dans le dessin — et rien ne le lançait. Résultat mesuré sur banc : tout
     s'allumait à l'heure dite, mais AUCUNE lumière ne traversait l'écran.
     L'ouverture entière repose sur ce passage : sans lui, il ne reste que
     des choses qui s'éclairent toutes seules, sans raison.

     Un garde-fou le refuse désormais : une image clé nommée dans les
     promesses doit apparaître dans une déclaration « animation: » quelque
     part, et pas seulement exister. */
  animation: atelier-lame 2.2s cubic-bezier(.42,0,.3,1) .55s both;
}

/* L'étincelle et ses deux traits de lumière croisés. */
.atelier-etincelle { position: absolute; width: 4px; height: 4px; z-index: 7; opacity: 0; pointer-events: none; }
.atelier-etincelle::before, .atelier-etincelle::after {
  content: ""; position: absolute; left: 50%; top: 50%;
  background: linear-gradient(90deg, transparent, #fff8e6, transparent);
}
.atelier-etincelle::before { width: 22px; height: 1px; margin: -.5px 0 0 -11px; }
.atelier-etincelle::after { width: 1px; height: 22px; margin: -11px 0 0 -.5px; }

/* ───────── ⑥ LE MUR QUI S'OUVRE ─────────
   La boutique commence par un MUR PLEIN ÉCRAN de ses articles, qui respire
   doucement. Un éclair de lumière le fend en deux, et les deux battants
   s'ouvrent VERS LE VISITEUR en perspective, en s'assombrissant. Le nom
   monte du fond pendant ce temps, puis la caméra passe entre eux.

   🚨 L'ÉTAT AU REPOS EST L'ÉTAT OUVERT. Comme pour la dorure : le style de
   base porte la fin — battants écartés, sombres — et c'est l'image clé qui
   porte le mur fermé du début. Une ouverture qui ne jouerait pas laisse
   donc voir le nom, jamais une porte close pour toujours.

   ⚠️ C'EST L'OUVERTURE LA PLUS LOURDE DU LOT, et de loin : deux demi-murs
   de quinze images chacun, tournés en perspective. Les quinze cases sont
   un maximum choisi pour ça. Si un jour ça saccade sur un téléphone
   d'entrée de gamme, c'est ce nombre qu'il faut baisser — pas l'idée.

   ⚠️ ET ELLE DEMANDE DU CATALOGUE. « Ça veut dire qu'il faut quand même un
   certain nombre de produits pour que ça rende bien, comme l'ouverture
   avec les cartes. » Exact : quinze cases, et un mur qui répète trois fois
   les mêmes cinq articles se voit tout de suite. L'écran le dit au vendeur
   avant qu'il choisisse (voir OUVERTURES.mur.minArticles). */
@keyframes atelier-mur-respire {
  from { transform: scale(1.14); }
  to   { transform: scale(1); }
}

/* 🚨 LA FENTE EST L'INSTANT LE PLUS FORT, ET ELLE DOIT ÊTRE VIOLENTE.
   « L'ouverture de porte doit être spectaculaire. » Un trait qui s'allume
   doucement n'ouvre rien : il faut que la lumière JAILLISSE de la
   cassure. Le trait se dresse en un dixième de seconde, puis s'écarte en
   largeur cinq fois — c'est l'écartement qui fait croire à la pression. */
@keyframes atelier-fente-eclair {
  0%   { opacity: 0; transform: scaleY(.06) scaleX(1); }
  14%  { opacity: 1; transform: scaleY(1) scaleX(1); }
  100% { opacity: 0; transform: scaleY(1) scaleX(6); }
}

/* L'éclat qui inonde l'écran à l'instant de la cassure. Très court — un
   dixième de seconde pleine — sinon ce n'est plus un éclat, c'est un
   fondu au blanc. */
@keyframes atelier-eclat-porte {
  0%   { opacity: 0; }
  22%  { opacity: .55; }
  100% { opacity: 0; }
}

/* 🚨 LES BATTANTS VIENNENT VERS LE VISITEUR, ILS NE RENTRENT PAS DANS
   L'ÉCRAN. « translateZ » positif les rapproche, et c'est ce qui donne
   l'impression de passer entre eux. Poussés vers le fond, on aurait
   l'impression de reculer — l'inverse exact de ce qu'on veut. */
@keyframes atelier-battant-g {
  from { transform: none; filter: brightness(1); }
  to   { transform: translateZ(90px) rotateY(-74deg) translateX(-15%); filter: brightness(.18); }
}
@keyframes atelier-battant-d {
  from { transform: none; filter: brightness(1); }
  to   { transform: translateZ(90px) rotateY(74deg) translateX(15%); filter: brightness(.18); }
}

/* Le nom ne paraît pas : il ARRIVE DU FOND. Le flou qui se resserre fait
   la mise au point d'une caméra, et c'est ce qui vend la profondeur. */
@keyframes atelier-nom-du-fond {
  from { opacity: 0; transform: translateZ(-240px) scale(.78); filter: blur(8px); }
  to   { opacity: 1; transform: none; filter: blur(0); }
}

/* La caméra passe entre les battants : tout grandit et s'efface. */
@keyframes atelier-porte-traverse {
  from { transform: scale(1); opacity: 1; }
  to   { transform: scale(1.6); opacity: 0; }
}

.atelier-porte { position: absolute; inset: 0; overflow: hidden; perspective: 800px; perspective-origin: 50% 46%; }

.atelier-battant {
  position: absolute; top: 0; height: 100%; width: 50%;
  overflow: hidden; z-index: 3; backface-visibility: hidden;
  filter: brightness(.18);
}
.atelier-battant-g { left: 0; transform-origin: 0% 50%;
  transform: translateZ(90px) rotateY(-74deg) translateX(-15%); }
.atelier-battant-d { left: 50%; transform-origin: 100% 50%;
  transform: translateZ(90px) rotateY(74deg) translateX(15%); }

.atelier-mur {
  position: absolute; top: -4%; height: 108%; width: 200%;
  display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 3px;
}
.atelier-battant-d .atelier-mur { left: -100%; }

.atelier-tuile { position: relative; display: block; overflow: hidden; }
.atelier-tuile img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Un creux de lumière sur chaque tuile : sans lui, quinze photos posées à
   plat font planche de contact, et le mur n'a aucune épaisseur. */
.atelier-tuile::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(72% 58% at 46% 28%, rgba(255,255,255,.16), transparent 74%),
    linear-gradient(to bottom, transparent 55%, rgba(0,0,0,.35));
}

.atelier-fente-lumiere {
  position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; margin-left: -1px;
  z-index: 4; opacity: 0; pointer-events: none;
  background: linear-gradient(to bottom, transparent, #fff7e6, transparent);
  box-shadow: 0 0 26px 9px rgba(255,228,170,.6);
}
.atelier-eclat-porte {
  position: absolute; inset: 0; z-index: 5; opacity: 0; pointer-events: none;
  mix-blend-mode: screen; background: #fff4df;
}

/* ───────── ⑦ CE QUI TOMBE, ET QUI ÉCRIT LE NOM ─────────

   Demandé le 16 octobre 2026 : « une pluie de neige qui tombe du haut de
   l'écran et qui écrit le nom de la boutique ».

   🚨 CE N'EST PAS « IL NEIGE, ET LE NOM APPARAÎT ». Chaque lettre porte
   SES PROPRES flocons, qui tombent vers elle, et elle s'allume à l'instant
   où ils se posent dessus. C'est tout l'écart entre une neige décorative
   et une neige qui écrit — et ça ne tient qu'à une chose : les flocons
   sont DANS la lettre, en position absolue, donc ils savent où elle est
   sans que personne ait à le calculer.

   ⚠️ ET ILS NE PÈSENT RIEN DANS LA MESURE : un élément en position absolue
   ne compte pas dans la place prise par le texte, et la règle de mesure
   les fige de toute façon (voir .atelier-nom-mesure). Le nom se dimensionne
   exactement comme ailleurs.

   Ce mécanisme sert les DEUX ouvertures de saison : la neige à Noël, les
   feuilles mortes à Halloween. Une seule mécanique, deux ambiances. */
@keyframes atelier-tombe {
  0%   { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(.6); }
  9%   { opacity: var(--vif, .85); }
  86%  { opacity: var(--vif, .85); }
  100% { opacity: 0; transform: translate(var(--der, 14px), 112vh) rotate(var(--vrille, 0deg)) scale(1); }
}

/* La lettre ne paraît pas : elle est HEURTÉE. L'éclat glacé du début, puis
   le retour au métal de la boutique — c'est l'impact du flocon. */
@keyframes atelier-lettre-ecrite {
  0%   { opacity: 0; transform: translateY(-6px) scale(.86); filter: blur(3px) brightness(2.4); }
  40%  { opacity: 1; filter: blur(0) brightness(2.2) drop-shadow(0 0 12px rgba(207,228,245,.9)); }
  100% { opacity: 1; transform: none; filter: blur(0) brightness(1) drop-shadow(0 1px 6px rgba(0,0,0,.55)); }
}

/* Le flocon qui vise SA lettre. Il arrive de 42vh plus haut — soit le haut
   de l'écran quelle que soit sa taille — et disparaît en se posant. */
@keyframes atelier-vers-lettre {
  0%   { opacity: 0; transform: translate(var(--dx, 0px), -42vh) scale(.5); }
  14%  { opacity: 1; }
  86%  { opacity: 1; transform: translate(0, -4px) scale(1); }
  100% { opacity: 0; transform: translate(0, 2px) scale(.3); }
}

/* Le liseré qui se pose sur le sommet de la lettre. C'est ce détail-là qui
   fait croire au froid — sans lui, ce sont des points blancs qui tombent. */
@keyframes atelier-coiffe { from { transform: scaleX(0); } to { transform: scaleX(1); } }

@keyframes atelier-congere { to { transform: translateY(0); opacity: 1; } }
@keyframes atelier-clignote {
  0%, 100% { opacity: .3; filter: brightness(.55); }
  50%      { opacity: 1; filter: brightness(1.5); }
}
@keyframes atelier-scintille {
  0%, 100% { opacity: .18; transform: scale(.8); }
  50%      { opacity: .9; transform: scale(1.25); }
}
@keyframes atelier-pend { from { opacity: 0; transform: translateY(-70px); } to { opacity: 1; transform: none; } }
@keyframes atelier-balance { 0%, 100% { rotate: -5deg; } 50% { rotate: 5deg; } }
@keyframes atelier-pousse { from { opacity: 0; transform: translateY(26px) scale(.94); } to { opacity: 1; transform: none; } }

/* Une matière qui tombe : flocon de neige, feuille morte, braise. Ce qui
   change d'une saison à l'autre, c'est la couleur, la forme et la vrille —
   la chute, elle, est la même. */
.atelier-tombe {
  position: absolute; top: -2vh; border-radius: 50%; background: #fff;
  opacity: 0; pointer-events: none;
}

.atelier-lettre-ecrite { position: relative; display: inline-block; opacity: 1; }
.atelier-vers {
  position: absolute; left: 50%; top: 0; width: 4px; height: 4px; margin-left: -2px;
  border-radius: 50%; background: #fff; opacity: 0; pointer-events: none;
  box-shadow: 0 0 8px rgba(255,255,255,.95);
}
.atelier-coiffe {
  position: absolute; left: 6%; right: 6%; top: 3px; height: 3px; border-radius: 3px;
  background: #f4fbff; transform-origin: left center; opacity: .95; pointer-events: none;
  box-shadow: 0 0 7px rgba(207,228,245,.8);
}

/* ───────── ⑦a NOËL ───────── */
/* ───────── LE DÉCOR PHOTOGRAPHIQUE ─────────

   🚨 UNE PHOTO PLUTÔT QU'UN DESSIN — 16 octobre 2026.
   « Le design ne me convient pas, trop trop minimaliste pour du premium »,
   puis « fais un design réaliste avec Canva ».

   Le dessin au trait, même en SVG, dit « application ». Une photographie
   dit « boutique ». Les ouvertures de saison acceptent donc une image de
   fond, et ne dessinent leur décor que si elle manque.

   🚨 LE VOILE N'EST PAS UNE DÉCORATION, IL EST OBLIGATOIRE.
   Sans lui, le nom se perd dans les lumières du décor — les guirlandes
   d'un sapin ou la lueur d'une citrouille tombent pile là où il se pose.
   Le voile est le plus sombre AU CENTRE, là où le nom arrive, et laisse
   les bords de l'image intacts. */
/* Le cadre, quand c'est une photo qui fait le décor : noir derrière, le
   temps que l'image arrive — jamais de blanc. */
.atelier-ciel-photo { position: absolute; inset: 0; overflow: hidden; background: #05080d; }

.atelier-photo-fond {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block; pointer-events: none;
}
.atelier-voile-fond {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(70% 26% at 50% 44%, rgba(4,8,14,.72), rgba(4,8,14,.28) 62%, transparent),
    linear-gradient(to bottom, rgba(4,8,14,.3), transparent 26%, transparent 70%, rgba(4,8,14,.35));
}

.atelier-ciel-noel {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(120% 70% at 50% 2%, #1b2d40 0%, #0a1119 46%, #05080d 78%);
}
.atelier-etoile { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #dff0ff; opacity: .18; }
.atelier-guirlande {
  position: absolute; top: -2vh; left: -4%; right: -4%; height: 8.2vh;
  border-bottom: 2px solid #2e3a46; border-radius: 0 0 54% 54% / 0 0 100% 100%;
  pointer-events: none;
}
.atelier-ampoule {
  position: absolute; width: 9px; height: 13px; border-radius: 50% 50% 45% 45%;
  transform-origin: 50% 0;
}
.atelier-ampoule::before {
  content: ""; position: absolute; left: 50%; top: -5px; width: 2px; height: 6px;
  margin-left: -1px; background: #2e3a46;
}
.atelier-boule { position: absolute; top: 0; transform-origin: 50% -46px; }
.atelier-boule > span {
  display: block; width: 26px; height: 26px; border-radius: 50%;
  box-shadow: 0 6px 16px rgba(0,0,0,.6);
}
.atelier-boule::before {
  content: ""; position: absolute; left: 50%; top: -46px; width: 1px; height: 46px;
  margin-left: -.5px; background: #39485a;
}
.atelier-boule::after {
  content: ""; position: absolute; left: 50%; top: -6px; width: 9px; height: 7px;
  margin-left: -4.5px; border-radius: 2px;
  background: linear-gradient(180deg, #d9c48a, #8a7340);
}
/* Le sapin : une seule découpe, tronc compris. Dessiner des triangles
   empilés aurait demandé trois éléments par arbre. */
.atelier-sapin {
  position: absolute; bottom: 0; pointer-events: none;
  clip-path: polygon(50% 0%, 63% 24%, 56% 24%, 71% 50%, 63% 50%, 81% 78%, 56% 78%,
    56% 100%, 44% 100%, 44% 78%, 19% 78%, 37% 50%, 29% 50%, 44% 24%, 37% 24%);
}
.atelier-sapin > b { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #eef7ff; opacity: .92; }
.atelier-sapin > u { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 7px currentColor; }
.atelier-congere {
  position: absolute; left: -8%; right: -8%; bottom: -5vh; height: 15vh;
  border-radius: 50% 50% 0 0; pointer-events: none; filter: blur(6px);
  background: radial-gradient(60% 100% at 50% 100%, rgba(244,251,255,.55), rgba(207,228,245,.16) 68%, transparent);
  transform: translateY(0); opacity: 1;
}

/* ───────── ⑦b HALLOWEEN ─────────
   Le même cœur que Noël — une matière qui tombe et qui écrit le nom — mais
   ce sont des FEUILLES MORTES qui vrillent en tombant, sous une pleine
   lune, au-dessus de citrouilles allumées.

   🚨 LA VRILLE EST CE QUI SÉPARE UNE FEUILLE D'UN FLOCON. Un flocon tombe
   droit ; une feuille tourne sur elle-même. C'est la variable « --vrille »
   de l'image clé « atelier-tombe », laissée à zéro pour la neige. Sans
   elle, Halloween ressemblerait à une neige orange. */
@keyframes atelier-vole {
  0%   { transform: translate(0, 0) scaleY(1); }
  25%  { transform: translate(28vw, -3vh) scaleY(.45); }
  50%  { transform: translate(56vw, 2vh) scaleY(1); }
  75%  { transform: translate(84vw, -2vh) scaleY(.45); }
  100% { transform: translate(118vw, 1vh) scaleY(1); }
}

/* 🚨 UNE ARAIGNÉE NE S'ARRÊTE PAS NET AU BOUT DE SON FIL.
   ─────────────────────────────────────────────────────
   Elle descend TROP BAS, puis remonte se caler : c'est le poids du corps
   sur la soie, et c'est ce détail-là qui sépare une bête vivante d'un
   autocollant qu'on pose. Le dépassement se règle par « --sur », en
   pixels, différent pour chacune.

   ⚠️ LE FIL PART DU HAUT DU CADRE, pas du haut de l'araignée. Le groupe
   entier démarre décalé vers le haut de la longueur du fil : tant qu'il
   descend, la partie au-dessus de l'écran est coupée, et le fil semble
   donc sortir du plafond. Un fil de longueur fixe flotterait dans le
   vide. */
@keyframes atelier-descend-fil {
  0%   { transform: translateY(calc(-1 * var(--fil, 20vh))); }
  72%  { transform: translateY(calc(var(--sur, 14) * 1px)); }
  100% { transform: translateY(0); }
}

/* 🚨 LE BALANCIER PIVOTE AU PLAFOND, PAS SUR LA BÊTE.
   Une araignée qui tourne sur elle-même fait toupie. Celle-ci pend : plus
   son fil est long, plus son mouvement est ample et lent — et ça, on ne
   l'obtient qu'en plaçant l'origine de la rotation au point d'accroche. */
@keyframes atelier-pendule {
  0%, 100% { rotate: -2.6deg; }
  50%      { rotate: 2.6deg; }
}

/* Les pattes travaillent pendant qu'elle pend, chacune à son rythme.
   Jamais toutes ensemble : huit pattes synchronisées font un jouet. */
@keyframes atelier-patte {
  0%, 100% { rotate: 0deg; }
  50%      { rotate: var(--flex, 3deg); }
}

/* La bougie dans la citrouille ne brûle pas régulièrement : elle vacille. */
@keyframes atelier-vacille {
  0%, 100% { opacity: .78; filter: brightness(1); }
  28%      { opacity: 1; filter: brightness(1.45); }
  54%      { opacity: .62; filter: brightness(.8); }
  76%      { opacity: .95; filter: brightness(1.25); }
}
@keyframes atelier-brume {
  0%   { opacity: 0; transform: translate(-6%, 2vh); }
  40%  { opacity: 1; }
  100% { opacity: .85; transform: translate(6%, 0); }
}

/* Sans photo : une nuit bleue avec une lueur dorée au ras du sol, pour que
   les feux aient un ciel où éclater. */
.atelier-ciel-nouvelan {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 40% at 50% 100%, #2a2008 0%, #0d1020 46%, #06080f 80%);
}

.atelier-ciel-halloween {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 46% at 50% 100%, #3a1c08 0%, #1a0f1c 44%, #0a0610 78%);
}
.atelier-lune {
  position: absolute; border-radius: 50%;
  background: radial-gradient(130% 130% at 36% 30%, #fff8e8, #f0dcb0 52%, #c9ab74);
  box-shadow: 0 0 46px 14px rgba(255,236,190,.26);
}
/* Les cratères : trois creux posés sur la lune, rien de plus. */
.atelier-lune > b { position: absolute; border-radius: 50%; background: rgba(150,124,82,.4); }

/* La chauve-souris : une seule découpe, ailes comprises. */
.atelier-chauve {
  position: absolute; background: #0d0812; pointer-events: none;
  clip-path: polygon(50% 38%, 62% 22%, 74% 34%, 88% 18%, 84% 44%, 96% 62%, 72% 58%,
    58% 74%, 50% 62%, 42% 74%, 28% 58%, 4% 62%, 16% 44%, 12% 18%, 26% 34%, 38% 22%);
}

/* ⚠️ LA TOILE EST FAITE DE DEUX DÉGRADÉS, PAS DE TRENTE TRAITS.
   Un dégradé conique répété donne les rayons, un dégradé radial donne les
   arcs, et un masque arrondit le tout dans le coin. Dessinée à la main,
   cette toile aurait coûté une quinzaine d'éléments PAR COIN. */
.atelier-toile {
  position: absolute; width: 34vw; height: 34vw; pointer-events: none; opacity: .55;
  background:
    repeating-conic-gradient(from 0deg at 0% 0%, rgba(226,235,245,.5) 0deg .5deg, transparent .5deg 12deg),
    radial-gradient(circle at 0% 0%,
      transparent 0 3.4vw, rgba(226,235,245,.42) 3.4vw 3.6vw,
      transparent 3.6vw 7vw, rgba(226,235,245,.42) 7vw 7.2vw,
      transparent 7.2vw 11vw, rgba(226,235,245,.42) 11vw 11.2vw,
      transparent 11.2vw 15.4vw, rgba(226,235,245,.42) 15.4vw 15.6vw, transparent 15.6vw);
  -webkit-mask-image: radial-gradient(circle at 0% 0%, #000 0 62%, transparent 94%);
  mask-image: radial-gradient(circle at 0% 0%, #000 0 62%, transparent 94%);
}

/* Deux groupes emboîtés, et chacun a son rôle : celui du dehors DESCEND,
   celui du dedans SE BALANCE. Les mélanger sur un seul élément ferait que
   la seconde animation écrase la première — « transform » ne se cumule
   pas entre deux animations. */
.atelier-chute { position: absolute; top: 0; transform-origin: 50% 0; }
.atelier-pendule { position: relative; transform-origin: 50% 0; }

/* ⚠️ LE FIL EST PLUS PÂLE EN HAUT. Il attrape moins la lumière loin du
   corps — et surtout, on ne voit plus où il commence, donc on ne voit
   plus le truc. */
.atelier-fil {
  position: absolute; left: 50%; top: 0; width: 1px; margin-left: -.5px;
  background: linear-gradient(to bottom, rgba(226,235,245,.05), rgba(226,235,245,.5));
}

/* La patte tourne autour du CORPS, pas autour d'elle-même : d'où
   « view-box », qui place l'origine dans le repère du dessin. */
.atelier-patte {
  fill: none; stroke-linecap: round;
  transform-box: view-box; transform-origin: 20px 19px;
}

.atelier-citrouille {
  position: absolute; bottom: 0; border-radius: 48% 48% 44% 44%;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0 1px, transparent 1px 22%),
    radial-gradient(120% 120% at 34% 26%, #ff9a3c, #d2601a 56%, #7a3209);
  box-shadow: 0 -2px 18px rgba(255,150,60,.2);
}
.atelier-citrouille::before {
  content: ""; position: absolute; left: 50%; top: -11%; width: 12%; height: 16%;
  margin-left: -6%; border-radius: 3px; background: #3f5a28;
}
/* Les yeux et la bouche : trois découpes, et la lumière de la bougie
   derrière. C'est la lueur qui vacille, pas la forme. */
.atelier-citrouille > b {
  position: absolute; background: #ffd27a; box-shadow: 0 0 10px #ffb347, 0 0 22px #ff8a1f;
}
.atelier-oeil { clip-path: polygon(0% 100%, 50% 0%, 100% 100%); }
.atelier-bouche { clip-path: polygon(0% 0%, 14% 64%, 28% 0%, 44% 70%, 58% 0%, 72% 64%, 86% 0%, 100% 58%, 100% 100%, 0% 100%); }

.atelier-brume {
  position: absolute; left: -12%; right: -12%; bottom: -4vh; height: 18vh;
  pointer-events: none; filter: blur(9px); opacity: .85;
  background: radial-gradient(70% 100% at 50% 100%, rgba(214,196,230,.4), rgba(140,110,170,.14) 66%, transparent);
}

/* ───────── ⑦c LE NOUVEL AN ─────────
   Même cœur que les deux autres saisons — une matière qui tombe et qui
   écrit le nom — mais ce sont des CONFETTIS, et il s'y ajoute ce qu'aucune
   autre ouverture n'a : des feux d'artifice qui éclatent pour de vrai.

   🚨 LA FUSÉE MONTE D'ABORD, ET C'EST ELLE QUI FAIT LE FEU D'ARTIFICE.
   ──────────────────────────────────────────────────────────────────────
   Un éclat qui paraît d'un coup n'est pas un feu d'artifice : c'est une
   étoile. Ce qui fait la chose, c'est l'ATTENTE — le point qui monte, qui
   s'étire en montant, qui s'éteint, et seulement après, la gerbe. Une
   seconde entière pour un dixième de seconde d'éclat.

   ⚠️ ELLE S'ÉTIRE EN MONTANT (scaleY jusqu'à 3) : une bille qui monte
   droit fait bulle. L'étirement donne la vitesse. */
@keyframes atelier-fusee {
  0%   { opacity: 0; transform: translateY(0) scaleY(1); }
  12%  { opacity: 1; }
  88%  { opacity: 1; transform: translateY(calc(var(--mh) * .96)) scaleY(3); }
  100% { opacity: 0; transform: translateY(var(--mh)) scaleY(1); }
}

/* 🚨 LA GERBE RETOMBE PENDANT QU'ELLE S'ÉTEINT.
   Sans cette chute, vingt points qui s'écartent d'un centre font une roue
   de vélo, pas un feu d'artifice. C'est la pesanteur qui fait la
   différence, et elle est portée par le GROUPE — pas par chaque éclat,
   sinon il faudrait composer la rotation et la chute sur un même
   « transform », et la seconde écraserait la première. */
@keyframes atelier-gerbe {
  0%   { opacity: 0; transform: translateY(0); }
  6%   { opacity: 1; }
  100% { opacity: 1; transform: translateY(26px); }
}

/* Chaque éclat part du centre le long de son angle. L'ombre portée décalée
   lui fait une traînée qui pointe VERS le centre — une étincelle qui
   s'éloigne laisse sa lumière derrière elle. */
@keyframes atelier-eclat {
  0%   { opacity: 0; transform: rotate(var(--ang)) translateX(0) scale(1.3); }
  7%   { opacity: 1; }
  62%  { opacity: 1; }
  100% { opacity: 0; transform: rotate(var(--ang)) translateX(var(--d)) scale(.25); }
}

@keyframes atelier-flash-feu {
  0%   { opacity: 0; transform: scale(.2); }
  18%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}

.atelier-fusee {
  position: absolute; width: 3px; height: 3px; border-radius: 50%;
  background: #fff; opacity: 0; pointer-events: none;
}
.atelier-gerbe { position: absolute; opacity: 0; pointer-events: none; }
.atelier-eclat {
  position: absolute; left: 0; top: 0; width: 3.4px; height: 3.4px;
  border-radius: 50%; opacity: 0; pointer-events: none;
}
.atelier-flash-feu {
  position: absolute; width: 120px; height: 120px; margin: -60px 0 0 -60px;
  border-radius: 50%; opacity: 0; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,250,235,.8), transparent 70%);
}

/* Le confetti est un petit rectangle de papier : il VRILLE sur deux axes en
   tombant. Un flocon tombe droit, une feuille tourne à plat, un confetti
   se retourne — c'est ce qui le distingue des deux autres matières. */
.atelier-confetti { border-radius: 1px; }

/* Le confetti qui vise sa lettre tourne aussi en tombant, et il est
   rectangulaire : un rond blanc ferait flocon, en plein mois de janvier. */
@keyframes atelier-vers-lettre-confetti {
  0%   { opacity: 0; transform: translate(var(--dx, 0px), -42vh) rotate(0deg) scale(.6); }
  14%  { opacity: 1; }
  86%  { opacity: 1; transform: translate(0, -4px) rotate(220deg) scale(1); }
  100% { opacity: 0; transform: translate(0, 2px) rotate(300deg) scale(.3); }
}

/* 🚨 ON MESURE LE NOM IMMOBILE, PAS LE NOM EN TRAIN D'ARRIVER.
   ───────────────────────────────────────────────────────────
   Mesuré sur banc le 16 octobre 2026, à 375 px : « scrollHeight » rendait
   10 px de plus que la hauteur réelle du nom. La cause est l'animation
   elle-même — au moment où l'on mesure, chaque lettre est encore à son état
   de départ, décalée de .42em vers le bas et réduite à 90 %. Ce décalage
   entre dans la zone de débordement, et NomQuiTient croyait donc le nom plus
   haut qu'il ne sera.

   À 21 px, dix pixels font 0,42 ligne : l'arrondi les absorbait encore. Mais
   la marge n'était plus que de 0,08 ligne — un nom pile à la limite aurait
   perdu une taille sans raison, et personne n'aurait su pourquoi.

   Le temps de la mesure, on fige donc les lettres à leur état final. La
   classe est posée et retirée dans le même passage, avant la première
   image : rien de tout cela ne se voit. */
.atelier-nom-mesure .atelier-mot span {
  animation: none !important;
  transform: none !important;
  filter: none !important;
  opacity: 1 !important;
}

@media (prefers-reduced-motion: reduce) {
  .atelier-anime,
  .atelier-glisse-avant,
  .atelier-glisse-arriere,
  .atelier-carte { animation: none !important; }

  /* 🚨 L'OUVERTURE N'EST PLUS DANS CETTE LISTE — 16 octobre 2026.

     Elle y était, et c'était ELLE qui bloquait tout : « ça ne marche
     toujours pas, c'est incroyable qu'un si petit truc puisse bloquer
     toute mon application ». Deux corrections étaient passées à côté
     avant de trouver cette ligne.

     Le reste de la boutique continue d'honorer « animations réduites » :
     les cartes, les glissements, les apparitions. Seule l'ouverture en
     sort — une à trois secondes, sans clignotement ni défilement, et
     choisie délibérément par le vendeur pour sa boutique.

     ⚠️ SI ELLE DOIT Y REVENIR, il faut AUSSI remettre le filtre dans
     INTRO.active (voir commun.jsx) : la règle seule donne une couche
     visible et immobile pendant la durée réglée, c'est-à-dire le pire
     des deux. C'est exactement l'état qu'on a eu une heure durant. */
}`;

document.title = (APERCU ? "Aperçu — " : "") + BOUTIQUE.nom;

/* ═══════ GARDER LA BOUTIQUE SUR SON TÉLÉPHONE ═══════

   Le manifeste rend la boutique installable ; ce bandeau la fait installer.
   Sur Android il ouvre la vraie fenêtre du navigateur ; sur iPhone, où Apple
   n'autorise aucun bouton, il montre le geste à faire. Les règles de
   discrétion sont dans le long commentaire de l'outil qui l'a posé. */
const ECARTE = "dmly-installer-ecarte";

const seSouvient = {
  lu() { try { return localStorage.getItem(ECARTE) === "1"; } catch (e) { return false; } },
  ecrit() { try { localStorage.setItem(ECARTE, "1"); } catch (e) {} },
};

const DEJA_INSTALLEE = () => {
  try {
    return window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
  } catch (e) { return false; }
};

const EST_IPHONE = () => {
  try {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua)
      || (/Mac/i.test(ua) && typeof document.ontouchend !== "undefined");
  } catch (e) { return false; }
};

export function InviterAInstaller() {
  const [vu, setVu] = React.useState(false);
  const [fenetre, setFenetre] = React.useState(null);
  const iphone = EST_IPHONE();

  React.useEffect(() => {
    /* Dans Telegram, déjà installée, sur un ordinateur, ou déjà écartée :
       on ne s'inscrit même pas à l'événement. */
    if (telegram || DEJA_INSTALLEE() || seSouvient.lu()) return undefined;
    const surTelephone = iphone || /Android/i.test(navigator.userAgent || "");
    if (!surTelephone) return undefined;

    /* Android prévient qu'il peut installer. On garde l'événement : il ne se
       rejoue pas, et le navigateur n'ouvre sa fenêtre qu'en réponse à un vrai
       appui — pas à un appel spontané. */
    const capter = (e) => { e.preventDefault(); setFenetre(e); };
    window.addEventListener("beforeinstallprompt", capter);

    /* Six secondes : le temps de regarder ce qu'on est venu voir. */
    const minuteur = setTimeout(() => setVu(true), 3500);
    return () => {
      window.removeEventListener("beforeinstallprompt", capter);
      clearTimeout(minuteur);
    };
  }, [iphone]);

  /* Sur Android, rien à montrer tant que le navigateur n'a pas dit qu'il
     pouvait installer : un bouton qui n'ouvrirait aucune fenêtre serait pire
     que pas de bouton. Sur iPhone il n'y a jamais d'événement, et le geste
     existe quand même : on l'explique. */
  if (!vu || (!fenetre && !iphone)) return null;

  const fermer = () => { seSouvient.ecrit(); setVu(false); };

  return (
    <div
      className="fixed left-0 right-0 z-40 px-3"
      style={{ bottom: 74 }}
    >
      <div
        className="mx-auto flex items-center gap-3 px-3 py-2.5"
        style={{
          maxWidth: 560, background: CARTE, border: `1px solid ${bordure}`,
          borderRadius: ANGLE, boxShadow: "0 6px 24px #000A",
        }}
      >
        {BOUTIQUE.logo ? (
          <img src={BOUTIQUE.logo} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", flex: "0 0 auto" }} />
        ) : null}
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: CORPS, fontSize: 12.5, fontWeight: 600, color: texte, lineHeight: 1.25 }}>
            Garde {BOUTIQUE.nom} sur ton téléphone
          </p>
          <p style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux, lineHeight: 1.3, marginTop: 2 }}>
            {iphone
              ? "Appuie sur Partager, puis « Sur l’écran d’accueil »."
              : "Elle s’ouvrira en plein écran, sans passer par le navigateur."}
          </p>
        </div>
        {!iphone && (
          <button
            onClick={async () => {
              try { fenetre.prompt(); await fenetre.userChoice; } catch (e) {}
              fermer();
            }}
            className="px-3 py-2 active:scale-95 transition-transform"
            style={{
              background: rose, color: ENCRE(rose), fontFamily: CORPS, fontWeight: 700,
              fontSize: 11.5, borderRadius: ANGLE_PETIT, whiteSpace: "nowrap",
            }}
          >
            Installer
          </button>
        )}
        <button
          onClick={fermer}
          aria-label="Masquer cette proposition"
          style={{ color: texteDoux, fontSize: 18, lineHeight: 1, padding: "2px 4px", flex: "0 0 auto" }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ═══════ LA BOUTIQUE OUVERTE DANS TELEGRAM ═══════

   Telegram affiche les mini-applications dans sa propre fenêtre, qui n'est pas
   un navigateur ordinaire. Trois choses y changent, et il faut s'y plier :

     1. UN LIEN EXTERNE NE S'OUVRE PAS TOUT SEUL. « target="_blank" » y est
        souvent ignoré : le client appuie sur « payer 32,00 € », et il ne se
        passe rien. Telegram veut qu'on le lui demande, par openLink.

     2. IL PRÊTE SES PROPRES BOUTONS — un grand en bas de l'écran, une flèche
        retour en haut — qui sont hors de la page. Les utiliser est ce qui fait
        la différence entre « un site dans une fenêtre » et « une application ».

     3. SA BARRE DU HAUT A SA COULEUR À LUI, blanche par défaut, qui coupe net
        avec un fond noir.

   ⚠️ CHAQUE APPEL EST PROTÉGÉ. Ces fonctions sont apparues au fil des versions
   de Telegram ; sur un téléphone qui n'a pas mis à jour, appeler la mauvaise
   interrompt la page — et la boutique entière disparaîtrait pour un bouton. On
   demande donc la version, et on enveloppe tout. Hors de Telegram, rien de
   tout ceci ne s'exécute et la boutique est exactement ce qu'elle était. */
/* 🚨 « window.Telegram.WebApp » EXISTE AUSSI HORS DE TELEGRAM.
   ──────────────────────────────────────────────────────────
   Le script de Telegram est chargé par la page, toujours. Ouverte dans Chrome,
   la boutique trouve donc un WebApp complet — avec openLink, MainButton, tout
   — mais inerte, qui annonce « platform: unknown » et une version 6.0 de
   façade.

   Se fier à sa seule présence serait une faute grave : la boutique aurait
   confié SES LIENS DE PAIEMENT à un openLink qui ne mène nulle part, et le
   client aurait appuyé sur « payer » sans que rien ne s'ouvre — dans le cas le
   plus courant, celui du navigateur ordinaire.

   On exige donc une plateforme nommée. Sans elle, « telegram » vaut null, et
   pas une ligne de ce qui suit ne s'exécute. */
const tgBrut = (window.Telegram && window.Telegram.WebApp) || null;
export const telegram =
  tgBrut && tgBrut.platform && tgBrut.platform !== "unknown" ? tgBrut : null;

const tgAuMoins = (version) => {
  try {
    return !!telegram && typeof telegram.isVersionAtLeast === "function"
      && telegram.isVersionAtLeast(version);
  } catch (e) {
    return false;
  }
};

// Appeler Telegram sans jamais laisser une erreur remonter jusqu'à la page.
export const tgEssayer = (action) => {
  if (!telegram) return false;
  try { action(telegram); return true; } catch (e) { return false; }
};

/* OUVRIR UNE ADRESSE HORS DE LA BOUTIQUE — paiement, commande, lien utile.
   Dans Telegram on passe par lui ; ailleurs, le navigateur fait son travail. */
export function ouvrirDehors(url) {
  const adresse = String(url || "").trim();
  if (!adresse) return;
  if (telegram) {
    const versTelegram = /^https?:\/\/(t\.me|telegram\.me)\//i.test(adresse);
    const ouvert = tgEssayer((tg) => {
      if (versTelegram && typeof tg.openTelegramLink === "function") tg.openTelegramLink(adresse);
      else if (typeof tg.openLink === "function") tg.openLink(adresse);
      else throw new Error("sans openLink");
    });
    if (ouvert) return;
  }
  window.open(adresse, "_blank", "noopener,noreferrer");
}

/* Le geste qui part d'un lien : dans Telegram on reprend la main, ailleurs on
   laisse le lien faire — ainsi « ouvrir dans un nouvel onglet » marche encore. */
export const clicLien = (url) => (e) => {
  if (!telegram) return;
  e.preventDefault();
  ouvrirDehors(url);
};

// Une petite vibration, là où elle confirme un geste. Jamais ailleurs : un
// téléphone qui vibre à chaque effleurement devient pénible en deux minutes.
export function vibrer(genre = "leger") {
  if (!tgAuMoins("6.1")) return;
  tgEssayer((tg) => {
    const h = tg.HapticFeedback;
    if (!h) return;
    if (genre === "succes") h.notificationOccurred("success");
    else h.impactOccurred(genre === "moyen" ? "medium" : "light");
  });
}

if (telegram) {
  tgEssayer((tg) => tg.ready());
  tgEssayer((tg) => tg.expand());

  /* La barre du haut et le fond aux couleurs de la boutique. La couleur libre
     n'est acceptée qu'à partir de 6.9 ; avant, on ne peut que désigner le fond
     du thème, ce qui vaut toujours mieux que du blanc sur du noir. */
  const fondBoutique = (COULEURS.fond || "").trim();
  if (tgAuMoins("6.9") && /^#[0-9a-f]{6}$/i.test(fondBoutique)) {
    tgEssayer((tg) => tg.setHeaderColor(fondBoutique));
    tgEssayer((tg) => tg.setBackgroundColor(fondBoutique));
  } else if (tgAuMoins("6.1")) {
    tgEssayer((tg) => tg.setHeaderColor("secondary_bg_color"));
  }

  /* Faire défiler un catalogue vers le bas refermait la mini-application : le
     geste est le même que celui qui la quitte. On le désactive là où Telegram
     le permet. */
  if (tgAuMoins("7.7")) tgEssayer((tg) => tg.disableVerticalSwipes());
}

/* Le retard d'une carte dans la cascade, d'après son rang.
   Plafonné au douzième : au-delà, l'écran est de toute façon rempli et plus
   personne ne regarde les suivantes — mais sans plafond, le 83ᵉ article d'un
   rayon n'apparaîtrait qu'après deux secondes et demie d'écran vide. */
export const CASCADE = (rang) => ({ animationDelay: `${Math.min(rang, 11) * 28}ms` });

export const euros = (n) => n.toFixed(2).replace(".", ",") + " €";

/* ⚠️ LES FRAIS D'ENVOI, CALCULÉS À UN SEUL ENDROIT.
   ─────────────────────────────────────────────────
   Un prix d'envoi se recopie vite à trois endroits — l'affichage du panier, le
   message de commande, le montant envoyé au prestataire — et il suffit qu'un
   seul reste en arrière pour que le client paie 60 € et que le vendeur en
   attende 72. Le calcul vit donc ici, et les trois s'en servent.

   Prix à zéro = la boutique n'ajoute rien, et aucune ligne ne s'affiche : une
   boutique qui livre en main propre n'a pas à parler de frais d'envoi. */
export const LIVRAISON_PRIX = Math.max(0, Number(BOUTIQUE.livraisonPrix) || 0);
export const LIVRAISON_OFFERTE_DES = Math.max(0, Number(BOUTIQUE.livraisonOfferteDes) || 0);

/* Ce que coûte l'envoi pour un panier d'articles valant « sousTotal ».

   🚨 RIEN À PAYER QUAND ON SE DÉPLACE. Le mode traverse donc tous les
   calculs — c'est la seule façon d'être sûr que le panier, le total, le
   message de commande et le montant envoyé au prestataire disent la même
   chose. Un seul de ces quatre resté en arrière, et le client paie 4,90 €
   de port pour venir chercher son colis à pied. */
export function fraisLivraison(sousTotal, mode = MODE_PAR_DEFAUT) {
  if (mode === "main") return 0;
  if (!LIVRAISON_PRIX) return 0;
  if (LIVRAISON_OFFERTE_DES > 0 && sousTotal >= LIVRAISON_OFFERTE_DES) return 0;
  return LIVRAISON_PRIX;
}

// Ce qu'il y a VRAIMENT à régler : les articles et l'envoi.
export function totalAPayer(items, mode = MODE_PAR_DEFAUT) {
  const articles = cartTotal(items);
  return Math.round((articles + fraisLivraison(articles, mode)) * 100) / 100;
}

/* Ce qui manque pour que l'envoi devienne gratuit, ou 0 s'il l'est déjà.
   C'est la phrase qui fait ajouter un article : « plus que 8 € ».
   Muette en main à main : il n'y a aucun envoi à offrir. */
export function resteAvantEnvoiOffert(sousTotal, mode = MODE_PAR_DEFAUT) {
  if (mode === "main") return 0;
  if (!LIVRAISON_PRIX || !LIVRAISON_OFFERTE_DES) return 0;
  const reste = LIVRAISON_OFFERTE_DES - sousTotal;
  return reste > 0 ? Math.round(reste * 100) / 100 : 0;
}

/* Les frais, dits en une ligne, pour l'étiquette du choix. On les annonce
   AVANT de choisir : c'est précisément ce qui fait choisir. */
export function ditLesFrais(sousTotal, mode) {
  if (mode === "main") return "sans frais d'envoi";
  if (!LIVRAISON_PRIX) return "";
  const port = fraisLivraison(sousTotal, "envoi");
  if (!port) return "envoi offert";
  const reste = resteAvantEnvoiOffert(sousTotal, "envoi");
  return reste ? euros(port) + " · offert dès " + euros(LIVRAISON_OFFERTE_DES) : euros(port);
}

export function cartTotal(items) {
  return items.reduce((s, i) => s + i.prix * i.qty, 0);
}

/* ─────────────────────── où arrivent les commandes ───────────────────────
   Le propriétaire choisit son application. Une seule accepte aujourd'hui un
   message déjà écrit dans le lien : WhatsApp. Pour les autres, la commande est
   copiée au moment du clic et le client n'a plus qu'à la coller — c'est la
   seule façon honnête de faire, aucune adresse ne permet de pré-remplir. */
export const MESSAGERIES = {
  whatsapp: {
    nom: "WhatsApp", couleur: "#25D366", encre: "#0B0A08", prerempli: true,
    lien: (contact, message) =>
      `https://wa.me/${contact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`,
  },
  telegram: {
    nom: "Telegram", couleur: "#29A9EB", encre: "#04121C", prerempli: false,
    lien: (contact) => `https://t.me/${contact.replace(/^@/, "")}`,
  },
  signal: {
    nom: "Signal", couleur: "#3A76F0", encre: "#FFFFFF", prerempli: false,
    lien: (contact) => `https://signal.me/#p/+${contact.replace(/[^0-9]/g, "")}`,
  },
  snapchat: {
    nom: "Snapchat", couleur: "#FFFC00", encre: "#1A1A00", prerempli: false,
    lien: (contact) => `https://www.snapchat.com/add/${contact.replace(/^@/, "")}`,
  },
};

export const MESSAGERIE = MESSAGERIES[BOUTIQUE.messagerie] || MESSAGERIES.whatsapp;
// « contact » est le champ actuel ; « whatsapp » reste lu pour les boutiques
// écrites avant ce choix.
export const CONTACT = String(BOUTIQUE.contact || BOUTIQUE.whatsapp || "").trim();

/* ═══════ LES MOYENS DE PAIEMENT ═══════
   Annoncés avant que le client commande, jamais après : savoir qu'on ne peut
   payer qu'en espèces se découvre au moment de choisir, pas une fois le message
   envoyé.

   ★ La boutique ne demande JAMAIS de numéro de carte, et n'en recevra jamais.
   Elle n'a pas de serveur : un numéro saisi ici ne serait protégé par personne.
   Les liens ci-dessous ouvrent la page du prestataire — c'est lui qui encaisse,
   sur sa propre page. */
/* ⚠️ « PAYER AVEC REVOLUT » FAISAIT FUIR CEUX QUI N'ONT PAS REVOLUT.
   ─────────────────────────────────────────────────────────────────
   C'était pourtant faux : la page de Revolut propose, noir sur blanc,
   « Revolut · Carte de débit ou de crédit · Apple Pay ». N'importe quelle
   carte bancaire y passe, sans compte, sans rien installer. Le bouton
   annonçait le nom du prestataire — celui qui intéresse le VENDEUR — là où le
   client, lui, cherche à savoir s'il peut payer avec SA carte.

   « carte » dit donc qu'une carte bancaire suffit chez ce prestataire, et le
   bouton le dit à sa place. Vérifié sur la page de Revolut.

   PayPal reste annoncé sous son nom : il propose souvent de payer par carte
   sans compte, mais pas partout ni pour tous les comptes — l'affirmer serait
   promettre ce qu'on n'a pas constaté. */
const CATALOGUE_PAIEMENTS = {
  paypal: { nom: "PayPal", emoji: "🅿️", choix: true },
  revolut: {
    nom: "Revolut",
    emoji: "💳",
    carte: true,
    moyens: ["Carte bancaire", "Apple Pay", "Revolut"],
    rassure: "Aucun compte Revolut nécessaire",
  },
  lydia: { nom: "Lydia", emoji: "🇱" },
  wero: { nom: "Wero", emoji: "🇪🇺" },
};

/* Sur PayPal, le client choisit lui-même entre deux façons de payer, et ce
   choix ne se devine pas. Le vendeur dit laquelle il attend ; la boutique la
   lui rappelle au moment exact où il va la choisir — pas avant, pas après. */
const CONSIGNES = {
  proches: "Choisis « Entre proches » — aucun frais.",
  biens: "Choisis « Biens et services » au moment de payer.",
};

/* Le montant du panier ajouté au lien — uniquement là où le prestataire
   documente ce format. PayPal et Revolut le font ; Lydia et Wero non. Fabriquer
   une adresse au jugé enverrait le client sur une page cassée, ce qui est pire
   que de le laisser saisir la somme lui-même. */
function avecMontant(id, lien, total) {
  const base = String(lien || "").replace(/\/+$/, "");
  const somme = Number(total);
  if (!base || !(somme > 0)) return base;
  // PayPal seul : paypal.me/nom/12.50 est un format publié. Pour les autres, on
  // ne fabrique rien — une adresse inventée mène à une page introuvable, et le
  // client abandonne. Mieux vaut qu'il saisisse la somme.
  if (id === "paypal" && /paypal\.me\//i.test(base)) return `${base}/${somme.toFixed(2)}`;
  return base;
}

// Un lien qui n'est pas en https:// n'est pas affiché : le moteur ne fait
// confiance à rien, pas même à ce qu'il a écrit lui-même.
const lienSur = (u) => {
  try {
    return new URL(String(u || "")).protocol === "https:" ? String(u) : "";
  } catch (e) {
    return "";
  }
};

/* ★ UN MOYEN SANS COMPTE RELIÉ N'EST JAMAIS PROPOSÉ.
   Afficher « PayPal » sans lien, c'est promettre au client un paiement qu'il ne
   pourra pas faire : il clique, rien ne s'ouvre, et il repart. Pire, il peut
   croire avoir payé.

   La règle est donc sans exception : pas de lien valide, pas de moyen affiché.
   Un moyen coché dans l'atelier mais laissé sans adresse n'existe pas pour le
   client — l'atelier le dit en clair de son côté. */
export const PAIEMENTS = (BOUTIQUE.paiements || [])
  .filter((p) => p && (CATALOGUE_PAIEMENTS[p.id] || (p.id === "perso" && p.nom)))
  .map((p) => ({
    id: p.id,
    nom: CATALOGUE_PAIEMENTS[p.id] ? CATALOGUE_PAIEMENTS[p.id].nom : p.nom,
    emoji: CATALOGUE_PAIEMENTS[p.id] ? CATALOGUE_PAIEMENTS[p.id].emoji : (p.emoji || "💳"),
    lien: lienSur(p.lien),
    note: p.note || "",
    consigne: (CATALOGUE_PAIEMENTS[p.id] || {}).choix ? CONSIGNES[p.nature] || "" : "",
    carte: !!(CATALOGUE_PAIEMENTS[p.id] || {}).carte,
    moyens: (CATALOGUE_PAIEMENTS[p.id] || {}).moyens || [],
    rassure: (CATALOGUE_PAIEMENTS[p.id] || {}).rassure || "",
  }))
  .filter((p) => !!p.lien);

/* CE QU'IL FAUT DONNER POUR RECEVOIR UN COLIS.
   Réglé depuis l'atelier, onglet Commandes. Vide = rien ne s'affiche. */
export const LIVRAISON = String(BOUTIQUE.livraison || "").trim();

/* ═══════════ COMMENT LE CLIENT REÇOIT SA COMMANDE ═══════════

   🚨 UNE BOUTIQUE SUR DEUX N'EXPÉDIE RIEN.
   ─────────────────────────────────────────
   Demandé le 15 octobre 2026 : « d'autres clients qui font leur boutique
   veulent peut-être vendre de main en main, donc sans passer par la CB ou
   le virement — il faut penser à eux, et optimiser une façon de choisir ».

   Trois cas, et le troisième est le vrai sujet :
     « envoi »  un colis part. C'est tout ce que la boutique savait faire.
     « main »   on se retrouve. Aucun frais de port, aucune adresse.
     « deux »   la boutique propose les deux et L'ACHETEUR choisit — lui
                seul sait s'il habite à côté.

   ⚠️ ABSENT = « envoi ». Une boutique publiée avant ce réglage se comporte
   exactement comme avant : c'est la seule façon de ne casser personne.

   ★ CE QUE LES GRANDS NE SAVENT PAS FAIRE. Chez Shopify, le retrait sur
   place affiche quand même les champs d'adresse : leur documentation ne
   propose de les cacher qu'en écrivant une extension de paiement. Ici, la
   question se pose AVANT de demander quoi que ce soit — et une main à main
   ne demande donc jamais d'adresse. C'est l'avantage d'une boutique qui
   tient dans une conversation. */
const RECEPTIONS_CONNUES = ["envoi", "main", "deux"];
export const RECEPTION = RECEPTIONS_CONNUES.includes(BOUTIQUE.reception) ? BOUTIQUE.reception : "envoi";

/* Le secteur, pas l'adresse. Les guides de vente entre particuliers sont
   unanimes : on ne publie pas son domicile, on convient d'un lieu public.
   « Grenoble centre » suffit à savoir si c'est faisable. */
export const RECEPTION_LIEU = String(BOUTIQUE.receptionLieu || "").trim();
export const RECEPTION_TEXTE = String(BOUTIQUE.receptionTexte || "").trim();

// Les façons réellement proposées, dans l'ordre où on les montre.
export const MODES_RECEPTION = RECEPTION === "deux" ? ["envoi", "main"] : [RECEPTION];

/* 🚨 LE MODE PAR DÉFAUT EST « ENVOI » QUAND LES DEUX SONT OFFERTS.
   C'est la convention des grandes boutiques, et surtout : c'est la seule
   qui ne cache pas un frais. Partir sur « main à main » afficherait un
   total sans frais de port qui AUGMENTERAIT en changeant d'avis — un prix
   qui monte en cours de route, c'est une commande perdue. L'inverse est
   une bonne surprise, et le choix est en haut du panier, en gros. */
export const MODE_PAR_DEFAUT = MODES_RECEPTION[0];

export const NOMS_RECEPTION = {
  envoi: { nom: "Envoi du colis", court: "Envoi", emoji: "📦" },
  main: { nom: "Main à main", court: "Main à main", emoji: "🤝" },
};

/* La phrase de la boutique. Elle partait dans le message de commande et
   nulle part ailleurs : une phrase ecrite avec soin que personne ne lisait. */
export const ACCROCHE = String(BOUTIQUE.accroche || "").trim();

/* ★ BOUTIQUE OU VITRINE — la boutique le déduit, on ne le lui dit pas.

   Commander suppose un chemin : soit une conversation où envoyer la commande,
   soit un moyen de paiement relié. Sans ni l'un ni l'autre, il n'existe aucune
   façon d'acheter — et un panier ne sert alors qu'à décevoir : on y met des
   articles, on cherche comment valider, il n'y a rien.

   Dans ce cas la boutique devient une VITRINE : les articles, les photos et les
   prix restent, le panier disparaît entièrement. C'est un usage légitime — un
   catalogue qu'on montre, une carte de restaurant, une collection — et non une
   boutique en panne. */
export const PEUT_COMMANDER =
  (BOUTIQUE.commandeActive !== false && CONTACT !== "") || PAIEMENTS.length > 0;

/* La référence de commande.
   Un virement arrive chez le vendeur sans dire à quelle commande il répond :
   « X vous a envoyé 3,20 € », et rien d'autre. Avec deux clients dans la même
   minute, plus moyen de savoir qui a payé quoi.

   Cette référence courte relie les deux. Elle s'affiche au client, part dans le
   message de commande, et il la recopie dans le mot du virement. Elle ne
   protège de rien — elle permet seulement de s'y retrouver, ce qui manquait. */
export function referenceCommande() {
  const t = Date.now().toString(36).toUpperCase();
  return t.slice(-4);
}

/* UN BOUTON QUI COPIE, ET QUI LE DIT.
   Sans retour visible, le client appuie, ne voit rien, et appuie encore en se
   demandant si ça a marché. Le libellé devient « Copié ✓ » deux secondes.

   « navigator.clipboard » n'existe pas partout — vieux navigateur, page non
   sécurisée. On retombe alors sur un champ caché que l'on sélectionne, et si
   même ça échoue, le bouton disparaît plutôt que de mentir. */
function BoutonCopier({ valeur, libelle }) {
  const [fait, setFait] = useState(false);
  const [possible, setPossible] = useState(true);
  if (!possible) return null;

  const copier = () => {
    const secours = () => {
      try {
        const champ = document.createElement("textarea");
        champ.value = valeur;
        champ.setAttribute("readonly", "");
        champ.style.position = "fixed";
        champ.style.opacity = "0";
        document.body.appendChild(champ);
        champ.select();
        const ok = document.execCommand && document.execCommand("copy");
        document.body.removeChild(champ);
        return !!ok;
      } catch (e) {
        return false;
      }
    };
    const montrer = () => { setFait(true); setTimeout(() => setFait(false), 2000); };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(valeur).then(montrer, () => {
        if (secours()) montrer(); else setPossible(false);
      });
      return;
    }
    if (secours()) montrer(); else setPossible(false);
  };

  return (
    <button
      onClick={copier}
      className="rounded-lg px-2 py-1 active:scale-95 transition-transform flex-shrink-0"
      style={{
        background: fait ? vert : CARTE, border: `1px solid ${fait ? vert : bordure}`,
        color: fait ? ENCRE(vert) : texte, fontFamily: CORPS, fontSize: 10.5, fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {fait ? "Copié ✓" : libelle}
    </button>
  );
}

export function MoyensDePaiement({ total = 0, reference = "" }) {
  // Aucun moyen relié : le bloc entier disparaît, note comprise. Une précision
  // sur un paiement qui n'existe pas n'aurait aucun sens.
  if (!PAIEMENTS.length) return null;
  return (
    <div className="rounded-xl px-3 py-3" style={{ background: VOILE("#131317", "D9"), border: `1px solid ${bordure}` }}>
      {/* Régler et prévenir sont DEUX gestes, et il faut les deux : l'argent
          seul n'apprend pas où envoyer le colis, la commande seule ne paie
          pas. On les numérote, sinon le client en fait un et s'en va. */}
      <p className="text-[11px] uppercase tracking-wider mb-2 font-bold" style={{ color: jaune, fontFamily: CORPS }}>
        1 — Règle ta commande
      </p>

      {/* Le montant et la référence, en gros et au même endroit. C'est ce que
          le client doit saisir là où rien ne le pré-remplit — et ce que le
          vendeur retrouvera sur son relevé. */}
      {total > 0 && (
        <div className="rounded-lg px-3 py-2 mb-2" style={{ background: "#00000066", border: `1px solid ${jaune}44` }}>
          <p className="text-[11px]" style={{ color: texteDoux, fontFamily: CORPS }}>
            Montant à envoyer
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ fontFamily: TITRE, fontSize: 24, color: jaune, lineHeight: 1.1 }}>{euros(total)}</p>
            {/* ⚠️ PAYPAL PORTE LE MONTANT, REVOLUT NON.
                Revolut ne publie aucun format d'adresse qui emporte la somme :
                « revolut.me/nom/32eur » ne pré-remplit rien et renvoie même sur
                une page d'accueil — le lien de paiement est alors perdu. Son
                écran s'ouvre donc sur « quelle somme ? », et le client doit
                recopier le total.

                Ce bouton est ce qui s'en approche le plus : un doigt, et la
                somme est dans le presse-papiers, prête à coller. Mieux qu'un
                chiffre à retenir de tête en changeant d'application. */}
            <BoutonCopier valeur={total.toFixed(2)} libelle="Copier le montant" />
          </div>
          {reference && (
            <p className="text-[11px] mt-1 flex items-center gap-2 flex-wrap" style={{ color: texte, fontFamily: CORPS }}>
              <span>Indique la référence <b style={{ color: jaune }}>{reference}</b> dans le message du paiement.</span>
              <BoutonCopier valeur={reference} libelle="Copier la référence" />
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {PAIEMENTS.map((p) => (
          p.lien ? (
            <a
              key={p.id}
              href={avecMontant(p.id, p.lien, total)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={clicLien(avecMontant(p.id, p.lien, total))}
              /* ⚠️ PAYER DOIT RESSEMBLER À UNE ACTION, PAS À UNE INFORMATION.
                 « payer 32,00 € » était un petit texte pâle au bout d'une
                 ligne, à côté d'un bouton WhatsApp vert pleine largeur. Le
                 client ne voyait qu'une seule chose à faire — envoyer sa
                 commande — et repartait sans avoir réglé.

                 Chaque moyen de paiement est donc un bouton entier, de même
                 poids que celui de la commande, et qui porte le montant. */
              className="flex items-center gap-3 rounded-xl px-3 py-3 active:scale-[0.98] transition-transform"
              style={{ background: CARTE, border: `2px solid ${vert}`, textDecoration: "none" }}
            >
              <span style={{ fontSize: 19 }}>{p.emoji}</span>
              <span className="flex-1 min-w-0" style={{ fontFamily: CORPS }}>
                <span className="block font-bold" style={{ color: texte, fontFamily: TITRE, fontSize: 15, letterSpacing: ".3px" }}>
                  {/* Le client cherche à savoir s'il peut payer avec SA carte,
                      pas le nom du prestataire qui encaisse. */}
                  {p.carte
                    ? `PAYER ${avecMontant(p.id, p.lien, total) !== p.lien ? euros(total) + " " : ""}PAR CARTE BANCAIRE`
                    : (avecMontant(p.id, p.lien, total) !== p.lien
                      ? `PAYER ${euros(total)} AVEC ${p.nom.toUpperCase()}`
                      : `PAYER AVEC ${p.nom.toUpperCase()}`)}
                </span>
                {p.moyens.length > 0 && (
                  <span className="flex items-center gap-1 flex-wrap mt-1">
                    {p.moyens.map((m) => (
                      <span
                        key={m}
                        style={{
                          border: `1px solid ${bordure}`, borderRadius: 4, padding: "1px 5px",
                          fontSize: 9.5, fontWeight: 700, color: texteDoux, letterSpacing: ".03em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </span>
                )}
                {(p.rassure || p.note || p.consigne) && (
                  <span className="block text-[10.5px] mt-1" style={{ color: p.rassure ? vert : texteDoux }}>
                    {[p.rassure, p.note, p.consigne].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <span className="flex-shrink-0" style={{ color: vert, fontSize: 17 }}>↗</span>
            </a>
          ) : (
            <div key={p.id} className="flex items-center gap-2.5 px-2.5 py-1">
              <span style={{ fontSize: 15 }}>{p.emoji}</span>
              <span className="text-[12.5px]" style={{ color: texte, fontFamily: CORPS }}>
                {p.nom}{p.note ? ` — ${p.note}` : ""}
              </span>
            </div>
          )
        ))}
      </div>
      {(BOUTIQUE.paiementNote || "").trim() && (
        <p className="text-[11px] mt-2" style={{ color: texteDoux, fontFamily: CORPS }}>
          {BOUTIQUE.paiementNote}
        </p>
      )}
      <p className="text-[10px] mt-2" style={{ color: texteDoux, fontFamily: CORPS }}>
        Cette boutique ne demande jamais de numéro de carte. Un paiement en ligne se fait
        sur la page du prestataire, jamais ici.
      </p>
    </div>
  );
}

/* CE QU'IL FAUT DONNER POUR ÊTRE LIVRÉ — DANS LE PANIER, AVANT L'ENVOI.

   Le même texte part ensuite avec la commande. Il est écrit deux fois exprès :
   lu ici, le client sait ce qu'on va lui demander ; retrouvé dans la
   conversation, il n'a plus qu'à compléter les lignes.

   Encadré et non en gris discret : c'est la seule chose de ce panier que le
   client doit FAIRE. Une note grise sous un bouton vert ne se lit jamais. */
/* 🚨 LES LIGNES À COMPLÉTER NE SONT PAS LES MÊMES.
   Un envoi demande une adresse postale. Une main à main n'en demande
   JAMAIS : on ne donne pas son domicile pour aller boire un café. Prénom,
   téléphone, et le lieu se décide dans la conversation. */
export function texteARemplir(mode = MODE_PAR_DEFAUT) {
  if (mode === "main") {
    const lieu = RECEPTION_LIEU ? "Secteur de la remise : " + RECEPTION_LIEU + "\n\n" : "";
    return RECEPTION_TEXTE ? lieu + RECEPTION_TEXTE : "";
  }
  return LIVRAISON;
}

export function BlocLivraison({ mode = MODE_PAR_DEFAUT } = {}) {
  const dire = texteARemplir(mode);
  if (!dire) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 mb-3 flex gap-2.5"
      style={{ background: VOILE(fond, "CC"), border: `1px solid ${jaune}55` }}
    >
      <Package size={16} color={jaune} style={{ flexShrink: 0, marginTop: 2 }} />
      <p
        className="text-[12px]"
        style={{ color: texte, fontFamily: CORPS, lineHeight: 1.65, whiteSpace: "pre-line" }}
      >
        {dire}
      </p>
    </div>
  );
}

/* DÉCOUPER UNE LISTE ÉCRITE À LA MAIN.
   Le vendeur tape « 39 · 40 · 41 », ou « 39, 40, 41 », ou « 39/40/41 », ou
   « 39 40 41 » — et il a raison à chaque fois. C'est au logiciel de s'adapter,
   pas au vendeur d'apprendre une syntaxe.

   On coupe donc sur tout ce qui sépare visiblement, et on garde l'ordre écrit :
   une pointure se lit de la plus petite à la plus grande, et le vendeur l'a
   déjà rangée ainsi. */
/* DÉCOUPER UNE LISTE ÉCRITE À LA MAIN.

   Le vendeur écrit ses tailles comme il les dit. Vu en vrai dans une vraie
   boutique : « 39. 40. 42. 43 » — avec des points. Ailleurs : « 39, 40 »,
   « 39 · 40 », « 39/40 », ou simplement « 39 40 41 ». Toutes ces façons sont
   justes. C'est au logiciel de s'adapter, pas au vendeur d'apprendre une
   syntaxe qu'il n'a pas demandée.

   DEUX PIÈGES, et ils tirent en sens contraire.

   1. La virgule et le point séparent — mais ils marquent AUSSI la demi-
      pointure : « 38,5 », « 38.5 ». Pris pour des séparateurs, « 38,5 »
      devenait deux tailles, « 38 » et « 5 » : un 5 pour homme. Une demi-
      pointure s'écrivant toujours « ,5 » ou « .5 », on met celles-là à l'abri
      le temps de découper.

   2. L'espace sépare — mais pas toujours : « 8 US » est UNE taille en deux
      mots. On ne coupe donc sur les espaces que si TOUT le morceau est fait de
      nombres séparés par des espaces. « 39 40 41 » se coupe, « 8 US » reste
      entier. */
const DECIMALE = "\u0000";
const QUE_DES_NOMBRES = /^\d+(?:[.,]\d)?(?:\s+\d+(?:[.,]\d)?)+$/;

export const CHOIX = (texte) =>
  String(texte || "")
    .replace(/(\d)([.,])(5)(?!\d)/g, "$1" + DECIMALE + "$3")
    .split(/[·,;|\/\n.]+/)
    .flatMap((x) => {
      const morceau = x.split(DECIMALE).join(",").trim();
      return QUE_DES_NOMBRES.test(morceau) ? morceau.split(/\s+/) : [morceau];
    })
    .filter(Boolean);

export function texteCommande(items, reference = "", mode = MODE_PAR_DEFAUT) {
  const lignes = items.map((i) => {
    // La taille et la couleur choisies partent AVEC la commande. Sans elles,
    // le vendeur doit rappeler chaque client pour les lui demander.
    const precisions = [i.taille, i.couleur].filter(Boolean).join(", ");
    return `• ${i.nom}${precisions ? " (" + precisions + ")" : ""} — ${i.unite} (réf. ${i.ref}) x${i.qty} — ${euros(i.prix * i.qty)}`;
  });
  // Le moyen de paiement voyage avec la commande : le client garde une trace
  // de ce qui a été annoncé, et toi aussi. Aucun lien n'est recopié ici — un
  // lien de paiement se clique sur la boutique, pas dans une conversation.
  const moyens = PAIEMENTS.length
    ? `\n\nPaiement accepté : ${PAIEMENTS.map((p) => p.nom).join(", ")}`
    : "";
  // La référence, pour que le vendeur rapproche un virement d'une commande.
  const ref = reference ? `\n\nRéférence : ${reference}` : "";
  /* Les lignes à compléter partent EN DERNIER, donc juste au-dessus du
     clavier quand la conversation s'ouvre. Plus haut, elles passeraient
     au-dessus du pli et personne ne les verrait. */
  const envoi = texteARemplir(mode) ? `\n\n${texteARemplir(mode)}` : "";

  /* 🚨 LE VENDEUR DOIT LIRE LE MODE SANS LE DEVINER.
     Sans cette ligne, « je prends le 42 » arrive de la même façon pour un
     colis à expédier et pour quelqu'un qui passe demain. Elle n'apparaît
     que si la boutique propose VRAIMENT les deux : sinon elle ne dit rien
     que le vendeur ne sache déjà. */
  const ligneMode = RECEPTION === "deux"
    ? `\n\n${NOMS_RECEPTION[mode].emoji} ${NOMS_RECEPTION[mode].nom}` : "";

  /* L'envoi est une ligne de la commande, pas une surprise à l'arrivée. Le
     client doit lire le même total que celui qu'on lui demandera de régler. */
  const articles = cartTotal(items);
  const port = fraisLivraison(articles, mode);
  const lignePort = LIVRAISON_PRIX && mode !== "main"
    ? `\nSous-total : ${euros(articles)}\nFrais d'envoi : ${port ? euros(port) : "offerts"}`
    : "";
  return `${BOUTIQUE.accroche}\n\n${lignes.join("\n")}${lignePort}\n\nTotal : ${euros(articles + port)}${ligneMode}${ref}${moyens}${envoi}`;
}

export function lienCommande(items, reference = "", mode = MODE_PAR_DEFAUT) {
  return MESSAGERIE.lien(CONTACT, texteCommande(items, reference, mode));
}

/* ═══════════ LE CHOIX, EN HAUT DU PANIER ═══════════

   🚨 ON CHOISIT AVANT, PAS APRÈS.
   ────────────────────────────────
   Le mode décide des frais, du total et des lignes à remplir. Posé en bas,
   il ferait changer le total sous les yeux du client une fois qu'il l'a
   déjà lu. Il est donc tout en haut, avant la première somme.

   ⚠️ ET IL NE PARAÎT QUE S'IL Y A VRAIMENT UN CHOIX. Une boutique qui
   n'expédie pas affiche une phrase, pas deux boutons dont un seul marche :
   faire choisir entre une chose et rien, c'est faire perdre du temps.

   Deux pavés de même taille, côte à côte, chacun avec sa conséquence
   écrite dessous — « 4,90 € » contre « sans frais d'envoi ». C'est cette
   ligne-là qui fait choisir, et elle doit être lisible avant le doigt. */
export function ChoixReception({ mode, choisir, sousTotal = 0 }) {
  if (MODES_RECEPTION.length < 2) {
    if (RECEPTION !== "main") return null;
    return (
      <div
        className="rounded-xl px-3 py-2.5 mt-4 mb-3 flex items-center gap-2.5"
        style={{ background: VOILE(fond, "CC"), border: `1px solid ${bordure}` }}
      >
        <span style={{ fontSize: 17 }}>🤝</span>
        <p className="text-[12px]" style={{ color: texte, fontFamily: CORPS, lineHeight: 1.55 }}>
          <b>Remise en main propre</b> — aucun envoi postal, aucun frais de port.
          {RECEPTION_LIEU ? ` Secteur : ${RECEPTION_LIEU}.` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 mb-3" style={{ borderTop: `1px solid #232323` }}>
      <p className="text-[11px] uppercase tracking-wider mb-2 font-bold" style={{ color: jaune, fontFamily: CORPS }}>
        Comment veux-tu recevoir ta commande ?
      </p>
      <div className="flex gap-2">
        {MODES_RECEPTION.map((m) => {
          const actif = m === mode;
          return (
            <button
              key={m}
              onClick={() => { vibrer("leger"); choisir(m); }}
              aria-pressed={actif}
              /* ⚠️ PAS DE TEINTE CALCULÉE SUR LA COULEUR DU CLIENT. Un vert
                 additionné d'une transparence suppose un code à six chiffres,
                 et les couleurs viennent de l'atelier : « green » renverrait
                 un fond invalide. Le choix se voit au BORD et à l'opacité,
                 comme dans l'atelier lui-même. */
              className="flex-1 rounded-xl px-2.5 py-2.5 text-left active:scale-[0.98] transition-transform"
              style={{
                background: CARTE,
                border: actif ? `2px solid ${vert}` : `1px solid ${bordure}`,
                opacity: actif ? 1 : 0.62,
              }}
            >
              <span className="flex items-center gap-1.5">
                <span style={{ fontSize: 15 }}>{NOMS_RECEPTION[m].emoji}</span>
                <span style={{ fontFamily: TITRE, fontSize: 13.5, color: texte, letterSpacing: ".2px" }}>
                  {NOMS_RECEPTION[m].court.toUpperCase()}
                </span>
                {actif && <Check size={13} color={vert} style={{ marginLeft: "auto" }} />}
              </span>
              <span
                className="block text-[10.5px] mt-1"
                style={{ color: actif ? vert : texteDoux, fontFamily: CORPS, lineHeight: 1.4 }}
              >
                {m === "main" && RECEPTION_LIEU ? RECEPTION_LIEU : ditLesFrais(sousTotal, m) || "à convenir"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Copie déclenchée par le clic lui-même : la navigation continue normalement.
export function copierAvantDePartir(texte) {
  try {
    if (navigator.clipboard) navigator.clipboard.writeText(texte).catch(() => {});
  } catch (e) {}
}

/* ─────────────────────────── LECTURE DES VIDÉOS ───────────────────────────
   Une vidéo qui ne se charge pas ne doit pas laisser un rectangle noir muet :
   dans neuf cas sur dix le fichier n'a simplement pas été déposé dans
   public/videos, et personne ne peut le deviner. Le lecteur le dit. */
export function Video({
  source, nom, className, style,
  muet = false, boucle = false, auto = true, controles = true, secours = null,
}) {
  const [erreur, setErreur] = useState(false);
  const lecteur = useRef(null);

  /* ★ POURQUOI « MUET » EST POSÉ À LA MAIN
     Aucun navigateur ne lance tout seul une vidéo qui a du son : c'est une
     règle, pas un réglage, et elle protège le visiteur. Muette, la même vidéo
     démarre partout sans rien demander — et le son reste à un doigt, dans les
     commandes du lecteur. Or React n'applique pas toujours l'attribut avant que
     le navigateur ne prenne sa décision : on le pose donc nous-mêmes sur le
     lecteur, juste avant de demander la lecture. */
  useEffect(() => {
    const v = lecteur.current;
    if (!v) return;
    v.muted = muet;
    if (auto) {
      const lecture = v.play();
      if (lecture && lecture.catch) lecture.catch(() => {});
    }
  }, [source, muet, auto]);

  // Une vignette a son propre dessin de secours : elle ne doit pas se changer
  // en pavé d'explications au milieu d'une grille.
  if (erreur && secours) return secours;
  if (erreur) {
    return (
      <div
        className={"rounded-xl p-5 text-center " + (className || "")}
        style={{ background: CARTE, border: `1px solid ${bordure}`, maxWidth: 380, ...style }}
      >
        <p style={{ fontFamily: TITRE, fontSize: 17, color: texte }}>VIDÉO INDISPONIBLE</p>
        <p className="text-[12.5px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.55 }}>
          Le fichier <b style={{ color: texte, wordBreak: "break-all" }}>{source}</b> n'a pas pu être lu.
        </p>
        <p className="text-[11.5px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.5 }}>
          Vérifie qu'il se trouve bien dans <b style={{ color: texte }}>public/videos</b>, au format
          <b style={{ color: texte }}> MP4</b>, et que son nom s'écrit exactement pareil — sans accent ni espace.
        </p>
      </div>
    );
  }

  return (
    <video
      ref={lecteur}
      src={source}
      controls={controles}
      autoPlay={auto}
      loop={boucle}
      muted={muet}
      playsInline
      preload={auto ? "auto" : "metadata"}
      onError={() => setErreur(true)}
      title={nom}
      className={className}
      style={controles ? style : { ...style, pointerEvents: "none" }}
      onClick={controles ? (e) => e.stopPropagation() : undefined}
    />
  );
}

/* ───────────── UNE VIDÉO SE MONTRE, ELLE NE S'ANNONCE PAS ─────────────
   Une vidéo de produit se cachait derrière un bouton « VOIR LA VIDÉO » : il
   fallait un geste de plus pour voir ce que le vendeur avait filmé, et sur une
   fiche sans photo il ne restait qu'un dessin de remplacement à la place de
   l'article. La vidéo s'affiche donc à même la page, dans son cadre, et part
   toute seule, en boucle, comme une vitrine.

   Muette au départ : c'est la condition pour qu'un navigateur accepte de la
   lancer sans qu'on le lui demande. Le son s'allume d'un doigt.

   Ce cadre vit ici, dans le tronc commun, parce que TOUS les types de boutique
   en ont besoin — la fiche partagée comme le carrousel des marques. */
export function CadreVideo({ produit, couleur, onPleinEcran }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ border: `2px solid ${couleur || bordure}`, boxShadow: couleur ? `0 0 24px ${couleur}33` : "none", background: "#000" }}
    >
      <Video
        source={produit.video}
        nom={produit.nom}
        muet
        boucle
        className="w-full block"
        style={{ display: "block", width: "100%", maxHeight: "72vh" }}
      />
      {onPleinEcran && (
        <button
          onClick={() => onPleinEcran(produit)}
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ background: "#000000AA", color: texte, border: `1px solid ${bordure}` }}
        >
          <Maximize2 size={12} /> Plein écran
        </button>
      )}
      {!produit.dispo && (
        <span className="absolute top-3 left-3"><Etiquette couleur="#888">Épuisé</Etiquette></span>
      )}
    </div>
  );
}

/* ─────────────────────────── petits éléments ─────────────────────────── */

export function Etiquette({ children, couleur = vert }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded"
      style={{ background: couleur, color: ENCRE(couleur), fontFamily: CORPS }}
    >
      {children}
    </span>
  );
}

/* LE PRIX, ET CE QU'IL ÉTAIT AVANT.

   Une promotion ne vaut que si l'on voit ce qu'elle fait gagner. « 15 € » ne
   dit rien ; « 20 € barré, 15 € » dit tout, et sans une phrase.

   Trois choses, dans cet ordre de lecture : l'ancien prix barré et discret,
   le nouveau en grand et en couleur, la pastille « −25 % » pour que l'œil
   l'attrape de loin dans une grille.

   `avant` et `remise` sont facultatifs : sans eux, le prix s'affiche
   exactement comme avant cette option. */
export function Prix({ valeur, avant, remise, taille = 18 }) {
  const enPromotion = Number(remise) > 0 && Number(avant) > Number(valeur);

  const leChiffre = (
    <span
      style={{
        fontFamily: TITRE, fontSize: taille, letterSpacing: ".5px",
        backgroundImage: `linear-gradient(90deg, ${jaune}, ${vert})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        // Sans ça, « 60,00 € » se coupe entre le nombre et le symbole dès que
        // la place manque, et la carte affiche « 60,00 » puis « € » dessous.
        whiteSpace: "nowrap",
      }}
    >
      {euros(valeur)}
    </span>
  );

  if (!enPromotion) return leChiffre;

  /* TROIS MORCEAUX DANS UNE VIGNETTE DE 146 PIXELS.
     ───────────────────────────────────────────────
     Sur un téléphone, la grille montre deux produits par ligne : le prix
     dispose d'une largeur de carte, pas davantage. Les trois morceaux mis
     bout à bout la dépassaient, et le navigateur coupait où il pouvait —
     c'est-à-dire en plein milieu d'un prix.

     La ligne a donc le droit de passer à la ligne, mais jamais à l'intérieur
     d'un nombre : chaque morceau reste entier, et s'il doit descendre, il
     descend en entier. */
  return (
    <span
      className="inline-flex items-baseline flex-wrap"
      style={{ columnGap: Math.max(4, taille * 0.24), rowGap: 2 }}
    >
      <span
        style={{
          fontFamily: CORPS,
          fontSize: Math.max(10, taille * 0.58),
          color: texteDoux,
          textDecoration: "line-through",
          // Un trait fin se perd sur un fond sombre : on l'épaissit, sinon le
          // client croit lire deux prix côte à côte.
          textDecorationThickness: 2,
          whiteSpace: "nowrap",
        }}
      >
        {euros(avant)}
      </span>
      {leChiffre}
      <span
        style={{
          fontFamily: CORPS, fontSize: Math.max(9, taille * 0.42), fontWeight: 800,
          color: ENCRE(rose), background: rose,
          borderRadius: 5, padding: "1px 4px", letterSpacing: 0,
          whiteSpace: "nowrap",
        }}
      >
        −{remise}%
      </span>
    </span>
  );
}

// Grande barre rose en haut de chaque écran : retour + nom de la section.
export function BarreSection({ titre, onRetour }) {
  return (
    <div
      className="mx-3 mt-3 rounded-2xl px-3 py-3 flex items-center gap-2"
      style={{ backgroundImage: DEGRADE, boxShadow: `0 6px 22px ${rose}44` }}
    >
      {onRetour ? (
        <button onClick={onRetour} aria-label="Revenir en arrière" className="active:scale-90 transition-transform">
          <ChevronLeft size={22} color={ENCRE_DEGRADE} />
        </button>
      ) : (
        <span className="w-[22px]" />
      )}
      <p className="flex-1 text-right pr-1" style={{ fontFamily: TITRE, fontSize: 17, color: ENCRE_DEGRADE, letterSpacing: ".5px" }}>
        {titre}
      </p>
    </div>
  );
}

/* ─────────────────────────── écrans ─────────────────────────── */

// « vedettesSeules » sert à la présentation en liste : elle réutilise le haut
// de l'accueil — les carrés en vedette — puis affiche sa propre grille.

/* ══════════ REMONTER EN HAUT ══════════
   Une famille de cent articles fait une page très longue. Arrivé en bas, il
   faut pouvoir revenir d'un geste : sans ça, on fait défiler à l'envers pendant
   dix secondes, ou on abandonne.

   Le bouton n'apparaît qu'une fois qu'on a vraiment descendu — plus tôt, il ne
   servirait qu'à encombrer. Il se place au-dessus de la barre du bas, du côté
   du pouce. */
// ★ Pas d'écoute du défilement, volontairement.
// Une première version n'affichait le bouton qu'une fois descendu. Elle
// dépendait des événements de défilement — et il existe des navigateurs qui
// n'en émettent aucun alors que la page défile pour de bon. Le bouton restait
// alors introuvable, sans qu'on comprenne pourquoi.
//
// La condition est donc devenue une donnée, pas un événement : on affiche le
// bouton quand la liste est longue. C'est vérifiable, ça ne dépend d'aucun
// navigateur, et ça répond à la vraie question — « cette page est-elle longue
// au point qu'on veuille en remonter ? »
export function RemonterEnHaut({ articles = 0, seuil = 12 }) {
  if (articles < seuil) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Revenir en haut de la page"
      className="fixed z-40 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        right: 14, bottom: 92, width: 46, height: 46,
        background: VOILE("#141018", "E6"), border: `1.5px solid ${jaune}`,
        boxShadow: `0 6px 20px #000000AA`, color: jaune,
        fontFamily: CORPS, fontSize: 19, lineHeight: 1,
      }}
    >
      ↑
    </button>
  );
}

/* ══════════ LES AVIS, EN IMAGES ══════════
   Un avis recopié à la main ne prouve rien : n'importe qui peut écrire
   « super vendeur ». Une capture d'écran de la conversation, elle, se voit.
   C'est pourquoi les avis sont des IMAGES, montrées telles quelles — jamais
   recadrées, jamais retouchées.

   Elles défilent en carrousel : une à l'écran, on glisse pour la suivante. Une
   capture de conversation est haute et étroite ; on la laisse donc entière dans
   sa hauteur, quitte à ce qu'elle ne remplisse pas la largeur.

   Un appui l'ouvre en grand : sur un téléphone, le texte d'une conversation
   réduite à la largeur d'une carte est illisible. */
export const AVIS = Array.isArray(BOUTIQUE.avis)
  ? BOUTIQUE.avis.filter((a) => (a.image || "").trim())
  : [];

/* ══════════ LA GALERIE D'UN PRODUIT — UNE SEULE, POUR TOUTE LA BOUTIQUE ══════════

   La grande photo, et les autres vues en vignettes à côté. Un doigt sur une
   vignette la met en grand.

       « le système des photos des produits doit être le même sur toutes les
         catégories et marques ; ça doit rester comme ça pour cette boutique,
         qui servira de référence pour une vitrine luxe plus tard »

   🚨 ELLE VIT DANS LE TRONC COMMUN, ET C'EST TOUT L'ENJEU.

   Il y en avait DEUX, et elles ne se ressemblaient pas. Sur la fiche d'un
   produit : une grande photo qui ouvrait une visionneuse, et des vignettes
   dessous, en rangée, rognées au carré. Dans le carrousel par marques : une
   grande photo avec deux flèches, et des vignettes à côté, entières. Le même
   produit se regardait donc de deux façons selon la porte par laquelle on
   était entré.

   Recopier le bloc dans les deux écrans aurait été plus rapide à écrire, et la
   garantie qu'un jour l'un des deux serait corrigé et pas l'autre. Il n'y en a
   donc plus qu'un, ici, et `outils/verifier-galerie.mjs` refuse la fabrication
   si un écran se remet à dessiner le sien.

   Ce qui reste réglable est ce qui DOIT l'être, et rien de plus :
     aspect        un cadre de forme fixe (le plein écran d'une marque), ou la
                   photo qui se dimensionne elle-même (la fiche produit) ;
     onPleinEcran  si on le donne, la grande photo s'ouvre en visionneuse ;
     cadre         la couleur du liseré, pour les écrans qui soulignent la
                   famille.

   Les vignettes gardent la photo ENTIÈRE. Rognées au carré — ce que faisait la
   fiche produit — elles montraient un bout d'épaule sur un vêtement en
   hauteur, et on ne savait pas ce qu'on choisissait. */
/* « pastille » est arrivée avec la N°21 : la galerie ne change de
   comportement que là où on le lui demande.

   🚨 « noirEtBlanc » A ÉTÉ RETIRÉ LE 22 OCTOBRE 2026. Il passait la photo
   d'un article qui revient en noir et blanc. Son mot : « un client qui ne
   les a jamais vus pourrait croire que leur couleur d'origine est noir et
   blanc ». C'était vrai, et ça coûtait des ventes dans le seul rayon où la
   photo est la seule information. */
export function GaleriePhotos({ produit, famille, aspect = null, onPleinEcran = null, cadre = null, pastille = null }) {
  const [j, setJ] = useState(0);
  const doigtX = useRef(null);

  const secours = SECOURS(produit, famille);
  const vraies = GALERIE(produit);
  /* Sans photo déposée, le dessin de secours en tient lieu : la galerie n'est
     jamais un cadre vide, et les flèches n'ont jamais à tourner dans du vide. */
  const galerie = vraies.length ? vraies : [secours];
  const np = galerie.length;

  /* Changer de produit sans remettre la galerie à zéro afficherait la 4ᵉ photo
     d'un article qui n'en a que deux. */
  useEffect(() => { setJ(0); }, [produit.ref, produit.nom]);

  const photo = galerie[Math.min(j, np - 1)];
  const suivant = () => setJ((k) => (k + 1) % np);
  const precedent = () => setJ((k) => (k - 1 + np) % np);

  const boite = aspect
    ? { aspectRatio: aspect, background: CLAIR ? fondCarte : "#08080A",
        border: `1px solid ${cadre || bordure}` }
    : { border: `2px solid ${cadre || bordure}`,
        boxShadow: cadre ? `0 0 24px ${cadre}33` : "none" };

  const grande = (
    <div
      className={"relative flex-1 min-w-0 rounded-2xl overflow-hidden" + (onPleinEcran ? " cursor-pointer" : "")}
      style={boite}
      onClick={onPleinEcran ? () => onPleinEcran(produit, j) : undefined}
      /* Le glissement du doigt : le geste que tout le monde essaie d'abord sur
         une photo, bien avant de chercher une flèche. */
      onTouchStart={(e) => { doigtX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (doigtX.current === null || np < 2) return;
        const d = e.changedTouches[0].clientX - doigtX.current;
        if (Math.abs(d) > 40) (d < 0 ? suivant : precedent)();
        doigtX.current = null;
      }}
    >
      <Photo
        produit={produit}
        secours={secours}
        source={photo}
        alt={produit.nom}
        className={aspect ? "w-full h-full" : "w-full block"}
        style={aspect ? { width: "100%", height: "100%", objectFit: AJUSTEMENT(produit) } : undefined}
      />

      {np > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); precedent(); }}
            aria-label="Voir la photo précédente"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "#0C0C10D9", border: `1px solid ${bordure}` }}
          >
            <ChevronLeft size={20} color="#fff" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); suivant(); }}
            aria-label="Voir la photo suivante"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "#0C0C10D9", border: `1px solid ${bordure}` }}
          >
            <ChevronRight size={20} color="#fff" />
          </button>
          <span
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{ background: "#0C0C10E6", border: `1px solid ${bordure}`, color: "#D8D8D8", fontFamily: CORPS }}
          >
            {j + 1} / {np}
          </span>
        </>
      )}

      {onPleinEcran && (
        <span
          className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ background: "#0C0C10E6", color: "#fff", border: `1px solid ${bordure}` }}
        >
          <Maximize2 size={12} /> Agrandir
        </span>
      )}

      {/* ⚠️ ET LE BANDEAU SUR LA GRANDE PHOTO AUSSI : c'est le premier chose
          qu'on voit en ouvrant la fiche, avant même le nom. */}
      <BandeauEtat produit={produit} />

      {/* 🚨 LA PASTILLE D'UN ÉTAT REMPLACE « ÉPUISÉ », elle ne s'y ajoute pas.
          Les deux étaient vrais et se contredisaient : « épuisé » sous une
          pastille qui annonce un retour. Un seul repère, le plus précis. */}
      {pastille ? (
        <span
          className="absolute top-3 left-3 px-3 py-1.5 rounded-lg"
          style={{
            background: pastille.couleur, color: ENCRE(pastille.couleur),
            fontFamily: CORPS, fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em",
          }}
        >
          {pastille.texte}
        </span>
      ) : !produit.dispo && (
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: "#0C0C10E6", border: `1px solid ${bordure}`, color: "#D8D8D8", fontFamily: CORPS }}
        >
          ÉPUISÉ
        </span>
      )}
    </div>
  );

  /* Une seule photo : pas de colonne. Une vignette unique, qui montre
     exactement ce qu'on a déjà sous les yeux, ne servirait qu'à rétrécir la
     grande. */
  if (np < 2) return <div className="flex gap-2 items-stretch">{grande}</div>;

  return (
    <div className="flex gap-2 items-stretch">
      {grande}
      {/* « min-h-0 » n'est pas une précaution de style : sans lui, un élément de
          flex refuse de se tasser sous la taille de son contenu, la colonne
          pousse la rangée, et le défilement ne s'enclenche jamais. Au-delà de
          cinq ou six photos, elle sortirait de l'écran. */}
      <div
        className="flex flex-col gap-2 overflow-y-auto min-h-0 flex-shrink-0"
        style={{ width: 58, scrollbarWidth: "none" }}
      >
        {galerie.map((g, k) => (
          <button
            key={g + k}
            onClick={() => setJ(k)}
            aria-label={"Photo " + (k + 1) + " sur " + np}
            aria-current={k === j}
            className="rounded-xl overflow-hidden flex-shrink-0 active:scale-95 transition-transform"
            style={{
              width: 58, height: 58,
              background: CLAIR ? fondCarte : "#08080A",
              border: k === j ? `2px solid ${jaune}` : `1px solid ${bordure}`,
              opacity: k === j ? 1 : 0.72,
            }}
          >
            <img
              src={g}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.opacity = 0.15; }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Carrousel({ images }) {
  const [i, setI] = useState(0);
  const [plein, setPlein] = useState(false);
  const doigtX = useRef(null);

  const n = images.length;
  const suivante = () => setI((k) => (k + 1) % n);
  const precedente = () => setI((k) => (k - 1 + n) % n);

  // Une image retirée pendant qu'on la regardait ne doit pas laisser un cadre
  // vide : on revient sur la dernière existante.
  useEffect(() => { if (i >= n) setI(0); }, [n, i]);

  useEffect(() => {
    if (!plein) return;
    const touche = (e) => {
      if (e.key === "Escape") setPlein(false);
      else if (e.key === "ArrowRight" && n > 1) suivante();
      else if (e.key === "ArrowLeft" && n > 1) precedente();
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [plein, n]);

  const debutGlisse = (e) => { doigtX.current = e.touches[0].clientX; };
  const finGlisse = (e) => {
    if (doigtX.current === null || n < 2) return;
    const ecart = e.changedTouches[0].clientX - doigtX.current;
    if (Math.abs(ecart) > 45) (ecart < 0 ? suivante : precedente)();
    doigtX.current = null;
  };

  if (!n) return null;
  const courant = images[Math.min(i, n - 1)];

  const Fleche = ({ cote, onClick, children }) => (
    <button
      onClick={onClick}
      aria-label={cote === "g" ? "Avis précédent" : "Avis suivant"}
      className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        [cote === "g" ? "left" : "right"]: 8,
        background: "#0C0C10D9", border: `1px solid ${bordure}`, color: texte,
      }}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
        <div className="relative" onTouchStart={debutGlisse} onTouchEnd={finGlisse}>
          <button
            onClick={() => setPlein(true)}
            className="block w-full"
            style={{ background: "#08080C", lineHeight: 0 }}
            aria-label="Voir cet avis en grand"
          >
            <img
              src={courant.image}
              alt={courant.legende || "Avis d'un client"}
              className="w-full object-contain"
              style={{ maxHeight: "62vh" }}
            />
          </button>

          {n > 1 && (
            <>
              <Fleche cote="g" onClick={precedente}><ChevronLeft size={18} /></Fleche>
              <Fleche cote="d" onClick={suivante}><ChevronRight size={18} /></Fleche>
              <span
                className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[11px] font-bold"
                style={{ background: "#0C0C10D9", color: texteDoux, border: `1px solid ${bordure}`, fontFamily: CORPS }}
              >
                {i + 1} / {n}
              </span>
            </>
          )}

          <span
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#0C0C10D9", border: `1px solid ${bordure}`, color: texteDoux }}
          >
            <Maximize2 size={14} />
          </span>
        </div>

        {courant.legende ? (
          <p className="px-3 py-2.5 text-[12.5px]" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.5 }}>
            {courant.legende}
          </p>
        ) : null}
      </div>

      {/* Les pastilles : elles disent combien il y en a, et où l'on en est. */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
          {images.map((a, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Avis ${k + 1}`}
              className="rounded-full transition-all"
              style={{
                width: k === i ? 22 : 7, height: 7,
                background: k === i ? jaune : bordure,
              }}
            />
          ))}
        </div>
      )}

      {plein && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,.97)" }}>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
            <p className="flex-1 truncate" style={{ fontFamily: TITRE, fontSize: 17, color: texte }}>
              AVIS {i + 1} / {n}
            </p>
            <button
              onClick={() => setPlein(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#1A1A1ACC", border: `1px solid ${bordure}` }}
              aria-label="Fermer"
            >
              <X size={17} color={texte} />
            </button>
          </div>
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-3"
            onTouchStart={debutGlisse} onTouchEnd={finGlisse}>
            <img src={courant.image} alt={courant.legende || "Avis d'un client"}
              className="max-w-full max-h-full object-contain rounded-xl" />
            {n > 1 && (
              <>
                <Fleche cote="g" onClick={precedente}><ChevronLeft size={18} /></Fleche>
                <Fleche cote="d" onClick={suivante}><ChevronRight size={18} /></Fleche>
              </>
            )}
          </div>
          {courant.legende ? (
            <p className="px-4 pb-4 pt-2 text-center text-[13px] flex-shrink-0"
              style={{ color: texteDoux, fontFamily: CORPS }}>
              {courant.legende}
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}

/* ══════════ TROUVER SA TAILLE ══════════

       « si une personne fait 1m60 pour 50 kilos, on lui dit quelle taille
         serait la plus adaptée — une petite application dans le site qui aide
         les futurs clients »
       « femme et homme, mais on peut décider lequel activer »
       « les tailles sont souvent écrites en numéros pour les tenues femme :
         c'est bien de dire à quoi ça correspond, un 38 c'est du L ou du S »

   🚨 TROIS PIÈGES, ET AUCUN N'EST DANS LE CALCUL.

   ① LES CHAUSSURES. Demander son poids à quelqu'un pour deviner une pointure
     serait absurde, et ferait douter de tout le reste de la page. L'aide ne
     paraît donc que si les tailles sont des tailles de VÊTEMENT — lettres ou
     numéros français — et jamais sur « 38 · 38,5 · 39 », qui sont des demi-
     pointures.

   ② HOMME ET FEMME NE PARTAGENT PAS UN BARÈME. À taille et poids égaux, un
     homme porte plus de muscle et moins de gras. Un barème unique
     conseillerait du L à un homme mince et du S à une femme ronde.

   ③ LES DEUX ÉCRITURES. Une même boutique peut écrire « S · M · L » sur un
     pull et « 36 · 38 · 40 » sur une robe. L'aide travaille donc sur un RANG,
     pas sur un texte : elle reconnaît les deux, répond dans l'écriture de la
     pièce, et donne l'autre entre parenthèses — « la M (38) ».

   COMMENT ELLE DÉCIDE
   Le rapport poids / taille², qui approche le mieux la corpulence à partir des
   deux seules choses que les gens connaissent d'eux. Vérifié sur des cas
   connus :

       femme  1m60 / 50 kg  →  19,5  →  S   (36)
       femme  1m70 / 62 kg  →  21,5  →  M   (38)
       homme  1m80 / 75 kg  →  23,1  →  M   (48)
       homme  1m75 / 65 kg  →  21,2  →  S   (46)

   Et elle nomme TOUJOURS la taille voisine quand on est près d'une borne. Une
   femme d'1m72 pour 58 kg est à deux kilos de la taille au-dessus : lui donner
   une seule lettre, c'est l'envoyer commander la mauvaise, et un vêtement
   renvoyé coûte plus cher qu'un conseil nuancé.

   ⚠️ CE N'EST QU'UNE INDICATION, et la page le dit. Deux personnes de même
   taille et même poids n'ont pas la même carrure. C'est un point de départ
   pour qui n'ose pas demander — pas une mesure. */

/* Le rang est le langage commun : 0 = XS, 4 = XL. Tout y est ramené. */
const RANGS = ["XS", "S", "M", "L", "XL"];

const BAREMES = {
  femme: {
    bornes: [18, 20.5, 23, 26],
    numeros: ["34", "36", "38", "40", "42"],
    /* Le tour de taille des jeans et pantalons, en pouces. */
    pouces: ["24", "26", "28", "30", "32"],
  },
  homme: {
    bornes: [20, 22, 24.5, 27],
    numeros: ["44", "46", "48", "50", "52"],
    pouces: ["28", "30", "32", "34", "36"],
  },
};

/* Pour qui ce conseil est donné — « femme », « homme », ou rien. Une boutique
   qui ne vend pas de vêtements n'a aucune raison de demander un poids. */
export const AIDE_TAILLE =
  (BOUTIQUE.aideTaille === "femme" || BOUTIQUE.aideTaille === "homme") ? BOUTIQUE.aideTaille : "";

/* Le rang d'une taille écrite par le vendeur, dans l'une ou l'autre écriture.
   « null » veut dire : je ne sais pas lire ça, et je me tais. */
export function rangDeTaille(brut, pour = AIDE_TAILLE) {
  const t = String(brut || "").trim().toUpperCase().replace(/\s/g, "");
  const parLettre = RANGS.indexOf(t);
  if (parLettre >= 0) return parLettre;
  const bareme = BAREMES[pour];
  if (!bareme) return null;
  const parNumero = bareme.numeros.indexOf(t);
  if (parNumero >= 0) return parNumero;
  const parPouce = bareme.pouces.indexOf(t);
  return parPouce >= 0 ? parPouce : null;
}

/* Une liste de tailles est-elle une liste de tailles de VÊTEMENT ? Il faut que
   toutes soient lisibles, et qu'il y en ait plus d'une — une pièce unique n'a
   rien à conseiller. */
export const TAILLES_DE_VETEMENT = (liste, pour = AIDE_TAILLE) =>
  liste.length > 1 && liste.every((t) => rangDeTaille(t, pour) !== null);

export function conseilDeTaille(cm, kg, pour = AIDE_TAILLE) {
  const bareme = BAREMES[pour];
  if (!bareme) return null;
  const m = Number(cm) / 100;
  const p = Number(kg);
  if (!(m > 1.2 && m < 2.2) || !(p > 30 && p < 200)) return null;

  const indice = p / (m * m);
  const { bornes } = bareme;
  let rang = bornes.findIndex((max) => indice < max);
  if (rang < 0) rang = bornes.length;

  /* La voisine : à moins d'un cinquième d'une borne, on la nomme. */
  const bas = rang === 0 ? bornes[0] - 3 : bornes[rang - 1];
  const haut = rang === bornes.length ? bas + 6 : bornes[rang];
  const place = (indice - bas) / (haut - bas);
  let voisin = null;
  if (place < 0.2 && rang > 0) voisin = rang - 1;
  else if (place > 0.8 && rang < RANGS.length - 1) voisin = rang + 1;

  return { rang, voisin, indice: Math.round(indice * 10) / 10 };
}

/* « la M (38) » : on écrit d'abord ce que la pièce affiche, l'autre écriture
   entre parenthèses. C'est la question qu'il a posée — à quoi correspond un
   38 — et elle se pose dans les deux sens. */
function nommer(tailleAffichee, rang, pour) {
  const t = String(tailleAffichee).trim().toUpperCase().replace(/\s/g, "");
  /* Ce qu'on met entre parenthèses est l'écriture que la pièce N'UTILISE PAS :
     une lettre à côté d'un chiffre, un chiffre à côté d'une lettre. Répéter la
     même écriture — « la 28 (28) » — n'apprendrait rien à personne. */
  const autre = RANGS.indexOf(t) >= 0 ? (BAREMES[pour] || {}).numeros?.[rang] : RANGS[rang];
  return autre ? `${tailleAffichee} (${autre})` : String(tailleAffichee);
}

/* Un pantalon se reconnaît à son nom. C'est fragile, et c'est volontairement
   le seul usage qu'on en fait : si la devinette rate, il manque une phrase de
   prudence — rien de plus. */
const EST_UN_BAS = (nom) =>
  /pantalon|jean|short|jupe|legging|bermuda|chino|cargo/i.test(String(nom || ""));

function TrouverSaTaille({ tailles, epuisees, onChoisir, nomProduit = "" }) {
  const [ouvert, setOuvert] = useState(false);
  const [cm, setCm] = useState("");
  const [kg, setKg] = useState("");

  if (!AIDE_TAILLE || !TAILLES_DE_VETEMENT(tailles)) return null;
  const unBas = EST_UN_BAS(nomProduit);

  const r = (cm && kg) ? conseilDeTaille(cm, kg) : null;

  /* On ne conseille QUE des tailles que cette pièce propose. Envoyer vers un L
     sur un vêtement qui s'arrête à M serait pire que ne rien dire. */
  const auRang = (n) => tailles.find((t) => rangDeTaille(t) === n) || null;
  const choisie = r ? auRang(r.rang) : null;
  const voisine = r && r.voisin !== null ? auRang(r.voisin) : null;
  const partie = choisie && epuisees.has(choisie);

  const champ = {
    width: "100%", background: VOILE(fond, "CC"), border: `1px solid ${bordure}`,
    borderRadius: 10, padding: "9px 10px", color: texte, fontFamily: CORPS, fontSize: 15,
  };

  return (
    <div className="mt-3">
      {!ouvert ? (
        <button
          onClick={() => setOuvert(true)}
          className="active:scale-95 transition-transform"
          style={{ ...ETIQUETTE, fontSize: 10, color: texte, borderBottom: TRAIT_OR, paddingBottom: 3 }}
        >
          Trouver ma taille
        </button>
      ) : (
        <div className="rounded-2xl p-3" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <div className="flex items-end gap-2">
            <label className="flex-1 min-w-0">
              <span className="block mb-1" style={{ ...ETIQUETTE, fontSize: 9, color: texteDoux }}>Taille (cm)</span>
              <input type="number" inputMode="numeric" value={cm} placeholder="160"
                onChange={(e) => setCm(e.target.value)} style={champ} />
            </label>
            <label className="flex-1 min-w-0">
              <span className="block mb-1" style={{ ...ETIQUETTE, fontSize: 9, color: texteDoux }}>Poids (kg)</span>
              <input type="number" inputMode="numeric" value={kg} placeholder="50"
                onChange={(e) => setKg(e.target.value)} style={champ} />
            </label>
          </div>

          {r && choisie && (
            <div className="mt-3">
              <p style={{ fontFamily: CORPS, fontSize: 13.5, color: texte, lineHeight: 1.5 }}>
                La <strong style={{ fontWeight: 500 }}>{nommer(choisie, r.rang, AIDE_TAILLE)}</strong> devrait t'aller
                {voisine ? <> — ou la {nommer(voisine, r.voisin, AIDE_TAILLE)} si tu la préfères {r.voisin > r.rang ? "plus ample" : "plus près du corps"}</> : null}.
              </p>
              {partie ? (
                <p className="mt-1" style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}>
                  Elle est épuisée sur cette pièce.
                </p>
              ) : (
                <button
                  onClick={() => { onChoisir(choisie); setOuvert(false); }}
                  className="mt-2 px-3.5 py-2 rounded-xl active:scale-95 transition-transform"
                  style={{ background: texte, color: fond, fontFamily: CORPS, fontSize: 13, fontWeight: 500 }}
                >
                  Choisir la {choisie}
                </button>
              )}
            </div>
          )}

          {r && !choisie && (
            <p className="mt-3" style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux, lineHeight: 1.5 }}>
              Cette pièce ne se fait pas dans la taille qui t'irait.
            </p>
          )}

          {(cm || kg) && !r && (
            <p className="mt-3" style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux }}>
              Indique ta taille en centimètres et ton poids en kilos.
            </p>
          )}

          <p className="mt-3" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.5 }}>
            C'est une indication : deux personnes de la même taille et du même poids
            n'ont pas la même carrure. En cas de doute, demande-nous.
            {unBas && (
              <> Et sur un bas, ce calcul ne donne que le tour de taille — la longueur
              de jambe dépend de ta taille, pas de ta corpulence. Demande-la-nous.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}


/* ══════════ CHOISIR SA TAILLE, SA COULEUR, ET COMMANDER ══════════

   Ce bloc vit dans le tronc commun parce que DEUX écrans s'en servent : la
   fiche d'un produit, et le carrousel des boutiques par marques. Le recopier
   dans les deux aurait été plus rapide à écrire, et la garantie qu'un jour
   l'un des deux serait corrigé et pas l'autre.

   Trois règles y sont tenues :

     • RIEN N'EST PRÉSÉLECTIONNÉ. Choisir une pointure à la place du client,
       c'est lui vendre une paire qu'il n'a pas demandée.

     • UNE POINTURE EN RUPTURE RESTE VISIBLE, barrée. La masquer ferait croire
       au client que le modèle ne se fait pas dans sa taille, et il partirait.
       Barrée, il sait que c'est son modèle mais pas aujourd'hui, et il revient.

     • SANS MOYEN DE COMMANDER, AUCUN BOUTON. Le prix et la fiche restent :
       la boutique devient une vitrine, pas une boutique en panne. */
/* ══════════ L'OR ET L'ARGENT (N°21) ══════════

   « Les couleurs s'adaptent au style de chaque boutique. Le doré et
   l'argent de Mapuche Arts sont l'exemple. » — 22 octobre 2026.

   🚨 L'OR VIENT DE LA BOUTIQUE, PAS D'UNE CONSTANTE. C'est la couleur de
   ses titres et de ses prix : sur Mapuche Arts elle est dorée, sur une
   boutique verte elle sera verte, et la nouveauté portera SES couleurs.

   ⚠️ L'ARGENT, LUI, N'EXISTE DANS AUCUNE PALETTE, et c'est voulu : l'argent
   EST la couleur de ce qui est en pause. Un article qui revient se montre en
   noir et blanc ; lui donner la couleur vive de la boutique dirait le
   contraire de ce qu'on veut dire. Deux valeurs seulement, l'une pour les
   boutiques sombres, l'autre pour les claires — mesurées pour se lire sur
   les deux fonds. */
export const OR_ETAT = COULEURS.jaune || COULEURS.rose;
export const ARGENT_ETAT = CLAIR ? "#6B7280" : "#C9CBD1";

/* 🚨 L'AMBRE DE L'ATTENTE — 22 octobre 2026.

   « On dirait presque maintenant que le produit bientôt disponible est déjà
   disponible si on ne fait pas attention. » C'était vrai : « ✨ NOUVEAU » et
   « ✨ BIENTÔT » portaient le MÊME doré, celui de la boutique. La couleur
   disait « c'est neuf » — elle ne disait pas « patiente ».

   ⚠️ IL EST FIXE, COMME L'ARGENT, et pour la même raison : l'attente est un
   SENS, pas une couleur de marque. L'ambre dit « pas encore » dans toutes
   les boutiques et dans toutes les langues ; le doré de la maison dit
   « regarde ». Les deux ne doivent pas se confondre. */
export const ATTENTE_ETAT = CLAIR ? "#B45309" : "#F5A524";

/* CE QU'UN ÉTAT DIT À L'ÉCRAN — un seul endroit pour tous les cas.

   Un seul objet par état, et tout le monde y puise : la pastille sur la
   photo, le badge d'une vignette, le filtre du rayon, la phrase de la fiche.
   Deux listes du même fait finissent toujours par ne plus être d'accord. */
/* 🚨 ET LE NOIR ET BLANC A DISPARU — 22 octobre 2026, sa décision.

   Son mot, et il est juste : « un client qui ne les a jamais vus et qui les
   découvre pour la première fois dans la catégorie de retour pourrait être
   refroidi, et croire que leur couleur d'origine est noir et blanc ».

   Le noir et blanc disait « en pause » à quelqu'un qui connaît déjà le
   produit. À celui qui le découvre, il disait « ce produit est gris ». Et
   c'est précisément dans le rayon des retours qu'on découvre des produits
   jamais vus : la photo y est la seule information.

   C'est donc la pastille, la date et l'absence de bouton qui portent le
   « en pause » — elles, elles ne mentent pas sur la marchandise. */
export const ETAT_LU = (p) => (
  p.etat === "retour"
    ? {
      court: "🔔 DE RETOUR",          // le badge d'une vignette, dans le rayon
      pastille: "🔔 Bientôt de retour", // la pastille posée sur la grande photo
      titre: "BIENTÔT DE RETOUR",
      quand: "De retour vers",
      phrase: "Victime de son succès ! On l'a recommandé, il revient très vite.",
      versLeRayon: "Voir tout ce qui revient",
      couleur: ARGENT_ETAT,
      /* ⚠️ CELUI-CI, LUI, EST VRAIMENT EN RUPTURE : il a été en vente, il est
         parti, il revient. Le mot est juste, et il dit au client qu'il existe
         pour de bon — ce qui donne envie d'attendre. */
      bandeau: "EN RUPTURE",
      auLieuDuPanier: "En rupture — il revient",
    }
    /* ⚠️ UNE NOUVEAUTÉ PAS ENCORE ARRIVÉE : on le dit, au lieu de laisser
       croire qu'elle est là. C'est exactement le défaut qu'il a vu. */
    : EST_UNE_NOUVEAUTE(p) && p.etat === "arrivage"
    ? {
      /* ⚠️ LA PASTILLE NE RÉPÈTE PLUS LE BANDEAU : elle dit ce que c'est
         (« une nouveauté »), le bandeau dit si ça s'achète (« bientôt en
         vente »). Deux fois « BIENTÔT » sur une tuile, c'était une de trop. */
      court: "✨ NOUVEAUTÉ",
      pastille: "✨ NOUVEAUTÉ · PAS ENCORE EN VENTE",
      titre: "NOUVEAUTÉ",
      quand: "Disponible",
      phrase: "Tout nouveau ! Il est en route, bientôt disponible.",
      versLeRayon: "Voir toutes les nouveautés",
      couleur: ATTENTE_ETAT,
      /* 🚨 LE BANDEAU, ET LES MOTS JUSTES. Un produit qui n'est JAMAIS arrivé
         n'est pas « en rupture » : il n'a jamais été là. Dire le contraire
         ferait croire qu'on l'a vendu, et donc qu'il existe quelque part. */
      bandeau: "BIENTÔT EN VENTE",
      auLieuDuPanier: "Pas encore en vente",
    }
    /* UNE NOUVEAUTÉ QUI EST LÀ, et c'est le cas le plus courant : elle
       s'achète, et rien ne doit le cacher. Ni phrase, ni bouton de rayon —
       juste le badge, et le panier reste. */
    : EST_UNE_NOUVEAUTE(p)
    ? {
      court: "✨ NOUVEAU",
      pastille: "✨ NOUVEAUTÉ",
      titre: "NOUVEAUTÉ",
      quand: "", phrase: "",
      versLeRayon: "Voir toutes les nouveautés",
      couleur: OR_ETAT,
      /* Celle-ci s'achète : aucun bandeau, et le panier reste. */
      bandeau: "", auLieuDuPanier: "",
    }
    /* Pas étiquetée nouveauté, mais annoncée : elle arrive, sans plus. */
    : p.etat === "arrivage"
    ? {
      court: "BIENTÔT",
      pastille: "PAS ENCORE EN VENTE",
      titre: "BIENTÔT DISPONIBLE",
      quand: "Disponible",
      phrase: "Il est en route. Encore un peu de patience.",
      versLeRayon: "",
      couleur: ATTENTE_ETAT,
      bandeau: "BIENTÔT EN VENTE",
      auLieuDuPanier: "Pas encore en vente",
    }
    : {
      court: "Épuisé", pastille: "", titre: "ÉPUISÉ", quand: "", phrase: "",
      versLeRayon: "", couleur: "",
      bandeau: "", auLieuDuPanier: "",
    }
);

/* ══════════ CE QU'ON POSE SUR UNE PHOTO (N°21) ══════════

   Deux repères, et ils vont ensemble : le badge en haut, la date en bas.
   Les mêmes dans une vignette de rayon et sur la grande photo d'une fiche —
   c'est ce qui fait qu'on relie les deux écrans.

   ⚠️ LA DATE NE PARAÎT QUE SI LE VENDEUR EN A ÉCRIT UNE. Pas de ligne vide,
   pas de « date non communiquée » : son silence est une réponse. */
export function BadgeEtat({ produit, petit = false }) {
  const e = ETAT_LU(produit);
  /* ⚠️ « nouveaute » COMPTE AUSSI : une nouveauté en vente n'a aucun état,
     et elle doit pourtant porter son badge. */
  if (!produit.etat && !EST_UNE_NOUVEAUTE(produit)) return null;
  return (
    <span
      className="absolute top-1.5 left-1.5 rounded-lg"
      style={{
        background: e.couleur, color: ENCRE(e.couleur), fontFamily: CORPS,
        fontSize: petit ? 8.5 : 10, fontWeight: 800, letterSpacing: ".08em",
        padding: petit ? "2px 5px" : "3px 7px", whiteSpace: "nowrap",
      }}
    >
      {e.court}
    </span>
  );
}

/* ══════════ LE BANDEAU QUI NE SE RATE PAS (22 octobre 2026) ══════════

   🚨 IL REMPLACE LA PETITE PASTILLE DE COIN pour tout ce qui ne s'achète
   pas. Son mot : « on dirait presque que le produit bientôt disponible est
   déjà disponible si on ne fait pas attention ».

   Pleine largeur, posé en bas de la photo, avec la date quand il y en a une.
   Un client qui parcourt une grille lit les bandeaux avant les badges.

   ⚠️ ET IL NE PARAÎT PAS SUR CE QUI S'ACHÈTE : une nouveauté en vente n'a
   rien à expliquer, elle a un bouton. */
export function BandeauEtat({ produit, petit = false }) {
  const e = ETAT_LU(produit);
  if (!e.bandeau) return null;
  const date = String(produit.dateEtat || "").trim();
  return (
    <span
      className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center"
      style={{
        background: e.couleur, color: ENCRE(e.couleur), fontFamily: CORPS,
        fontSize: petit ? 9.5 : 11, fontWeight: 800, letterSpacing: ".08em",
        padding: petit ? "4px 3px" : "6px 4px", textAlign: "center",
        /* ⚠️ « nowrap » SUR LE MOT, PAS SUR LE BLOC : « BIENTÔT EN / VENTE »
           coupé en deux se lisait mal. La date passe dessous. */
        lineHeight: 1.15,
      }}
    >
      <span style={{ whiteSpace: "nowrap" }}>{e.bandeau}</span>
      {date ? (
        <span style={{ fontWeight: 600, opacity: .85, whiteSpace: "nowrap" }}>
          {direLaDate(date)}
        </span>
      ) : null}
    </span>
  );
}

export function DateSurLaPhoto({ produit }) {
  if (!produit.etat || !String(produit.dateEtat || "").trim()) return null;
  /* ⚠️ LE BANDEAU LA PORTE DÉJÀ : deux fois la même date sur une vignette de
     170 px, c'est une de trop. Cette pastille ne sert plus que là où il n'y a
     pas de bandeau — c'est-à-dire nulle part aujourd'hui, et c'est très bien :
     le jour où un état s'achète ET porte une date, elle reprendra son rôle. */
  if (ETAT_LU(produit).bandeau) return null;
  const court = String(produit.dateEtat).trim();
  return (
    <span
      className="absolute bottom-1.5 right-1.5 rounded-lg px-1.5 py-0.5"
      style={{
        background: "#0C0C10E6", color: "#FFFFFF", fontFamily: CORPS,
        fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
        border: `1px solid ${ETAT_LU(produit).couleur}66`,
      }}
    >
      {produit.etat === "arrivage" ? "Dispo " + direLaDate(court) : court}
    </span>
  );
}

/* ══════════ LES DEUX PETITS RACCOURCIS (N°21) ══════════

   « Juste en dessous [de la carte des promotions], deux petits raccourcis
   côte à côte, affichés seulement s'il y a au moins un produit. »

   🚨 ET ILS SONT DANS LE TRONC COMMUN, PAS DANS UN TYPE. Sa demande dit
   « les mêmes raccourcis doivent exister dans TOUS les types d'accueil :
   familles, liste, luxe et marques. Aujourd'hui, seul le type familles a
   quelque chose. » Quatre copies auraient divergé au premier défaut corrigé
   d'un seul côté — c'est déjà arrivé ici, avec le bandeau d'annonce.

   ⚠️ UN SEUL RACCOURCI EST UN CAS NORMAL : une boutique peut n'avoir que des
   nouveautés. Il prend alors toute la largeur plutôt que la moitié, parce
   qu'une demi-ligne vide à côté ressemble à une panne. */
/* ⚠️ « className » PARCE QUE LES QUATRE ACCUEILS N'ONT PAS LES MÊMES
   MARGES : dans une colonne déjà en « px-3 », un « mx-3 » de plus décale
   les raccourcis de six pixels par rapport aux cartes du dessus. Six
   pixels, ça se voit. */
export function RaccourcisDEtat({ onFamille, className = "flex gap-2 mx-3 mt-2" }) {
  const quoi = [
    FAMILLE_ARRIVAGE && NB_ARRIVAGE > 0 && {
      f: FAMILLE_ARRIVAGE, emoji: "✨", nom: "NOUVEAUTÉS",
      /* ⚠️ « bientôt dispo » SEULEMENT SI AUCUNE N'EST ENCORE EN VENTE.
         Le dire sur un rayon où cinq s'achètent ferait fuir l'acheteur. */
      dit: NB_NOUVEAUTES_A_VENIR === NB_ARRIVAGE
        ? NB_ARRIVAGE + " bientôt dispo"
        : NB_ARRIVAGE + (NB_ARRIVAGE > 1 ? " produits" : " produit"),
      couleur: OR_ETAT,
    },
    FAMILLE_RETOUR && NB_RETOUR > 0 && {
      f: FAMILLE_RETOUR, emoji: "🔔", nom: "ILS REVIENNENT",
      dit: NB_RETOUR + (NB_RETOUR > 1 ? " produits" : " produit"),
      couleur: ARGENT_ETAT,
    },
  ].filter(Boolean);
  if (!quoi.length) return null;

  return (
    <div className={className}>
      {quoi.map((q) => (
        <button
          key={q.f.id}
          onClick={() => onFamille(q.f)}
          className="flex-1 min-w-0 flex items-center gap-2.5 rounded-xl px-3 text-left active:scale-[0.97] transition-transform"
          style={{
            minHeight: 48, background: CARTE,
            border: `1px solid ${q.couleur}59`,
          }}
        >
          <span style={{ fontSize: 19, lineHeight: 1 }}>{q.emoji}</span>
          <span className="flex-1 min-w-0">
            <span
              className="block truncate"
              style={{
                fontFamily: TITRE, fontSize: 12, fontWeight: 700,
                letterSpacing: ".06em", color: texte,
              }}
            >
              {q.nom}
            </span>
            <span
              className="block truncate"
              style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux }}
            >
              {q.dit}
            </span>
          </span>
          <span style={{ color: q.couleur, fontSize: 15, lineHeight: 1 }}>›</span>
        </button>
      ))}
    </div>
  );
}

/* Le petit badge doré posé sur la tuile d'une famille : « ✨ 6 nouveautés ».
   Il ne compte QUE les nouveautés : un rayon qui annonce à la fois des
   arrivées et des retours dirait deux choses d'un coup, et on ne saurait
   plus laquelle on vient chercher. Les retours, eux, se voient en entrant. */
export function BadgeNouveautes({ famille }) {
  const n = COMPTE_D_ETAT(famille, "nouveaute");
  if (!n) return null;
  return (
    <span
      className="absolute top-2 left-2 rounded-lg px-2 py-1"
      style={{
        background: OR_ETAT, color: ENCRE(OR_ETAT), fontFamily: CORPS,
        fontSize: 9.5, fontWeight: 800, letterSpacing: ".08em",
        whiteSpace: "nowrap",
      }}
    >
      ✨ {n} {n > 1 ? "NOUVEAUTÉS" : "NOUVEAUTÉ"}
    </span>
  );
}

/* ══════════ DIRE LA DATE SANS LA RÉÉCRIRE (N°21) ══════════

   🚨 « dateEtat » EST UN TEXTE LIBRE, ET ÇA NE CHANGE PAS. « 15 nov. »,
   « décembre », « dans deux semaines » : un vendeur qui ne sait pas ne doit
   pas inventer, et un champ date l'y obligerait. C'était la décision de la
   N°20 et elle tient.

   Mais ses maquettes disent « Disponible LE 3 décembre » et « DE RETOUR
   VERS le 15 novembre ». Coller « le » devant n'importe quoi donnerait
   « disponible le dans deux semaines ». On regarde donc ce que le vendeur a
   écrit, et on choisit le mot de liaison — ou pas de mot du tout.

     « 3 déc. »            → « le 3 déc. »
     « décembre »          → « en décembre »
     « dans deux semaines » → tel quel

   ⚠️ ON NE CORRIGE JAMAIS CE QU'IL A ÉCRIT. On ajoute un mot devant, ou
   rien. Son texte ressort entier, dans sa langue à lui. */
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
  "août", "septembre", "octobre", "novembre", "décembre",
  "janv", "févr", "fév", "avr", "juil", "sept", "oct", "nov", "déc"];

export function direLaDate(texte) {
  const t = String(texte || "").trim();
  if (!t) return "";
  /* Un chiffre d'abord : c'est un jour. « 3 déc. », « 15/11 », « 15 nov. » */
  if (/^\d/.test(t)) return "le " + t;
  /* Un mois seul : c'est une période. */
  const premier = t.toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüç]/g, "");
  if (MOIS.some((m) => premier === m || premier.startsWith(m))) return "en " + t;
  /* « dans deux semaines », « début mars », « après les fêtes » : tel quel. */
  return t;
}

/* ══════════ 🔔 ME PRÉVENIR (N°20) ══════════

   Un produit « bientôt de retour » ou « nouvel arrivage » ne s'achète pas.
   Sans ce bouton, le client lit « bientôt », n'a rien à faire, et part :
   l'annonce n'aurait servi à rien. Là, il ouvre la conversation avec le
   vendeur, nom du produit déjà écrit.

   🚨 IL DISPARAÎT S'IL N'Y A PERSONNE AU BOUT. Une vitrine sans numéro
   (PEUT_COMMANDER à false) n'a aucune conversation à ouvrir : un bouton qui
   mène à rien est pire qu'un bouton absent. Même règle que le panier.

   ⚠️ ET LE MESSAGE N'EST PRÉ-REMPLI QUE SUR WHATSAPP. Les autres
   messageries ne savent pas le faire (voir MESSAGERIES) : on ouvre alors
   la conversation nue, sans mentir sur ce qui s'y trouvera.

   ⚠️ 48 PIXELS DE HAUT, pas 44 : c'est le geste principal de cet écran,
   celui qui remplace « AJOUTER AU PANIER ». Règle du projet. */
/* 🚨 LE TROISIÈME CHEMIN VERS LA MESSAGERIE, ET IL EST NOMMÉ.

   La fabrication compte les appels à « MESSAGERIE.lien » et refuse d'en
   laisser paraître un de plus que prévu : c'est ce qui a rattrapé l'onglet
   Avis, dont le bouton livrait le numéro du vendeur même sur une vitrine.
   Ce contrôle a mordu ici, le 22 octobre 2026, dès la première fabrication.

   Il y a donc maintenant TROIS chemins, un par geste, chacun nommé :
     lienCommande  — le panier        (commun.jsx)
     lienDemande   — la location      (App-location.jsx)
     lienPrevenir  — « me prévenir »  (ici)

   Et comme les deux autres, celui-ci ne s'appelle que sous PEUT_COMMANDER :
   voir « BoutonPrevenir », juste en dessous, qui rend null sans cela.

   ⚠️ LE MESSAGE N'EST PRÉ-REMPLI QUE SUR WHATSAPP. Les autres messageries
   ne savent pas le faire (voir MESSAGERIES) : on ouvre la conversation nue
   plutôt que de promettre un message qui n'y serait pas. */
export function lienPrevenir(produit) {
  const quoi = produit.etat === "arrivage" ? "son arrivée" : "son retour";
  const message = "Bonjour ! Je suis intéressé(e) par « " + produit.nom
    + " ». Pouvez-vous me prévenir dès " + quoi + " ?";
  return MESSAGERIE.prerempli
    ? MESSAGERIE.lien(CONTACT, message)
    : MESSAGERIE.lien(CONTACT);
}

/* 🚨 ÉTEINT PAR DÉFAUT DEPUIS LA N°21, ET LE CODE RESTE ENTIER.

   Sa raison, écrite le 22 octobre 2026 : « je ne veux pas avoir à répondre
   à la main à chaque demande ». Le vrai « me prévenir » viendra par la
   chaîne Telegram de la boutique, dans une consigne à part.

   ⚠️ C'EST UN RÉGLAGE, PAS UNE SUPPRESSION. La place du bouton est gardée
   dans la fiche, le lien est toujours fabriqué par « lienPrevenir », et
   « prevenirActif: true » dans src/config.js le rallume sans rien réécrire.
   Une boutique ancienne n'a pas ce réglage : elle est donc éteinte, ce qui
   est exactement ce qu'on veut. */
export const PREVENIR_ACTIF = BOUTIQUE.prevenirActif === true;

export function BoutonPrevenir({ produit }) {
  if (!PREVENIR_ACTIF) return null;
  if (!PEUT_COMMANDER || !CONTACT) return null;
  const lien = lienPrevenir(produit);
  return (
    <a
      href={lien}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full mt-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      style={{
        minHeight: 48, background: MESSAGERIE.couleur, color: MESSAGERIE.encre,
        fontFamily: TITRE, fontSize: 15, letterSpacing: ".5px", fontWeight: 700,
      }}
    >
      🔔 ME PRÉVENIR
    </a>
  );
}

export function ChoixEtCommande({ produit, onAjouter, compact = false }) {
  const [qte, setQte] = useState(1);
  const [taille, setTaille] = useState("");
  const [couleur, setCouleur] = useState("");

  const tailles = CHOIX(produit.tailles);
  const teintes = CHOIX(produit.couleurs);
  const epuisees = new Set(CHOIX(produit.taillesEpuisees));

  // Changer de produit sans remettre les choix à zéro ferait partir un 42 pour
  // un modèle qui ne se fait qu'en 38.
  useEffect(() => { setTaille(""); setCouleur(""); setQte(1); }, [produit.ref, produit.nom]);
  useEffect(() => { if (taille && epuisees.has(taille)) setTaille(""); }, [taille, produit.taillesEpuisees]);

  const manque = (tailles.length && !taille) || (teintes.length && !couleur);

  return (
    <>
      {(tailles.length > 0 || teintes.length > 0) && (
        <div className={compact ? "" : "mt-5"}>
          {tailles.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: texteDoux, fontFamily: CORPS }}>
                Choisir la taille
              </p>
              <div className="grid grid-cols-3 gap-2">
                {tailles.map((t) => {
                  const partie = epuisees.has(t);
                  return (
                    <button
                      key={t}
                      onClick={() => { if (!partie) setTaille(taille === t ? "" : t); }}
                      disabled={partie}
                      aria-label={partie ? t + " — épuisée" : t}
                      className="py-2.5 rounded-xl text-[14px] transition-transform"
                      style={{
                        background: taille === t ? texte : CARTE,
                        color: partie ? texteDoux : taille === t ? fond : texte,
                        border: `1px solid ${taille === t ? texte : bordure}`,
                        fontFamily: CORPS, fontWeight: taille === t ? 700 : 500,
                        textDecoration: partie ? "line-through" : "none",
                        opacity: partie ? 0.5 : 1,
                        cursor: partie ? "default" : "pointer",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {/* L aide a la taille, juste sous les boutons : c est la qu on hesite. */}
              <TrouverSaTaille tailles={tailles} epuisees={epuisees} onChoisir={setTaille}
                nomProduit={produit.nom} />
            </>
          )}

          {teintes.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-wider mb-2"
                style={{ color: texteDoux, fontFamily: CORPS, marginTop: tailles.length ? 16 : 0 }}>
                Choisir la couleur
              </p>
              <div className="flex flex-wrap gap-2">
                {teintes.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCouleur(couleur === c ? "" : c)}
                    className="px-4 py-2.5 rounded-xl text-[14px] active:scale-95 transition-transform"
                    style={{
                      background: couleur === c ? texte : CARTE,
                      color: couleur === c ? fond : texte,
                      border: `1px solid ${couleur === c ? texte : bordure}`,
                      fontFamily: CORPS, fontWeight: couleur === c ? 700 : 500,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-5 rounded-2xl p-4" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: texteDoux, fontFamily: CORPS }}>Prix</p>
            <Prix valeur={produit.prix} avant={produit.prixInitial} remise={produit.remise} taille={32} />
            <p className="text-[12px]" style={{ color: texteDoux, fontFamily: CORPS }}>{produit.unite}</p>
            {/* ⚠️ LA DATE N EST PLUS ICI : elle etait dite TROIS fois sur la
                meme fiche — le bandeau de la photo, cette ligne, et le bloc a
                la place du panier. Celui-la la dit mieux, avec son contexte
                (« pas encore en vente »). Trois fois la meme information,
                c est deux fois trop. */}
          </div>
          {/* 🚨 LE COMPTEUR SUIT LE BOUTON, et ne vit jamais sans lui.

              Le bouton AJOUTER AU PANIER disparaît sur une vitrine — c'est la
              règle écrite en tête de ce bloc. Le compteur de quantité, lui,
              restait : on pouvait monter à 7, et il ne se passait rien. Un
              réglage qui ne règle rien est pire qu'un réglage absent, parce
              qu'il laisse croire qu'une commande est possible plus bas.

              Vu sur Maison Mapuche Luxe, et donc vrai aussi sur Maison
              Mapuche : les deux sont des vitrines sans numéro.

              Les TAILLES, elles, restent. Elles ne commandent rien : elles
              disent ce qui existe, et ce qui est épuisé — c'est du catalogue,
              pas un geste d'achat. */}
          {/* 🚨 ET IL SUIT AUSSI « dispo ». Vu à l'écran le 22 octobre 2026 sur
              un article « bientôt de retour » : le compteur de quantité
              s'affichait, on pouvait monter à 7, et il n'y avait aucun bouton
              dessous. C'est exactement le défaut décrit juste au-dessus — un
              réglage qui ne règle rien — mais pour l'autre moitié de la
              condition. Il n'avait été corrigé que pour les vitrines. */}
          {PEUT_COMMANDER && produit.dispo && (
            <div>
              <p className="text-[11px] uppercase tracking-wider mb-1 text-right" style={{ color: texteDoux, fontFamily: CORPS }}>Quantité</p>
              <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: VOILE(fond, "CC"), border: `1px solid ${bordure}` }}>
                <button onClick={() => setQte((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90" aria-label="Moins">
                  <Minus size={14} color={texte} />
                </button>
                <span className="w-7 text-center font-bold" style={{ color: texte, fontFamily: CORPS }}>{qte}</span>
                <button onClick={() => setQte((q) => q + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90" aria-label="Plus">
                  <Plus size={14} color={texte} />
                </button>
              </div>
            </div>
          )}
        </div>

        {!PEUT_COMMANDER ? null : produit.dispo ? (
          <button
            onClick={() => { if (!manque) onAjouter(produit, qte, taille, couleur); }}
            disabled={manque}
            className="w-full mt-4 py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{
              /* 🚨 « backgroundColor », et surtout pas « background ».
                 « background » est un raccourci : lui donner une valeur
                 remet l'image de fond à zéro. Et React écrit la chaîne vide
                 quand la valeur vaut « undefined » — ce qui produit la même
                 remise à zéro.

                 Écrit « background: manque ? CARTE : undefined » juste sous
                 le dégradé, ce bouton l'effaçait à chaque fois : AJOUTER AU
                 PANIER s'affichait éteint, sur toutes les boutiques, sans
                 qu'aucune erreur ne paraisse. Vu en fabriquant le moteur de
                 location, où le même bouton restait noir.
                 outils/verifier-degrades.mjs refuse maintenant ce mélange. */
              backgroundImage: manque ? "none" : DEGRADE,
              backgroundColor: manque ? CARTE : "transparent",
              border: manque ? `1px solid ${bordure}` : "none",
              color: manque ? texteDoux : "#fff",
              fontFamily: TITRE, fontSize: 17, letterSpacing: ".5px",
            }}
          >
            <Plus size={18} />
            {manque
              ? (tailles.length && !taille ? "CHOISIS TA TAILLE" : "CHOISIS TA COULEUR")
              : `AJOUTER AU PANIER · ${euros(produit.prix * qte)}`}
          </button>
        ) : produit.etat ? (
          /* 🚨 ON MET QUELQUE CHOSE LÀ OÙ L'ŒIL CHERCHE LE PANIER.

             Il n'y avait RIEN : « Me prévenir » est éteint, donc le bloc
             rendait null, et le client lisait un prix sans rien en dessous.
             Son mot du 22 octobre 2026 : « on dirait presque que le produit
             bientôt disponible est déjà disponible si on ne fait pas
             attention ». L'absence de bouton n'est pas un signal, c'est un
             vide — on ne remarque pas ce qui manque.

             ⚠️ MÊME HAUTEUR QUE LE BOUTON (48 px) : c'est ce qui fait que
             l'œil s'y arrête au lieu de glisser. La phrase et les deux portes
             restent en dessous, dans « BlocEtatFiche ». */
          <>
            <div
              className="w-full mt-4 rounded-xl flex flex-col items-center justify-center"
              style={{
                minHeight: 48, background: `${ETAT_LU(produit).couleur}1F`,
                border: `1.5px dashed ${ETAT_LU(produit).couleur}`,
                padding: "8px 12px", textAlign: "center",
              }}
            >
              <span style={{
                color: ETAT_LU(produit).couleur, fontFamily: TITRE,
                fontSize: 15, fontWeight: 700, letterSpacing: ".04em",
              }}>
                {ETAT_LU(produit).auLieuDuPanier}
              </span>
              {!!String(produit.dateEtat || "").trim() && (
                <span style={{ color: texteDoux, fontFamily: CORPS, fontSize: 12.5, marginTop: 1 }}>
                  {ETAT_LU(produit).quand} {direLaDate(produit.dateEtat)}
                </span>
              )}
            </div>
            <BoutonPrevenir produit={produit} />
          </>
        ) : (
          /* 🚨 CE BLOC DISAIT « BIENTÔT DE RETOUR » À TOUT ARTICLE ÉPUISÉ.
             C'était une promesse que le vendeur n'avait jamais faite. Il ne
             reste ici que le cas sans état : « ÉPUISÉ », et rien d'autre. */
          <p className="w-full mt-4 py-3.5 rounded-xl text-center text-[13px] font-bold"
            style={{ background: VOILE(CLAIR ? fondCarte : "#262626", "D9"), color: texteDoux, border: `1px solid ${bordure}` }}>
            ÉPUISÉ
          </p>
        )}
      </div>
    </>
  );
}

/* ══════════ LE BAS DE LA FICHE D'UN ÉTAT (N°21) ══════════

   Ses deux maquettes, écran 3, disent la même chose des deux côtés :
   une phrase qui rassure, puis DEUX portes.

   ① « Voir tout ce qui revient › » / « Voir toutes les nouveautés › »
   ② « [Nom du rayon] disponibles › »

   🚨 LE SECOND BOUTON EST LE PLUS IMPORTANT DES DEUX, et c'est lui qu'on
   aurait oublié : « pour ne pas perdre la vente ». Le client est venu pour
   ce drapeau-là, il ne l'aura pas aujourd'hui — mais il y en a 23 autres
   dans le même rayon, et ils sont en vente. Sans cette porte, il repart.

   ⚠️ IL NE PARAÎT QUE S'IL Y A VRAIMENT QUELQUE CHOSE À VOIR. Un rayon dont
   tous les articles sont en pause enverrait sur une grille vide, ce qui est
   pire que pas de bouton du tout. */
export function BlocEtatFiche({ produit, famille, onRayonDEtat, onDisponibles }) {
  if (!produit.etat) return null;
  const e = ETAT_LU(produit);
  const rayon = produit.etat === "retour" ? FAMILLE_RETOUR : FAMILLE_ARRIVAGE;

  /* Combien d'articles de CE rayon-ci sont vraiment achetables aujourd'hui. */
  const dispo = (famille && famille.gammes ? famille.gammes : [])
    .reduce((n, g) => n + (g.produits || []).filter((p) => p.dispo !== false).length, 0);

  return (
    <div className="mt-4">
      <p
        className="text-[13.5px]"
        style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.55 }}
      >
        {e.phrase}
      </p>

      {!!rayon && !!onRayonDEtat && (
        <button
          onClick={() => onRayonDEtat(rayon)}
          className="w-full mt-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{
            minHeight: 48, background: e.couleur, color: ENCRE(e.couleur),
            fontFamily: TITRE, fontSize: 14.5, fontWeight: 700, letterSpacing: ".06em",
          }}
        >
          {e.versLeRayon} ›
        </button>
      )}

      {!!onDisponibles && dispo > 0 && (
        <button
          onClick={() => onDisponibles(famille)}
          className="w-full mt-2 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
          style={{
            minHeight: 48, background: "transparent", color: texte,
            border: `1px solid ${e.couleur}73`,
            fontFamily: TITRE, fontSize: 13.5, fontWeight: 600, letterSpacing: ".06em",
          }}
        >
          {famille.nom} {dispo > 1 ? "disponibles" : "disponible"} ›
        </button>
      )}
    </div>
  );
}

/* ══════════ TOUTES LES FAMILLES ══════════
   Une rangée de pastilles qui défile de côté cache ce qui dépasse de l'écran :
   passé la troisième famille, le client ne sait même pas que les autres
   existent. Ce bouton ouvre la liste complète, en pleine largeur, avec le
   nombre d'articles de chacune — plus rien n'est caché.

   Il sert dans les deux sens : choisir une famille, ou revenir à l'ensemble. */
export function ToutesLesFamilles({ familles, actif, onFamille, onTout, total, etiquette = "Toutes les familles" }) {
  const [ouvert, setOuvert] = useState(false);
  const compte = (f) => (f.gammes || []).reduce((s, g) => s + (g.produits || []).length, 0);

  return (
    <div className="px-3 mt-3">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 active:scale-[0.99] transition-transform"
        style={{ background: VOILE("#1C1C1C", "D9"), border: `1.5px solid ${jaune}66`,
                 fontFamily: CORPS, fontSize: 13, fontWeight: 700, color: texte }}
      >
        <span style={{ color: jaune, fontSize: 15, lineHeight: 1 }}>☰</span>
        <span className="flex-1 text-left">{etiquette}</span>
        <span style={{ color: texteDoux, fontWeight: 400, fontSize: 12 }}>
          {familles.length} · {ouvert ? "fermer" : "voir"}
        </span>
      </button>

      {ouvert && (
        <div className="mt-2 rounded-xl overflow-hidden" style={{ border: `1px solid ${bordure}` }}>
          {onTout && (
            <button
              onClick={() => { onTout(); setOuvert(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 text-left"
              style={{ background: actif === "tous" ? VOILE("#241830", "E6") : CARTE,
                       borderBottom: `1px solid ${bordure}`, fontFamily: CORPS, fontSize: 13,
                       fontWeight: 700, color: actif === "tous" ? jaune : texte }}
            >
              <span style={{ fontSize: 15 }}>🛍️</span>
              <span className="flex-1">Tout voir</span>
              <span style={{ color: texteDoux, fontWeight: 400, fontSize: 12 }}>{total} articles</span>
            </button>
          )}
          {familles.map((f, i) => (
            <button
              key={f.id}
              onClick={() => { onFamille(f); setOuvert(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 text-left"
              style={{ background: actif === f.id ? VOILE("#241830", "E6") : CARTE,
                       borderBottom: i < familles.length - 1 ? `1px solid ${bordure}` : "none",
                       fontFamily: CORPS, fontSize: 13, fontWeight: 700,
                       color: actif === f.id ? jaune : texte }}
            >
              <span style={{ fontSize: 15 }}>{f.emoji}</span>
              <span className="flex-1 min-w-0" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.nom}
              </span>
              {EST_VIDEOS(f)
                ? <PlayCircle size={13} color={cyan} />
                : EN_RUPTURE(f)
                ? <span style={{ color: texteDoux, fontWeight: 700, fontSize: 11 }}>ÉPUISÉ</span>
                : <span style={{ color: texteDoux, fontWeight: 400, fontSize: 12 }}>{compte(f)} articles</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════ LES VEDETTES ══════════
   De petits carres noirs, quatre par ligne. Compacts par principe : le
   catalogue doit rester visible juste en dessous, sans faire defiler.
   Communes aux deux types — c'est la meme promesse faite au visiteur. */
export function Vedettes({ onProduit }) {
  if (!VEDETTES.length) return null;
  return (
    <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
            {VEDETTES.map((p) => (
              <button
                key={p.cle || p.ref}
                onClick={() => onProduit(p.famille, p.gamme, p)}
                className="relative rounded-xl overflow-hidden text-left active:scale-95 transition-transform"
                style={{ background: "#000", border: `1px solid ${jaune}55` }}
              >
                <Photo
                  produit={p}
                  secours={SECOURS(p, p.famille)}
                  source={visuelProduit(p, p.famille.couleurs, p.famille.glyphe)}
                  alt={p.nom}
                  className="w-full block"
                  style={{ aspectRatio: "1 / 1", objectFit: AJUSTEMENT(p), background: "#000" }}
                />
                <Star
                  size={10}
                  color={jaune}
                  fill={jaune}
                  className="absolute top-1 right-1"
                  style={{ filter: "drop-shadow(0 0 2px #000)" }}
                />
                {/* Le carré d'une vedette fait 9 pixels de texte : la pastille
                    « −50 % » du tronc commun n'y tiendrait pas. Elle se pose
                    donc sur la photo, et le prix de départ se barre sous le
                    nouveau. Sans ça, l'accueil affichait « 10,00 € » et rien
                    ne laissait deviner que c'était un prix de promotion. */}
                <EtiquettePromo taux={p.remise} petit className="absolute top-1 left-1" />
                <div className="px-1 pb-1 pt-0.5" style={{ background: "#000" }}>
                  <p className="truncate" style={{ fontFamily: CORPS, fontSize: 9.5, fontWeight: 700, color: texte }}>
                    {p.nom}
                  </p>
                  <p className="truncate" style={{ fontFamily: CORPS, fontSize: 9, color: jaune }}>
                    {p.prixInitial > p.prix && (
                      <span style={{ color: texteDoux, textDecoration: "line-through", textDecorationThickness: 1.5, marginRight: 3 }}>
                        {euros(p.prixInitial)}
                      </span>
                    )}
                    {euros(p.prix)}
                  </p>
                </div>
              </button>
            ))}
    </div>
  );
}

/* ═══════════════════ LES ÉCRANS DU SOCLE ═══════════════════
   Ils ne vendent rien : ils montrent la boutique. Ils vivaient dans
   App.jsx — le moteur de VENTE — et le moteur de LOCATION en a besoin
   à l'identique. Les recopier aurait fait deux versions qui divergent
   dès la première correction ; ils sont donc ici, et les deux moteurs
   les lisent du même endroit.

   Rien dans ces écrans ne connaît le panier, les tailles ou les frais
   d'envoi — c'est ce qui les rend partageables. Si l'un d'eux devait un
   jour en avoir besoin, il n'appartiendrait plus au socle : il devrait
   redescendre dans le moteur qui s'en sert.
   ══════════════════════════════════════════════════════════ */

/* UNE FICHE TECHNIQUE, PAS UN PARAGRAPHE.

   Un drapeau, une housse de couette, une serviette se choisissent sur des
   chiffres : 150 × 90 cm, 220 g/m², lavable à 40°. Noyés dans une phrase, ces
   chiffres se cherchent — et un client qui cherche écrit pour demander, ou
   s'en va.

   En deux colonnes, ils se lisent d'un coup d'œil : le nom à gauche en gris,
   la valeur à droite en clair, un trait fin entre chaque ligne. C'est la
   présentation d'une étiquette de produit, et personne n'a besoin qu'on la
   lui explique.

   La dernière ligne n'a pas de trait sous elle : un trait qui ne sépare rien
   fait « tableau coupé ». */
export function Mesures({ lignes }) {
  if (!lignes || lignes.length === 0) return null;
  return (
    <div className="mt-3">
      {lignes.map((m, i) => (
        <div
          key={m.nom + i}
          className="flex items-baseline justify-between gap-3 py-2"
          style={{ borderBottom: i < lignes.length - 1 ? `1px solid ${bordure}` : "none" }}
        >
          <span className="text-[13px] flex-shrink-0" style={{ color: texteDoux, fontFamily: CORPS }}>
            {m.nom}
          </span>
          <span
            className="text-[14px] text-right"
            style={{ color: texte, fontFamily: CORPS, fontWeight: 600 }}
          >
            {m.valeur}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════ LE BLOC PERMANENT D'INSTALLATION ═══════

   Le bandeau du bas ne passe qu'une fois et se ferme pour toujours. Celui-ci
   ne bouge pas : on le retrouve en cherchant. Il disparait seulement quand la
   boutique EST deja installee — proposer d'installer ce qui l'est deja ferait
   douter du reste. */
function GarderSurSonTelephone() {
  const [fenetre, setFenetre] = React.useState(null);
  const [faite, setFaite] = React.useState(false);
  const iphone = EST_IPHONE();

  React.useEffect(() => {
    if (telegram || DEJA_INSTALLEE()) return undefined;
    const capter = (e) => { e.preventDefault(); setFenetre(e); };
    window.addEventListener("beforeinstallprompt", capter);
    const posee = () => setFaite(true);
    window.addEventListener("appinstalled", posee);
    return () => {
      window.removeEventListener("beforeinstallprompt", capter);
      window.removeEventListener("appinstalled", posee);
    };
  }, []);

  if (telegram || DEJA_INSTALLEE() || faite) return null;

  return (
    <div className="rounded-2xl p-4" style={{ background: CARTE, border: `1px solid ${COULEURS.jaune || bordure}` }}>
      <p style={{ fontFamily: TITRE, fontSize: 17, color: jaune }}>GARDER SUR SON TÉLÉPHONE</p>
      <p className="text-[14px] mt-1" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.5 }}>
        {iphone
          ? "Appuie sur Partager, en bas de ton navigateur, puis sur « Sur l’écran d’accueil ». La boutique s’ouvrira en plein écran, comme une application."
          : "La boutique se pose sur ton écran d’accueil et s’ouvre en plein écran, sans passer par le navigateur."}
      </p>
      {!iphone && (
        <button
          onClick={async () => {
            if (!fenetre) return;
            try { fenetre.prompt(); await fenetre.userChoice; } catch (e) {}
          }}
          disabled={!fenetre}
          className="mt-3 px-4 py-2.5 active:scale-95 transition-transform"
          style={{
            background: fenetre ? rose : "transparent",
            color: fenetre ? ENCRE(rose) : texteDoux,
            border: fenetre ? "none" : `1px solid ${bordure}`,
            fontFamily: CORPS, fontWeight: 700, fontSize: 13,
            borderRadius: ANGLE_PETIT,
          }}
        >
          {fenetre ? "Installer la boutique" : "Ouvre cette page dans ton navigateur pour l’installer"}
        </button>
      )}
    </div>
  );
}

export function EcranInfo() {
  return (
    <>
      <BarreSection titre="INFOS PRATIQUES" />
      <div className="px-3 mt-4 flex flex-col gap-3">
        <GarderSurSonTelephone />
        {BOUTIQUE.info.map((bloc, i) => (
          <div key={bloc.titre + i} className="rounded-2xl p-4" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
            <p style={{ fontFamily: TITRE, fontSize: 17, color: jaune }}>{bloc.titre.toUpperCase()}</p>
            {(bloc.texte || "").trim() && (
              <p className="text-[14px] mt-1" style={{ color: texteDoux, fontFamily: CORPS, whiteSpace: "pre-line" }}>{bloc.texte}</p>
            )}
            <Mesures lignes={bloc.mesures} />
          </div>
        ))}
      </div>

      {/* 🚨 LE LÉGAL EST ICI, parce que c est là qu on va le chercher.
          Il n y est pas SEUL : si cet onglet est éteint, PiedLegal le remet
          en bas de page, à côté de la signature. Une obligation légale
          qu un vendeur peut décocher n en est pas une. */}
      <PiedLegal ou="infos" />
    </>
  );
}

export function EcranLiens() {
  const liens = BOUTIQUE.liens.filter((l) => l.url);
  return (
    <>
      <BarreSection titre="LIENS" />
      <div className="px-3 mt-4 flex flex-col gap-3">
        {liens.length === 0 ? (
          <p className="text-center text-[13px] px-6 mt-4" style={{ color: texteDoux, fontFamily: CORPS }}>
            Aucun lien pour le moment. Ajoute-les dans <span style={{ color: jaune }}>src/config.js</span>.
          </p>
        ) : (
          liens.map((l) => (
            <a
              key={l.titre}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={clicLien(l.url)}
              className="rounded-2xl px-4 py-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
              style={{ backgroundImage: `linear-gradient(100deg, ${violet}, ${rose})` }}
            >
              <Link2 size={18} color={ENCRE_DEGRADE} />
              <span className="flex-1" style={{ fontFamily: TITRE, fontSize: 17, color: ENCRE_DEGRADE }}>{l.titre}</span>
              <ChevronRight size={18} color={ENCRE_DEGRADE} />
            </a>
          ))
        )}
      </div>
    </>
  );
}

/* L'ONGLET AVIS
   Les avis ne se déposent PAS depuis la boutique. C'est le vendeur qui les
   publie, et uniquement sous forme de captures d'écran de vraies conversations
   — voir l'onglet Avis de l'atelier.

   Il y avait ici un bouton « DONNER MON AVIS » qui ouvrait la messagerie. Il
   est retiré : il ouvrait une porte que personne n'avait demandé d'ouvrir, il
   promettait au client que son message serait publié — ce qui n'a jamais été
   vrai — et il donnait le numéro du vendeur à quiconque passait sur l'onglet,
   y compris quand aucune façon d'être contacté n'était activée. */
export function EcranAvis() {
  if (AVIS.length) {
    return (
      <>
        <BarreSection titre="AVIS" />
        <div className="px-3 mt-4 pb-4">
          <p className="text-[12px] mb-3" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.55 }}>
            De vrais messages de clients, en capture d'écran. Appuie sur une image pour la lire en grand.
          </p>
          <Carrousel images={AVIS} />
        </div>
      </>
    );
  }

  return (
    <>
      <BarreSection titre="AVIS" />
      <div className="px-3 mt-4">
        <div className="rounded-2xl p-6 text-center" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <Star size={28} color={jaune} className="mx-auto" />
          <p className="mt-3" style={{ fontFamily: TITRE, fontSize: 19, color: texte }}>PAS ENCORE D'AVIS</p>
          <p className="text-[13px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
            Les avis affichés ici sont de vrais messages de clients, publiés tels quels. Rien n'est inventé.
          </p>
        </div>
      </div>
    </>
  );
}

/* ══════════ LES OUVERTURES QUI NE CHARGENT RIEN ══════════

   Cinq entrées, toutes dessinées par le téléphone : le rideau, le fondu
   lumineux, la lettre à lettre, le balayage, et le titre animé d'origine.
   Elles portent le nom de la boutique et ses couleurs, et ne coûtent pas un
   octet de téléchargement.

   D'où ça vient : il y avait ici une sixième entrée, « Tunnel », qui pointait
   sur une vidéo hébergée par l'atelier. 11,8 Mo, sur le téléphone de chaque
   visiteur, à CHAQUE visite. Sur un partage de connexion, le visiteur attend
   devant un écran noir, consomme son forfait, et part avant d'avoir vu un
   produit. Pour exactement le même effet d'entrée.

       « crée ces entrées, et si un client veut une vidéo il la mettra
         lui-même »

   Elle est retirée. Une vidéo reste possible — c'est alors le propriétaire
   de la boutique qui la dépose, donc qui connaît son poids. */

/* La couleur d'une lettre, prise sur le dégradé à sa position.

   POURQUOI UNE COULEUR PAR LETTRE, ET NON LE DÉGRADÉ DU MOT.
   Le dégradé du titre est un fond peint sur le PARAGRAPHE, puis découpé à la
   forme des lettres. Une lettre qui se déplace emporte sa forme mais pas ce
   fond : la découpe reste là où elle était, et on voit des tranches de
   couleur glisser derrière des lettres vides. Chaque lettre reçoit donc sa
   propre couleur, prise sur le dégradé là où elle se trouve. De loin c'est
   le même dégradé ; de près, chaque lettre peut bouger.

   Si une couleur n'est pas un code hexadécimal — rien ne l'impose, les
   couleurs viennent des réglages de la boutique — on ne devine pas : on rend
   la première, et le titre reste lisible. */
function melangeCouleur(a, b, t) {
  const hex = /^#[0-9a-f]{6}$/i;
  if (!hex.test(a) || !hex.test(b)) return a;
  const lire = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = lire(a);
  const B = lire(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

// Le titre, aux couleurs de la boutique. Le dégradé est découpé sur les
// lettres : c'est le même titre que celui des boutiques depuis le début.
const TITRE_OUVERTURE = {
  fontFamily: TITRE,
  fontSize: "clamp(30px, 11vw, 62px)",
  lineHeight: 1.02,
  backgroundImage: DEGRADE,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/* ═══════════ LE NOM QUI TIENT TOUJOURS DANS L'ÉCRAN ═══════════

   🚨 « PEU IMPORTE LE NOM DE LA BOUTIQUE, IL DOIT RENTRER SANS ÊTRE COUPÉ »
   ─────────────────────────────────────────────────────────────────────────
   Demandé le 16 octobre 2026, et c'est exactement le genre de défaut qui ne
   se voit jamais chez soi : « Mapuche Arts » tient partout. C'est le client
   qui s'appelle « La Petite Boutique de Sophie et Marie » qui découvre son
   nom amputé le jour de son ouverture.

   ON MESURE, ON NE CALCULE PAS. Une formule aurait demandé la largeur
   moyenne d'un caractère — or les allures n'ont pas la même police :
   Anton est une condensée très étroite, Cormorant Garamond un serif large.
   Un même coefficient serait faux pour l'une ou pour l'autre, et il serait
   faux AUSSI le temps que la police arrive du réseau.

   On essaie donc des tailles, de la plus grande à la plus petite, et on
   garde la première qui tient — en lisant « scrollWidth » et
   « scrollHeight », c'est-à-dire ce que le navigateur a réellement mis en
   page, avec SA police, sur SON écran.

   L'ESCALIER DES PALIERS. Une ligne est plus belle que deux. On n'accepte
   donc deux lignes qu'une fois descendu sous 51 % de la taille de départ,
   trois sous 41 %, quatre en dernier. Un nom court reste grand sur une
   ligne ; un nom long descend jusqu'à tenir sur deux.

   ⚠️ TOUT SE PASSE AVANT LA PREMIÈRE IMAGE. « useLayoutEffect » s'exécute
   après la mise en page et AVANT la peinture : les trente essais sont
   invisibles. En « useEffect », on verrait le nom sauter de taille.

   ⚠️ ET ON REMESURE QUAND LES POLICES ARRIVENT. Cormorant Garamond vient du
   réseau : mesuré avec Times en attendant, le nom serait réglé pour la
   mauvaise police. « document.fonts.ready » le dit, et une seconde mesure
   coûte une milliseconde.

   ⚠️ LE DERNIER RECOURS, assumé : un nom d'un seul mot interminable ne
   rentre à aucune taille lisible. On pose alors « atelier-nom-coupe » et le
   mot se coupe — dans l'écran. C'est le seul cas où un mot est coupé, et
   c'est toujours mieux qu'un nom qui sort de l'écran. */
const PALIERS_DU_NOM = [[0.65, 1], [0.51, 2], [0.41, 3], [0.265, 4]];

/* ═══════════ LE DÉCOR D'UNE OUVERTURE DE SAISON ═══════════

   🚨 LA PHOTO D'ABORD, LE DESSIN SI ELLE MANQUE.
   ──────────────────────────────────────────────
   « Le design ne me convient pas, trop trop minimaliste pour du premium »,
   puis « fais un design réaliste avec Canva ». Le dessin au trait dit
   « application » ; une photographie dit « boutique ».

   Quand le vendeur a déposé une image de fond, elle remplace TOUT le
   décor dessiné — ciel, sapins, lune, citrouilles. Ce qui reste par
   dessus, c'est ce qui bouge : la matière qui tombe, le nom qu'elle
   écrit, et les araignées.

   ⚠️ ET LE DESSIN RESTE, pour la boutique qui n'a rien déposé. Une
   ouverture qui s'ouvrirait sur du noir parce qu'il manque un fichier
   serait pire que le décor le plus plat.

   ⚠️ L'IMAGE EST SERVIE PAR LA BOUTIQUE, jamais cherchée ailleurs : elle
   est déposée comme une photo de produit et vit dans son dossier. La
   règle posée après la vidéo « Tunnel » de 11,8 Mo tient toujours. */
function decorDeSaison(dessine) {
  if (!INTRO.fond) return dessine;
  return (
    <>
      <img className="atelier-photo-fond" src={INTRO.fond} alt="" />
      <span className="atelier-voile-fond" />
    </>
  );
}

/* Le nom découpé en MOTS insécables, séparés par de vrais espaces.

   🚨 L'ESPACE EST UN VRAI NŒUD DE TEXTE, et c'est lui qui autorise le
   passage à la ligne entre deux mots. Sans lui, cinq mots collés ne
   pourraient jamais se répartir sur deux lignes — et le nom serait écrit
   tout petit pour tenir sur une seule.

   Les cartes posent une lettre animée par lettre à l'intérieur de chaque
   mot ; la dorure y laisse le mot entier, puisque c'est la lumière qui
   bouge et non les lettres. La règle du mot insécable, elle, est la même
   pour les deux. */
function motsInsecables(texte, dedans) {
  const mots = String(texte || "").trim().split(/\s+/).filter(Boolean);
  const sortie = [];
  mots.forEach((mot, i) => {
    if (i) sortie.push(" ");
    sortie.push(
      <span key={"mot" + i} className="atelier-mot">
        {dedans ? dedans(mot, i) : mot}
      </span>,
    );
  });
  return sortie;
}

/* ⚠️ CE COMPOSANT SERT DEUX OUVERTURES, et il en servira d'autres.
   Les cartes lui donnent des lettres animées une à une et un filet ; la
   dorure lui donne un nom d'un bloc et un reflet. Ce qu'il fait de commun
   — et qui est tout le travail — c'est de garantir que le nom RENTRE.

   « dessous » est rendu dans la zone, après le nom : il hérite donc de la
   taille retenue par la variable, et il est clippé par la même hauteur. */
/* ═══════════ LE NOM QUE LA MATIÈRE ÉCRIT ═══════════

   Partagé par les deux ouvertures de saison : la neige à Noël, les feuilles
   mortes à Halloween. Chaque lettre porte SES deux flocons — en position
   absolue, donc ils savent où elle est — et s'allume à l'instant où ils se
   posent dessus.

   🚨 LE PAS SE RESSERRE SI LE NOM EST LONG, exactement comme pour les
   cartes, et pour la même raison payée une fois : à pas fixe, un nom de
   quarante lettres n'a pas fini de s'écrire quand la couche se referme. On
   compte à l'envers depuis la durée réglée.

   ⚠️ « coiffe » n'est posée qu'à Noël : un liseré de neige sur une lettre,
   en octobre, ne veut rien dire. */
function nomQuiSEcrit(texte, { duree, metal, coiffe, confetti }) {
  const mots = String(texte || "").trim().split(/\s+/).filter(Boolean);
  const combien = mots.reduce((n, m) => n + m.length, 0);

  /* Ce qu'il faut après la dernière lettre : sa chute (0,9 s), son
     allumage (0,55 s) et un instant pour la lire. */
  const APRES = 1.33;
  const budget = Math.max(1.8, (Number(duree) || 5) - 0.6);
  const pas = combien > 1
    ? Math.max(0.012, Math.min(0.085, (budget - APRES - 0.2) / (combien - 1)))
    : 0.085;

  let rang = 0;
  const morceaux = [];
  mots.forEach((mot, im) => {
    if (im) morceaux.push(" ");
    morceaux.push(
      <span key={"mot" + im} className="atelier-mot">
        {[...mot].map((lettre, il) => {
          const n = rang++;
          const arrive = 0.2 + n * pas;
          return (
            <span
              key={il}
              className="atelier-lettre-ecrite"
              style={{
                backgroundImage: metal,
                WebkitBackgroundClip: "text", backgroundClip: "text",
                color: "transparent",
                animation: `atelier-lettre-ecrite .55s cubic-bezier(.2,.86,.3,1) ${(arrive + 0.78).toFixed(2)}s both`,
              }}
            >
              {lettre}
              {/* 🚨 LA MATIÈRE QUI VISE LA LETTRE CHANGE AVEC LA SAISON.
                  Un rond blanc est un flocon ; en plein mois de janvier, ce
                  doit être un CONFETTI — un petit rectangle de couleur qui
                  tourne en tombant. Même mécanique, autre matière. */}
              {[0, 1].map((k) => (
                <span
                  key={"f" + k}
                  className="atelier-vers"
                  style={{
                    "--dx": ((k ? 1 : -1) * (5 + ((n * 7 + k * 3) % 9))) + "px",
                    ...(confetti ? {
                      width: 5, height: 3, borderRadius: 1,
                      background: confetti[(n * 2 + k) % confetti.length],
                      boxShadow: `0 0 8px ${confetti[(n * 2 + k) % confetti.length]}`,
                    } : null),
                    animation: confetti
                      ? `atelier-vers-lettre-confetti .9s cubic-bezier(.4,.1,.7,1) ${(arrive + k * 0.06).toFixed(2)}s both`
                      : `atelier-vers-lettre .9s cubic-bezier(.4,.1,.7,1) ${(arrive + k * 0.06).toFixed(2)}s both`,
                  }}
                />
              ))}
              {coiffe ? (
                <span
                  className="atelier-coiffe"
                  style={{
                    transform: "scaleX(1)",
                    animation: `atelier-coiffe .7s ease-out ${(arrive + 1.05).toFixed(2)}s both`,
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </span>,
    );
  });

  return morceaux;
}

function NomQuiTient({ morceaux, finDuNom, dessous, classeNom, styleNom, styleZone, haut, hauteurMax }) {
  const cadre = useRef(null);

  useLayoutEffect(() => {
    const ajuster = (reste) => {
      const el = cadre.current;
      if (!el) return;

      /* 🚨 UNE LARGEUR NULLE N'EST PAS UNE MESURE, C'EST UNE ABSENCE.
         ─────────────────────────────────────────────────────────────
         Relevé le 16 octobre 2026 en mesurant la boutique en ligne dans un
         panneau refermé : « innerWidth » valait 0, donc la place disponible
         aussi, donc AUCUNE taille ne rentrait — et le nom se figeait au
         plancher, 10 px, pour toujours. Un nom illisible, sans la moindre
         erreur nulle part.

         Ça n'arrive pas qu'à un panneau d'essai : une page mise en page
         avant d'avoir ses dimensions, c'est un onglet restauré en arrière-plan
         ou une boutique lancée depuis l'icône de l'écran d'accueil — donc le
         cas de tous ses clients qui l'ont installée.

         On ne décide donc rien sur une largeur qui ne veut rien dire : on
         repasse à l'image suivante, huit fois au plus. Huit images, c'est un
         dixième de seconde — et l'ouverture, elle, ne commence qu'à 0,15 s. */
      /* 🚨 LA TAILLE S'ÉCRIT SUR LE CADRE, PAS SUR LE NOM.
         Elle devient une variable que tout ce qui est DANS la zone peut
         lire — à commencer par le reflet de la dorure, qui doit faire
         exactement la même taille que le nom qu'il reflète. Écrite sur le
         nom lui-même, elle restait un secret entre lui et le navigateur. */
      const poser = (px) => {
        const zone = el.parentElement;
        if (zone) zone.style.setProperty("--taille-nom", px + "px");
        else el.style.fontSize = px + "px";
      };

      const encore = typeof reste === "number" ? reste : 8;
      if (el.clientWidth < 40) {
        if (encore > 0) requestAnimationFrame(() => ajuster(encore - 1));
        return;
      }

      el.classList.remove("atelier-nom-coupe");
      /* Les lettres figées à leur état final le temps de la mesure : voir
         « .atelier-nom-mesure » dans les images clés. */
      el.classList.add("atelier-nom-mesure");

      /* La taille de départ : 9,8 % de la largeur de l'écran — c'est un nom
         de douze lettres sur une ligne — plafonnée à 64 px pour qu'une
         tablette n'affiche pas une enseigne. */
      const large = (typeof window !== "undefined" && window.innerWidth) || 360;
      const depart = Math.max(14, Math.min(Math.round(large * 0.098), 64));
      const mini = Math.max(9, Math.round(depart * 0.265));

      let choisi = mini;
      let coupe = true;
      for (let f = depart; f >= mini; f = Math.floor(f * 0.96)) {
        poser(f);
        const palier = PALIERS_DU_NOM.find(([part]) => f >= depart * part);
        const permis = palier ? palier[1] : 4;
        /* La hauteur réellement occupée, divisée par une ligne : c'est le
           navigateur qui a compté les lignes, pas nous. */
        const lignes = Math.max(1, Math.round(el.scrollHeight / (f * 1.14)));
        if (el.scrollWidth <= el.clientWidth + 1 && lignes <= permis) {
          choisi = f;
          coupe = false;
          break;
        }
        /* « Math.floor(f * 0.96) » finirait par stagner sur les petites
           valeurs : on sort nous-mêmes au plancher. */
        if (f === mini) break;
      }
      poser(choisi);
      if (coupe) el.classList.add("atelier-nom-coupe");
      el.classList.remove("atelier-nom-mesure");
    };

    ajuster();
    try {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(ajuster).catch(() => {});
      }
    } catch (e) { /* un navigateur sans « fonts » : la première mesure suffit */ }
    window.addEventListener("resize", ajuster);
    return () => window.removeEventListener("resize", ajuster);
  }, []);

  /* 🚨 « aria-hidden » SUR TOUTE LA ZONE. Un nom découpé en lettres séparées
     se lirait « M, A, P, U, C, H, E » à voix haute. Le nom de la boutique
     est déjà dans le titre de la page et dans l'en-tête : cette zone-ci est
     une décoration, et elle le dit. */
  return (
    <div
      aria-hidden="true"
      /* 🚨 TOUT EN STYLE, AUCUNE CLASSE TAILWIND.

         C'était « className="absolute left-0 right-0 text-center" », et sur le
         banc d'essai du 16 octobre 2026 le nom se collait en haut à gauche de
         l'écran : « position: static », « text-align: start ». Aucune de ces
         classes n'existait dans le CSS servi.

         La cause était le banc — Tailwind ne trouvait pas sa configuration —
         mais la leçon tient quand même : Tailwind ne garde que les classes
         qu'il LIT dans les fichiers listés en « content ». Une mise en page
         qui en dépend se défait en silence le jour où cette liste est fausse,
         et personne ne voit d'erreur. Pour une couche plein écran qui doit
         marcher coûte que coûte, le style posé ici ne dépend de rien. */
      style={{
        position: "absolute", left: 0, right: 0,
        textAlign: "center", pointerEvents: "none",
        top: haut || "8.5vh", paddingLeft: "6vw", paddingRight: "6vw",
        /* Le garde-fou ultime : même au pire, rien ne descend sur ce qui
           suit et rien ne sort de l'écran. L'escalier des paliers fait que
           ce plafond n'est jamais atteint en pratique. */
        maxHeight: hauteurMax || "26vh", overflow: "hidden",
        /* Ce que l'ouverture ajoute : sa place dans la pile, surtout. Le
           mur a besoin que le nom soit DERRIÈRE ses battants, sinon il
           flotte par-dessus la porte fermée. */
        ...(styleZone || {}),
      }}
    >
      <p
        ref={cadre}
        className={classeNom}
        style={{
          fontFamily: TITRE,
          margin: 0, lineHeight: 1.14,
          letterSpacing: ".10em", textIndent: ".10em",
          /* La taille mesurée, ou une taille de départ raisonnable le temps
             de la mesurer : la zone n'est jamais vide, même une image. */
          fontSize: "var(--taille-nom, 9.8vw)",
          /* Ce que l'ouverture ajoute : son métal, son animation. La mesure,
             elle, ne dépend de rien de tout ça — ni la couleur ni le filtre ne
             changent la place que prend un mot. */
          ...(styleNom || {}),
        }}
      >
        {morceaux}
      </p>
      {dessous}
      {finDuNom === undefined ? null : (
      <span
        style={{
          display: "block", width: "34%", maxWidth: 190, height: 1,
          margin: "14px auto 0",
          background: `linear-gradient(90deg, transparent, ${melangeCouleur(rose, violet, 0.5)}, transparent)`,
          transformOrigin: "center",
          animation: `atelier-filet-nom .7s ease-out ${Math.max(0.2, finDuNom - 0.12).toFixed(2)}s both`,
        }}
      />
      )}
    </div>
  );
}

/* ───── CE QUE MONTRE L'OUVERTURE : EN COURS DE REFONTE ─────

   Six animations vivaient ici — titre, rideau, fondu lumineux, médaillon,
   lettre à lettre, balayage. Retirées le 14 octobre 2026 : « supprime
   toutes les animations, on va en faire une par une, testée et dessinée,
   avant de passer à la suivante ».

   🚨 AUCUNE N'ÉTAIT CASSÉE. Les huit ouvertures ont été mesurées une par
   une le jour même, arrêtées image par image sur une boutique en ligne, et
   toutes tenaient ce qu'elles annonçaient. Elles partent parce qu'elles ne
   valent pas une application qu'on vend : c'est un jugement de qualité, pas
   un constat de panne. Leur code est dans l'historique git.

   Ce qui reste : le mécanisme. La couche plein écran, sa sortie en fondu,
   le doigt qui la referme, le titre posé par-dessus une vidéo, et les
   pièges qu'il connaît déjà — le verrou « une fois par visite », le filet
   de sécurité si la vidéo ne démarre pas, la lecture muette. Le refaire
   aurait coûté plus cher que de le garder.

   ⚠️ LA PROCHAINE SE POSE ICI, et le même jour il faut : son nom dans
   STYLES_OUVERTURE, sa fiche dans OUVERTURES (schema.js), ses images clés
   dans ANIMATIONS, et sa ligne dans essayer-les-ouvertures.mjs. Un nom
   sans dessin donne un écran noir — le contrôle de fabrication le refuse,
   et c'est voulu. */
function OuvertureDessinee() {
  const style = INTRO.style;

  /* ───── ① LE SCEAU ─────
     Le logo se pose comme un cachet, deux ondes partent du choc, le nom se
     grave dessous. La seule ouverture qui montre LA MARQUE.

     🚨 CHAQUE ÉTAT AU REPOS EST L'ÉTAT FINAL, et c'est une obligation :
     un appareil réglé sur « animations réduites » met « animation: none »
     partout. Si l'état au repos du cachet était « invisible et trop
     grand », la boutique s'ouvrirait sur un écran noir — pour toujours.
     Les deux ondes, elles, sont invisibles au repos : sans animation, ce
     sont deux anneaux morts collés au médaillon. */
  if (style === "sceau") {
    const dedans = BOUTIQUE.logo
      ? <img src={BOUTIQUE.logo} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover",
            borderRadius: "50%", clipPath: "circle(50% at 50% 50%)" }} />
      : <span style={{ fontSize: "clamp(38px, 13vw, 64px)", lineHeight: 1 }}>
          {BOUTIQUE.emoji || "🛍️"}
        </span>;

    const onde = (retard) => ({
      position: "absolute", inset: 0, borderRadius: "50%", opacity: 0,
      border: `2px solid ${rose}`, pointerEvents: "none",
      animation: `atelier-sceau-onde .95s ease-out ${retard} both`,
    });

    return (
      <div className="flex flex-col items-center" style={{ gap: 24 }}>
        {/* L'enveloppe ne bouge pas : elle tient les ondes à leur place
            pendant que le cachet, lui, s'écrase à l'intérieur. */}
        <div style={{
          position: "relative", width: "clamp(116px, 37vw, 156px)", aspectRatio: "1",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span aria-hidden="true" style={onde(".40s")} />
          <span aria-hidden="true" style={onde(".54s")} />
          {/* 🚨 DEHORS : L'ANNEAU, L'OMBRE, ET L'ANIMATION. RIEN À DÉCOUPER.

              Tout tenait sur un seul élément : le découpage en rond, l'anneau,
              l'ombre et l'animation de « transform ». Sur Android, le moteur de
              Chrome ne garantit pas le découpage d'un élément pendant qu'il le
              transforme : le temps que le sceau se pose, le logo reprenait sa
              forme de fichier — UN CARRÉ, avec son fond gris — puis redevenait
              rond à la fin. Signalé deux fois, capture à l'appui.

              ⚠️ L'ombre reste ICI et pas dans l'élément découpé : une ombre se
              peint en dehors de l'élément, un découpage l'emporterait. */}
          <div style={{
            position: "relative", width: "100%", height: "100%", borderRadius: "50%",
            border: `2px solid ${rose}`,
            boxShadow: `0 0 0 7px ${rose}22, 0 18px 50px rgba(0,0,0,.62)`,
            animation: "atelier-sceau-pose .52s cubic-bezier(.16,.84,.26,1) both",
          }}>
            {/* DEDANS : le logo, découpé par « clip-path », qui tient sous
                transformation là où « overflow: hidden » lâche.
                « border-radius » est gardé en second rideau, pour les moteurs
                qui ignoreraient clip-path. */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden",
              clipPath: "circle(50% at 50% 50%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(circle at 36% 26%, rgba(255,255,255,.15), rgba(255,255,255,.02) 62%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)",
            }}>
              {dedans}
              {/* La bande est plus haute que le médaillon et penchée : sans ça,
                  ses deux bouts apparaîtraient dans le cercle en traversant. */}
              <span aria-hidden="true" style={{
                position: "absolute", top: "-42%", left: 0, width: "52%", height: "184%",
                opacity: 0, pointerEvents: "none",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.62), transparent)",
                animation: "atelier-sceau-eclat .9s ease-out .44s both",
              }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center" style={{ gap: 13 }}>
          <p
            className="text-center"
            style={{
              fontFamily: TITRE, fontSize: "clamp(22px, 7.4vw, 44px)", lineHeight: 1.06,
              letterSpacing: ".02em",
              backgroundImage: DEGRADE, WebkitBackgroundClip: "text", backgroundClip: "text",
              color: "transparent",
              animation: "atelier-sceau-grave .75s cubic-bezier(.2,.9,.2,1) .5s both",
            }}
          >
            {INTRO.texte}
          </p>
          <span
            aria-hidden="true"
            style={{
              height: 2, width: 92, borderRadius: 2, backgroundImage: DEGRADE,
              animation: "atelier-sceau-filet .6s cubic-bezier(.2,.9,.2,1) .85s both",
            }}
          />
        </div>
      </div>
    );
  }

  /* ───── ② LA FENTE DE LUMIÈRE ─────
     Un trait de lumière s'étire au centre, le nom paraît dessous, puis le
     noir s'ouvre en deux et LE CATALOGUE SE DÉCOUVRE DERRIÈRE.

     🚨 ELLE N'ATTEND PAS, ELLE OUVRE. Les autres font patienter puis
     s'effacent ; celle-ci est le passage lui-même. C'est pour ça que les
     deux moitiés portent le fond de la boutique et pas la couche : en
     s'écartant, elles laissent voir ce qu'il y a dessous.

     ⚠️ LA COUCHE DOIT DONC ÊTRE TRANSPARENTE POUR CETTE OUVERTURE-LÀ, et
     c'est écrit dans Intro, plus bas. Opaque, elle couvrirait la boutique
     que les moitiés viennent de découvrir — on verrait deux moitiés
     s'écarter sur... du noir. */
  if (style === "fente") {
    const moitie = {
      position: "absolute", left: 0, right: 0, height: "50.5%",
      background: COULEURS.fond || "#050505", pointerEvents: "none",
    };
    return (
      <>
        {/* 50,5 % et non 50 : à certains rapports d'écran, un liseré d'un
            pixel reste visible au milieu quand on s'arrête pile à la moitié. */}
        <div style={{ ...moitie, top: 0,
          animation: "atelier-fente-haut .9s cubic-bezier(.65,.02,.3,1) 1.9s both" }} />
        <div style={{ ...moitie, bottom: 0,
          animation: "atelier-fente-bas .9s cubic-bezier(.65,.02,.3,1) 1.9s both" }} />

        {/* Le trait. Il part du centre vers les deux bords : c'est
            « transform-origin: center » qui le fait, et sans lui il
            s'étirerait depuis la gauche comme une barre de chargement. */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, right: 0, top: "50%", height: 2,
            marginTop: -1, transformOrigin: "center", pointerEvents: "none",
            backgroundImage: `linear-gradient(90deg, transparent, ${rose} 18%, #ffffff 50%, ${rose} 82%, transparent)`,
            boxShadow: `0 0 26px ${rose}, 0 0 60px ${rose}66`,
            animation: "atelier-fente-trait 2.4s cubic-bezier(.2,.9,.2,1) both",
          }}
        />

        <p
          className="text-center relative"
          style={{
            ...TITRE_OUVERTURE, marginTop: "18%", letterSpacing: ".06em",
            animation: "atelier-fente-nom 1.45s cubic-bezier(.2,.9,.2,1) .45s both",
          }}
        >
          {INTRO.texte}
        </p>
      </>
    );
  }

  /* ───── ④ LES CARTES QUI SE POSENT ─────
     Le nom s'écrit lettre par lettre, puis les articles de la boutique
     montent du bas un par un et se posent en éventail. Puis la couche
     s'efface sur le catalogue.

     🚨 C'EST LA PREMIÈRE OUVERTURE QUI MONTRE LA MARCHANDISE. Les trois
     autres montrent la marque ou le noir qui s'écarte : celle-ci montre
     ce qu'on vend, et deux boutiques n'auront donc jamais la même.

     ⚠️ ET ELLE DOIT TENIR SANS PHOTOS. Une boutique neuve n'en a
     aucune : « visuelProduit » rend alors le dessin de secours de la
     famille, aux couleurs de la boutique. Sans ce filet, l'ouverture la
     plus belle serait réservée à ceux qui n'en ont plus besoin.

     ⚠️ ET SANS CATALOGUE DU TOUT — le jour de la création, avant le
     premier article — on ne montre que le nom. Un éventail de zéro
     carte est un écran vide pendant trois secondes. */
  if (style === "cartes") {
    /* Les vedettes d'abord : ce sont celles que le vendeur a choisi de
       mettre en avant, donc ses plus belles. Puis la sélection, puis le
       tout-venant. Cinq au plus — au-delà, l'éventail se referme sur
       lui-même et on ne distingue plus rien. */
    const choisis = [...VEDETTES, ...SELECTION_CHEF, ...TOUS_PRODUITS];
    const vues = [];
    for (const p of choisis) {
      if (vues.length >= 5) break;
      if (vues.some((v) => v.cle === p.cle)) continue;
      vues.push(p);
    }

    /* ───── LE NOM, LETTRE PAR LETTRE ─────

       🚨 LE PAS S'ADAPTE À LA LONGUEUR DU NOM, ET À LA DURÉE RÉGLÉE.
       ───────────────────────────────────────────────────────────────
       C'est la leçon de l'ancienne ouverture « lettre à lettre », déjà
       payée une fois : à pas fixe, un nom de quarante lettres n'avait pas
       fini de s'écrire quand la couche se refermait. On voyait la moitié
       d'un nom, et les cartes jamais.

       On compte donc à l'envers. La couche dure « introDuree » ; les
       cartes ont besoin de 1,4 s après le nom ; le nom a donc le reste, et
       son pas se resserre jusqu'à y tenir. Un nom long s'écrit plus vite —
       il reste entier, c'est le rythme qui cède. */
    const mots = String(INTRO.texte || "").trim().split(/\s+/).filter(Boolean);
    const combienDeLettres = mots.reduce((n, m) => n + m.length, 0);

    const BUDGET = Math.max(1.6, (Number(INTRO.duree) || 4) - 0.4);
    const finVoulue = Math.max(0.72, BUDGET - 1.4);
    const pas = combienDeLettres > 1
      ? Math.max(0.012, Math.min(0.055, (finVoulue - 0.67) / (combienDeLettres - 1)))
      : 0.055;
    const finDuNom = 0.15 + Math.max(0, combienDeLettres - 1) * pas + 0.52;
    /* Les cartes partent presque sur la dernière lettre : les faire
       attendre la fin du filet donnait une seconde morte au milieu. */
    const debutDesCartes = Math.max(1.2, finDuNom + 0.1);

    /* 🚨 CHAQUE LETTRE PORTE SA PROPRE COULEUR, PRISE SUR LE DÉGRADÉ.
       ──────────────────────────────────────────────────────────────
       Le dégradé d'un titre est un fond peint sur le PARAGRAPHE, puis
       découpé à la forme des lettres. Une lettre qui se déplace emporte sa
       forme mais pas ce fond : la découpe reste où elle était, et on voit
       des tranches de couleur glisser derrière des lettres vides.

       Chaque lettre reçoit donc SON dégradé — vertical, de son éclat à son
       ombre — et sa couleur de base est prise sur le dégradé de la boutique
       là où la lettre se trouve. De loin, le nom porte les couleurs de la
       boutique ; de près, chaque lettre a du relief ; et chacune peut
       bouger sans rien emporter.

       ⚠️ Si une couleur de la boutique n'est pas un code hexadécimal — rien
       ne l'impose — « melangeCouleur » rend la première telle quelle : le
       nom devient uni, et il reste lisible. */
    let rang = 0;
    const morceaux = [];
    mots.forEach((mot, im) => {
      /* L'espace est un VRAI nœud de texte, et c'est lui qui autorise le
         passage à la ligne entre deux mots. Sans lui, cinq mots collés ne
         pourraient jamais se répartir sur deux lignes. */
      if (im) morceaux.push(" ");
      morceaux.push(
        <span key={"mot" + im} className="atelier-mot">
          {[...mot].map((lettre, il) => {
            const n = rang++;
            const ou = combienDeLettres > 1 ? n / (combienDeLettres - 1) : 0;
            const teinte = melangeCouleur(rose, violet, ou);
            return (
              <span
                key={il}
                style={{
                  display: "inline-block",
                  backgroundImage: `linear-gradient(176deg, ${melangeCouleur(teinte, "#ffffff", 0.78)} 4%, ${teinte} 46%, ${melangeCouleur(teinte, "#000000", 0.3)} 96%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  animation: `atelier-lettre-posee .52s cubic-bezier(.2,.9,.2,1) ${(0.15 + n * pas).toFixed(3)}s both`,
                }}
              >
                {lettre}
              </span>
            );
          })}
        </span>,
      );
    });

    /* L'éventail : l'inclinaison et l'écart de chaque carte selon sa place.
       Le centre est droit, les bords s'écartent — et plus une carte est au
       bord, plus elle descend, pour que l'ensemble dessine un arc et non
       une ligne.

       🚨 L'ÉCART EST EN POUR CENT DE LA CARTE, PAS EN VW.
       La carte est plafonnée à 290 px (« min(58vw, 290px) ») : sur une
       tablette, un écart exprimé en vw continuerait de grandir alors que
       les cartes, elles, ne grandissent plus. L'éventail s'ouvrirait en
       cinq cartes éparpillées. En pour cent de sa propre largeur, chaque
       carte reste à la même place relative, sur n'importe quel écran. */
    const milieu = (vues.length - 1) / 2;
    const cartes = vues.map((p, i) => {
      const ecart = i - milieu;
      const tour = (ecart * 6.5).toFixed(1);
      const cote = (-50 + ecart * 15).toFixed(1);
      const bas = (-50 + Math.abs(ecart) * 5.2).toFixed(1);
      return (
        <span
          key={p.cle || i}
          aria-hidden="true"
          style={{
            position: "absolute", left: "50%", top: "60%",
            /* 🚨 BEAUCOUP PLUS GRANDES QU'À LA PREMIÈRE VERSION : « chaque
               carte qui montre des produits doit être beaucoup plus
               grande ». De 40 % à 58 % de la largeur de l'écran, soit
               presque le double en surface. Le plafond de 290 px évite
               qu'une tablette n'en fasse des affiches. */
            width: "min(58vw, 290px)", aspectRatio: "3 / 4",
            pointerEvents: "none",
            transform: `translate(${cote}%, ${bas}%) rotate(${tour}deg)`,
            zIndex: 10 - Math.abs(Math.round(ecart)),
          }}
        >
          {/* La rotation est au parent, l'animation ici : voir l'image clé. */}
          <span
            style={{
              display: "block", position: "relative",
              width: "100%", height: "100%",
              borderRadius: 15, overflow: "hidden",
              /* 🚨 UN CADRE CLAIR, ET NON LA BORDURE DE LA BOUTIQUE.
                 Mesuré sur une vitrine sans photos : les cartes portaient le
                 dessin de secours — sombre — sur un fond sombre, avec une
                 bordure sombre. Cinq rectangles invisibles. Or c'est
                 justement une boutique NEUVE qui n'a pas encore de photos :
                 la plus belle ouverture aurait été réservée à ceux qui n'en
                 ont plus besoin. */
              border: "1px solid rgba(255,255,255,.24)",
              background: CARTE,
              boxShadow: "0 20px 44px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.35)",
              animation: `atelier-carte-posee .62s cubic-bezier(.2,.86,.3,1) ${(debutDesCartes + i * 0.14).toFixed(2)}s both`,
            }}
          >
            <img
              src={visuelProduit(p, p.famille.couleurs, p.famille.glyphe)}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Une lueur douce en haut de la carte. Sans elle, cinq photos
                posées à plat font planche de contact ; avec, elles ont du
                volume, et la lumière vient du même endroit pour toutes. */}
            <span
              style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(70% 50% at 50% 38%, rgba(255,255,255,.16), transparent 70%)",
              }}
            />
          </span>
        </span>
      );
    });

    return (
      <>
        <NomQuiTient morceaux={morceaux} finDuNom={finDuNom} />
        {cartes}
      </>
    );
  }

  /* ───── ⑧ SPÉCIAL HALLOWEEN ─────
     Le même cœur que Noël — une matière qui tombe et qui écrit le nom — et
     tout le reste est changé : des feuilles mortes qui VRILLENT au lieu de
     flocons, une pleine lune, des chauves-souris, des toiles dans les coins,
     de petites araignées qui descendent de leur fil, et des citrouilles
     allumées dont la bougie vacille.

     🚨 LES ARAIGNÉES ONT ÉTÉ DEMANDÉES NOMMÉMENT : « Halloween, des petites
     araignées ». Elles descendent VRAIMENT de leur fil — le fil part du haut
     de l'écran, l'araignée glisse dessus, dépasse un peu, puis remonte se
     caler. Une araignée posée là sans y être descendue, ce n'est qu'un
     autocollant.

     ⚠️ MÊME RÈGLE QUE NOËL POUR LE CIEL : il ne prend pas les couleurs de la
     boutique. Un Halloween bleu ciel n'est pas un Halloween. Seul le NOM
     porte le métal du vendeur.

     ⚠️ ET PAS DE COIFFE DE NEIGE ICI. Un liseré blanc sur une lettre, en
     octobre, ne veut rien dire : « coiffe » reste à faux. */
  if (style === "halloween") {
    const eclat = melangeCouleur(rose, "#ffffff", 0.82);
    const ombre = melangeCouleur(violet, "#000000", 0.35);
    const metal = `linear-gradient(176deg, ${eclat} 2%, ${rose} 46%, ${ombre} 98%)`;

    /* Les couleurs d'automne : elles ne viennent pas de la boutique. */
    const FEUILLES = ["#c2561f", "#e08b2c", "#8f3312", "#b8742a", "#6d2f10", "#d9a441"];

    const lune = (
      <span
        className="atelier-lune"
        style={{ top: "6vh", right: "9vw", width: "min(30vw, 130px)", aspectRatio: "1" }}
      >
        <b style={{ left: "26%", top: "30%", width: "22%", height: "22%" }} />
        <b style={{ left: "56%", top: "18%", width: "13%", height: "13%" }} />
        <b style={{ left: "48%", top: "58%", width: "17%", height: "17%" }} />
      </span>
    );

    /* Les plus hautes passent les premières et volent plus vite : c'est ce
       qui donne une nuée plutôt qu'une file. */
    const CHAUVES = [[9, 0.3, 5.2, 18], [16, 1.1, 6.4, 13], [5, 2.2, 4.6, 22], [22, 3.1, 7, 11]];
    const chauves = CHAUVES.map(([haut, retard, duree, taille], i) => (
      <span
        key={"c" + i}
        className="atelier-chauve"
        style={{
          top: haut + "vh", left: "-16vw",
          width: taille + "px", height: (taille * 0.52) + "px",
          animation: `atelier-vole ${duree}s linear ${retard}s infinite both`,
        }}
      />
    ));

    const toiles = [
      <span key="tg" className="atelier-toile" style={{ top: "-1vh", left: "-2vw" }} />,
      <span
        key="td"
        className="atelier-toile"
        style={{ top: "-1vh", right: "-2vw", transform: "scaleX(-1)" }}
      />,
    ];

    /* 🚨 LE FIL PART DU HAUT DE L'ÉCRAN, PAS DE L'ARAIGNÉE.
       Il est dessiné par « ::before » sur 40vh vers le haut : où qu'elle
       s'arrête, le fil la relie toujours au plafond. Un fil de longueur fixe
       aurait flotté dans le vide. */
    /* 🚨 HUIT PATTES EN DEUX SEGMENTS, AVEC LEUR COUDE.
       Les avant sont longues et tendues vers l'avant, les arrière courtes
       et repliées — c'est la silhouette qui fait reconnaître l'animal
       avant qu'on ait compté les pattes. Chaque courbe est donnée pour le
       côté gauche ; « enMiroir » fabrique la droite en retournant les
       abscisses autour de l'axe du corps (x = 20).

       Le second nombre est la flexion de la patte : opposée d'un côté à
       l'autre, pour que la bête n'ait pas l'air de ramer. */
    const PATTES = [
      ["M20,18 C14,11 8,8 4,10 C2,11 1,14 2,17", -3.2],
      ["M20,19 C13,15 7,14 3,17 C1,19 1,22 2,25", 2.6],
      ["M20,20 C13,19 8,21 4,25 C2,27 2,29 3,31", -2.2],
      ["M20,21 C15,23 11,26 9,30 C8,32 8,33 9,34", 1.8],
    ];
    const enMiroir = (d) =>
      d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,
        (m, x, y) => (40 - parseFloat(x)) + "," + y);

    /* x en %, longueur du fil en vh, échelle, retard, dépassement en px */
    const ARAIGNEES = [[24, 19, 1, 0.45, 16], [70, 11, 0.72, 0.95, 11], [46, 26, 1.28, 1.5, 22]];
    const araignees = ARAIGNEES.map(([x, fil, ech, retard, sur], i) => (
      <span
        key={"ar" + i}
        className="atelier-chute"
        style={{
          left: x + "%",
          "--fil": fil + "vh", "--sur": sur,
          animation: `atelier-descend-fil 1.7s cubic-bezier(.26,.72,.3,1) ${retard}s both`,
        }}
      >
        <span
          className="atelier-pendule"
          style={{
            animation: `atelier-pendule 4.2s ease-in-out ${(retard + 1.7).toFixed(2)}s infinite both`,
          }}
        >
          <span className="atelier-fil" style={{ height: fil + "vh" }} />
          <span style={{ position: "absolute", left: 0, top: fil + "vh" }}>
            <svg
              width={(40 * ech).toFixed(0)}
              height={(34 * ech).toFixed(0)}
              viewBox="0 0 40 34"
              style={{ display: "block", marginLeft: (-20 * ech).toFixed(1) + "px" }}
            >
              <defs>
                <radialGradient id={"atelier-abdomen-" + i} cx=".34" cy=".28">
                  <stop offset="0" stopColor="#4a4055" />
                  <stop offset=".55" stopColor="#241a2e" />
                  <stop offset="1" stopColor="#0d0812" />
                </radialGradient>
              </defs>
              {PATTES.map(([d, flex], k) => [
                <path
                  key={"g" + k}
                  className="atelier-patte"
                  d={d}
                  stroke="#1b1422"
                  strokeWidth="1.25"
                  style={{
                    "--flex": flex + "deg",
                    animation: `atelier-patte 1.6s ease-in-out ${(retard + k * 0.18).toFixed(2)}s infinite both`,
                  }}
                />,
                <path
                  key={"d" + k}
                  className="atelier-patte"
                  d={enMiroir(d)}
                  stroke="#241b2e"
                  strokeWidth="1.25"
                  style={{
                    "--flex": (-flex) + "deg",
                    animation: `atelier-patte 1.6s ease-in-out ${(retard + k * 0.18 + 0.09).toFixed(2)}s infinite both`,
                  }}
                />,
              ])}
              <ellipse cx="20" cy="24" rx="6.6" ry="8.2" fill={"url(#atelier-abdomen-" + i + ")"} />
              <ellipse cx="17.6" cy="20.4" rx="2" ry="2.9" fill="#fff" opacity=".16"
                transform="rotate(-24 17.6 20.4)" />
              <path d="M20,17 q2.6,3 0,6 q-2.6,-3 0,-6" fill="#0a0610" opacity=".5" />
              <ellipse cx="20" cy="15.4" rx="4.3" ry="3.5" fill="#2a2034" />
              <ellipse cx="18.8" cy="14.2" rx="1.5" ry="1.1" fill="#fff" opacity=".12"
                transform="rotate(-20 18.8 14.2)" />
              <circle cx="18.4" cy="13.2" r=".62" fill="#0a0610" />
              <circle cx="21.6" cy="13.2" r=".62" fill="#0a0610" />
              <circle cx="18.2" cy="13" r=".2" fill="#cfe0f2" opacity=".8" />
              <circle cx="21.4" cy="13" r=".2" fill="#cfe0f2" opacity=".8" />
            </svg>
          </span>
        </span>
      </span>
    ));

    const CITROUILLES = [[6, 11, 0.55], [68, 14, 0.75], [38, 8.5, 0.65]];
    const citrouilles = CITROUILLES.map(([x, h, d], i) => (
      <span
        key={"ci" + i}
        className="atelier-citrouille"
        style={{
          left: x + "%", width: (h * 1.22) + "vh", height: h + "vh",
          animation: `atelier-pousse .9s cubic-bezier(.2,.86,.3,1) ${d}s both`,
        }}
      >
        <b
          className="atelier-oeil"
          style={{
            left: "22%", top: "32%", width: "19%", height: "17%",
            animation: `atelier-vacille 1.7s ease-in-out ${(d + 0.4).toFixed(2)}s infinite both`,
          }}
        />
        <b
          className="atelier-oeil"
          style={{
            left: "59%", top: "32%", width: "19%", height: "17%",
            animation: `atelier-vacille 1.7s ease-in-out ${(d + 0.55).toFixed(2)}s infinite both`,
          }}
        />
        <b
          className="atelier-bouche"
          style={{
            left: "22%", top: "58%", width: "56%", height: "20%",
            animation: `atelier-vacille 1.7s ease-in-out ${(d + 0.2).toFixed(2)}s infinite both`,
          }}
        />
      </span>
    ));

    /* Soixante-dix feuilles : moins que la neige, parce qu'elles sont plus
       grosses et qu'elles vrillent. Au-delà, l'écran devient un tapis. */
    const feuilles = Array.from({ length: 70 }, (_, i) => {
      const taille = (4 + ((i * 7) % 5)).toFixed(0);
      return (
        <span
          key={"fe" + i}
          className="atelier-tombe"
          style={{
            left: (((i * 41) % 106) - 3) + "%",
            width: taille + "px", height: (taille * 0.72).toFixed(1) + "px",
            background: FEUILLES[i % FEUILLES.length],
            /* Une feuille n'est pas ronde : un coin pointu, un coin
               arrondi, et la vrille fait le reste. */
            borderRadius: "0 60% 0 60%",
            "--der": ((((i % 2) ? 1 : -1) * (10 + ((i * 13) % 40)))) + "px",
            "--vrille": (((i % 2) ? 1 : -1) * (320 + ((i * 29) % 420))) + "deg",
            "--vif": (0.45 + ((i * 11) % 50) / 100).toFixed(2),
            animation: `atelier-tombe ${(3 + ((i * 19) % 40) / 10).toFixed(2)}s linear ${(((i * 23) % 36) / 10).toFixed(2)}s both`,
          }}
        />
      );
    });

    /* La lune, les toiles, les chauves-souris, les citrouilles et la brume
       ne se dessinent QUE s'il n'y a pas de photo. Les araignées, elles,
       restent dans les deux cas : elles sont DEVANT le décor. */
    const dessine = (
      <>
        {lune}
        {toiles}
        {chauves}
        {citrouilles}
        <span
          className="atelier-brume"
          style={{ animation: "atelier-brume 3s ease-out .9s both" }}
        />
      </>
    );

    return (
      <div
        className={INTRO.fond ? "atelier-ciel-photo" : "atelier-ciel-halloween"}
        aria-hidden="true"
      >
        {decorDeSaison(dessine)}
        <NomQuiTient
          morceaux={nomQuiSEcrit(INTRO.texte, { duree: INTRO.duree, metal, coiffe: false })}
          haut="40vh"
          hauteurMax="26vh"
          styleZone={{ zIndex: 4 }}
        />
        {araignees}
        {feuilles}
      </div>
    );
  }

  /* ───── ⑨ SPÉCIAL NOUVEL AN ─────
     Même cœur que les deux autres saisons — une matière qui tombe et qui
     écrit le nom — mais ce sont des CONFETTIS, et il s'y ajoute ce
     qu'aucune autre ouverture n'a : des feux d'artifice qui éclatent.

     🚨 LA FUSÉE MONTE D'ABORD. Un éclat qui paraît d'un coup n'est pas un
     feu d'artifice, c'est une étoile. Ce qui fait la chose, c'est
     l'ATTENTE : le point qui monte, qui s'étire, qui s'éteint — et
     seulement après, la gerbe. Une seconde pour un dixième de seconde.

     🚨 ET LES GERBES SONT MULTICOLORES, demandé nommément : « les gerbes
     qui retombent doivent être de plusieurs couleurs comme des confettis ».
     Une gerbe d'une seule teinte fait étincelle de soudure ; c'est le
     mélange qui fait la fête. Les couleurs ne viennent donc PAS de la
     boutique — seul le nom porte son métal.

     ⚠️ ET ELLE MARCHE SUR UNE BOUTIQUE VIDE, comme les deux autres
     saisons : ni photos, ni logo, ni articles. */
  if (style === "nouvelan") {
    const eclatM = melangeCouleur(rose, "#ffffff", 0.82);
    const ombreM = melangeCouleur(violet, "#000000", 0.35);
    const metal = `linear-gradient(176deg, ${eclatM} 2%, ${rose} 46%, ${ombreM} 98%)`;

    const CONFETTIS = ["#ffd166", "#ff5d7a", "#6cc3ff", "#7ee081",
      "#ff9ad5", "#fff6de", "#ffa94d", "#b89cff"];

    /* x en %, hauteur de montée en vh, retard, rayon de gerbe en vw.

       🚨 ELLES ÉCLATENT HAUT, ET C'EST UNE CORRECTION PAYÉE SUR CAPTURE.
       Au premier jet elles partaient de 58vh et montaient de 11 à 19vh :
       toutes les gerbes éclataient donc entre 39 et 47vh — c'est-à-dire PILE
       DANS LA BANDE DU NOM, qui commence à 40vh. Le flash d'une gerbe lavait
       le nom au moment même où il s'écrivait.

       Elles partent maintenant du bas de l'écran et montent de 70 à 86vh :
       les gerbes vivent entre 10 et 26vh, dans le ciel, loin au-dessus du
       nom. ⚠️ Si la position du nom change un jour, ces hauteurs sont à
       revoir avec.

       Cinq tirs étalés sur trois secondes : deux qui partent ensemble font
       un bouquet final, et un bouquet final au début ne laisse plus rien à
       attendre. */
    const TIRS = [[22, 74, 0.35, 24], [68, 86, 1.05, 29], [44, 70, 1.95, 20],
      [82, 80, 2.75, 26], [12, 76, 3.3, 22]];
    const PARTICULES = 16;

    const feux = TIRS.flatMap(([x, mh, quand, rayon], i) => {
      const haut = 96 - mh;
      const eclats = Array.from({ length: PARTICULES }, (_, k) => {
        const c = CONFETTIS[(i * 3 + k) % CONFETTIS.length];
        return (
          <span
            key={"e" + i + "-" + k}
            className="atelier-eclat"
            style={{
              "--ang": ((360 / PARTICULES) * k).toFixed(1) + "deg",
              "--d": (rayon * (0.55 + ((k * 37) % 45) / 100)).toFixed(1) + "vw",
              background: c,
              boxShadow: `0 0 9px ${c}, -7px 0 7px -3px ${c}`,
              animation: `atelier-eclat 2.1s cubic-bezier(.12,.72,.28,1) ${(quand + 0.95 + (k % 3) * 0.03).toFixed(2)}s both`,
            }}
          />
        );
      });
      return [
        <span
          key={"f" + i}
          className="atelier-fusee"
          style={{
            left: x + "%", top: "96vh",
            "--mh": "-" + mh + "vh",
            boxShadow: `0 0 8px ${CONFETTIS[i % CONFETTIS.length]}`,
            animation: `atelier-fusee 1s cubic-bezier(.2,.5,.4,1) ${quand}s both`,
          }}
        />,
        <span
          key={"g" + i}
          className="atelier-gerbe"
          style={{
            left: x + "%", top: haut + "vh",
            animation: `atelier-gerbe 2.1s ease-out ${(quand + 0.95).toFixed(2)}s both`,
          }}
        >
          <span
            className="atelier-flash-feu"
            style={{
              animation: `atelier-flash-feu .5s ease-out ${(quand + 0.95).toFixed(2)}s both`,
            }}
          />
          {eclats}
        </span>,
      ];
    });

    /* Soixante confettis : plus gros que des flocons, et ils vrillent sur
       deux axes — c'est ce qui les fait lire comme du papier. */
    const confettis = Array.from({ length: 60 }, (_, i) => {
      const l = 3 + ((i * 7) % 5);
      return (
        <span
          key={"c" + i}
          className="atelier-tombe atelier-confetti"
          style={{
            left: (((i * 41) % 106) - 3) + "%",
            width: l + "px", height: (l * 0.55).toFixed(1) + "px",
            background: CONFETTIS[i % CONFETTIS.length],
            borderRadius: 1,
            "--der": ((((i % 2) ? 1 : -1) * (10 + ((i * 13) % 38)))) + "px",
            "--vrille": ((((i % 2) ? 1 : -1) * (420 + ((i * 29) % 500)))) + "deg",
            "--vif": (0.5 + ((i * 11) % 45) / 100).toFixed(2),
            animation: `atelier-tombe ${(2.8 + ((i * 19) % 34) / 10).toFixed(2)}s linear ${(((i * 23) % 32) / 10).toFixed(2)}s both`,
          }}
        />
      );
    });

    const dessine = (
      <>
        <span
          className="atelier-congere"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 100%, rgba(255,214,130,.4), rgba(255,214,130,.1) 64%, transparent)",
            animation: "atelier-congere 2.6s ease-out .9s both",
          }}
        />
      </>
    );

    return (
      <div
        className={INTRO.fond ? "atelier-ciel-photo" : "atelier-ciel-nouvelan"}
        aria-hidden="true"
      >
        {decorDeSaison(dessine)}
        <NomQuiTient
          morceaux={nomQuiSEcrit(INTRO.texte, {
            duree: INTRO.duree, metal, coiffe: false, confetti: CONFETTIS,
          })}
          haut="40vh"
          hauteurMax="26vh"
          styleZone={{ zIndex: 4 }}
        />
        {feux}
        {confettis}
      </div>
    );
  }

  /* ───── ⑦ SPÉCIAL NOËL ─────
     Une nuit bleue étoilée, une guirlande qui clignote, trois boules
     suspendues qui se balancent, six sapins enneigés à différentes
     distances — et une neige abondante dont chaque flocon vise sa lettre.

     🚨 ELLE MARCHE POUR TOUT LE MONDE, et c'est son plus gros avantage
     commercial. Ni photos, ni logo, ni catalogue rempli : un client qui
     ouvre sa boutique aujourd'hui peut la prendre. Les cartes et le mur
     demandent du stock ; celle-ci ne demande qu'un nom.

     ⚠️ ELLE EST SAISONNIÈRE, et rien ne l'éteint toute seule pour
     l'instant. Une boutique avec des sapins en mars est pire que pas de
     sapins du tout — c'est au vendeur de la retirer, et il faudra un jour
     décider si elle doit s'allumer et s'éteindre à des dates.

     ⚠️ LE CIEL EST FIXE, PAS AUX COULEURS DE LA BOUTIQUE. Un Noël vert
     pomme ou rose fluo n'est plus un Noël. Seul le NOM prend le métal de la
     boutique — c'est ce qui la relie au reste, et ça suffit. */
  if (style === "noel") {
    const eclat = melangeCouleur(rose, "#ffffff", 0.82);
    const ombre = melangeCouleur(violet, "#000000", 0.35);
    const metal = `linear-gradient(176deg, ${eclat} 2%, ${rose} 46%, ${ombre} 98%)`;

    /* Les couleurs d'une guirlande : elles ne viennent pas de la boutique.
       Voir le commentaire ci-dessus. */
    const FEU = ["#ff5d5d", "#ffd166", "#7ee081", "#6cc3ff", "#ff9ad5"];

    const etoiles = Array.from({ length: 22 }, (_, i) => (
      <span
        key={"e" + i}
        className="atelier-etoile"
        style={{
          left: (3 + ((i * 29) % 94)) + "%",
          top: (1.5 + ((i * 17) % 14)) + "vh",
          animation: `atelier-scintille 2.6s ease-in-out ${((i * 13) % 26) / 10}s infinite both`,
        }}
      />
    ));

    const ampoules = Array.from({ length: 13 }, (_, i) => {
      const p = i / 12;
      const c = FEU[i % FEU.length];
      return (
        <span
          key={"a" + i}
          className="atelier-ampoule"
          style={{
            left: `calc(${(p * 100).toFixed(1)}% - 4px)`,
            top: (1.2 + Math.sin(p * Math.PI) * 5.2).toFixed(1) + "vh",
            background: `radial-gradient(circle at 34% 28%, #fff, ${c})`,
            boxShadow: `0 0 12px ${c}`,
            animation: `atelier-clignote 1.9s ease-in-out ${(i * 0.17).toFixed(2)}s infinite both`,
          }}
        />
      );
    });

    const BOULES = [[16, "#e05a5a", 0.5], [50, "#e8c16a", 0.66], [84, "#6fb6d8", 0.58]];
    const boules = BOULES.map(([x, c, d], i) => (
      <span
        key={"b" + i}
        className="atelier-boule"
        style={{
          left: `calc(${x}% - 13px)`,
          top: (7.6 + i * 1.7) + "vh",
          animation: `atelier-pend .9s cubic-bezier(.2,.86,.3,1) ${d}s both, atelier-balance 3.4s ease-in-out ${(d + 0.9).toFixed(2)}s infinite both`,
        }}
      >
        <span
          style={{
            background: `radial-gradient(130% 130% at 32% 24%, #fff, ${c} 52%, #000a)`,
            boxShadow: `0 6px 16px rgba(0,0,0,.6), 0 0 18px ${c}`,
          }}
        />
      </span>
    ));

    /* Les plus loin d'abord : plus petits, plus sombres, plus transparents.
       C'est ce qui donne une forêt au lieu d'une rangée. */
    const SAPINS = [[4, 12, "#16321f", 0.55, 0.42], [20, 15, "#1b4027", 0.75, 0.5],
      [-6, 17.5, "#20492d", 0.9, 0.6], [62, 13.8, "#1a3d25", 0.8, 0.52],
      [80, 18.5, "#235231", 1, 0.64], [44, 11, "#152e1c", 0.62, 0.46]];
    const sapins = SAPINS.map(([x, h, c, op, d], i) => (
      <span
        key={"s" + i}
        className="atelier-sapin"
        style={{
          left: x + "%", width: (h * 0.78) + "vh", height: h + "vh",
          background: c, opacity: op,
          animation: `atelier-pousse .9s cubic-bezier(.2,.86,.3,1) ${d}s both`,
        }}
      >
        {Array.from({ length: 4 }, (_, k) => (
          <b key={"n" + k} style={{ left: (26 + ((i * 11 + k * 17) % 48)) + "%", top: (28 + ((i * 7 + k * 13) % 48)) + "%" }} />
        ))}
        {Array.from({ length: 3 }, (_, k) => (
          <u
            key={"l" + k}
            style={{
              left: (30 + ((i * 13 + k * 19) % 40)) + "%",
              top: (34 + ((i * 5 + k * 23) % 44)) + "%",
              color: FEU[(i + k) % FEU.length],
              animation: `atelier-clignote 2.2s ease-in-out ${((i + k) * 0.31).toFixed(2)}s infinite both`,
            }}
          />
        ))}
      </span>
    ));

    /* 🚨 QUATRE-VINGT-DIX FLOCONS, ET C'EST LE CHIFFRE QU'IL A CHOISI.
       C'est aussi le seul réglage qui coûte vraiment au téléphone : les
       sapins et la guirlande ne bougent presque pas, la neige si. Si un
       jour ça saccade, c'est ce nombre qu'on baisse. */
    const neige = Array.from({ length: 90 }, (_, i) => {
      const taille = (1.3 + ((i * 7) % 36) / 10).toFixed(1);
      return (
        <span
          key={"f" + i}
          className="atelier-tombe"
          style={{
            left: (((i * 37) % 104) - 2) + "%",
            width: taille + "px", height: taille + "px",
            "--der": ((((i % 2) ? 1 : -1) * (6 + ((i * 11) % 32)))) + "px",
            "--vif": (0.3 + ((i * 13) % 65) / 100).toFixed(2),
            boxShadow: `0 0 ${taille > 3 ? 7 : 4}px rgba(224,240,255,.9)`,
            animation: `atelier-tombe ${(2.4 + ((i * 17) % 36) / 10).toFixed(2)}s linear ${(((i * 23) % 34) / 10).toFixed(2)}s both`,
          }}
        />
      );
    });

    /* Le ciel, les étoiles, la guirlande, les boules, les sapins et la
       congère : tout cela ne se dessine QUE s'il n'y a pas de photo. */
    const dessine = (
      <>
        {etoiles}
        <div className="atelier-guirlande">{ampoules}</div>
        {boules}
        {sapins}
        <span
          className="atelier-congere"
          style={{ animation: "atelier-congere 2.6s ease-out .9s both" }}
        />
      </>
    );

    return (
      <div
        className={INTRO.fond ? "atelier-ciel-photo" : "atelier-ciel-noel"}
        aria-hidden="true"
      >
        {decorDeSaison(dessine)}
        <NomQuiTient
          morceaux={nomQuiSEcrit(INTRO.texte, { duree: INTRO.duree, metal, coiffe: true })}
          haut="40vh"
          hauteurMax="26vh"
          styleZone={{ zIndex: 4 }}
        />
        {neige}
      </div>
    );
  }

  /* ───── ⑥ LE MUR QUI S'OUVRE ─────
     La boutique commence par un mur plein écran de ses articles. Un éclair
     le fend, les deux battants s'ouvrent vers le visiteur, le nom monte du
     fond, et la caméra passe entre eux.

     🚨 C'EST LE CATALOGUE QUI FAIT LE MUR, et c'est ce qui la rend
     différente des cartes : les cartes montrent CINQ articles choisis ; le
     mur en montre quinze, et c'est la MASSE qui parle. « Il y a du stock
     ici » se comprend avant même qu'on ait lu le nom.

     ⚠️ ET C'EST AUSSI SA FRAGILITÉ. « Il faut quand même un certain nombre
     de produits pour que ça rende bien. » Avec cinq articles, les quinze
     cases les répètent trois fois et le damier se voit immédiatement. Le
     nombre conseillé vit sur la fiche (OUVERTURES.mur.minArticles) et
     l'écran de l'atelier le dit AVANT que le vendeur choisisse.

     ⚠️ SANS AUCUN ARTICLE, on ne montre que le nom. Un mur de zéro case est
     un écran noir, et deux battants qui s'ouvrent sur rien. */
  if (style === "mur") {
    const choisis = [...VEDETTES, ...SELECTION_CHEF, ...TOUS_PRODUITS];
    const vus = [];
    for (const p of choisis) {
      if (vus.some((v) => v.cle === p.cle)) continue;
      vus.push(p);
    }

    /* Quinze cases : trois colonnes, cinq rangées. Au-delà, les articles
       deviennent des timbres ; en deçà, le mur n'est plus un mur. */
    const CASES = 15;
    const tuiles = vus.length
      ? Array.from({ length: CASES }, (_, i) => vus[i % vus.length])
      : [];

    /* ⚠️ LE MÊME MUR EST RENDU DEUX FOIS, une par battant, et chacun n'en
       montre que sa moitié par un débordement masqué. Les deux moitiés
       doivent être issues de la MÊME suite d'articles, sinon la cassure se
       verrait : ce serait deux murs différents collés l'un à l'autre. */
    const mur = (
      /* ⚠️ LA RESPIRATION EST SUR LE MUR, PAS SUR UNE ENVELOPPE.
         Un « transform » posé sur un parent, même statique, devient le
         repère de tout ce qui est positionné en absolu dessous : le mur
         se serait accroché à une boîte de hauteur nulle au lieu du
         battant, et il aurait purement disparu. */
      <div
        className="atelier-mur"
        style={{ animation: "atelier-mur-respire 2.8s ease-out both" }}
      >
        {tuiles.map((p, i) => (
          <span className="atelier-tuile" key={"t" + i}>
            <img
              src={visuelProduit(p, p.famille.couleurs, p.famille.glyphe)}
              alt=""
              /* 🚨 CHAQUE CASE EST CADRÉE DIFFÉREMMENT, ET CE N'EST PAS UNE
                 COQUETTERIE.

                 Mesuré sur banc le 16 octobre 2026 : une boutique de dix
                 articles SANS PHOTOS ne rend que TROIS dessins distincts —
                 le dessin de secours est celui de la FAMILLE, pas de
                 l'article. Quinze cases tirées de trois images, toutes
                 cadrées pareil, ça ne fait pas un mur : ça fait un papier
                 peint, et on voit le motif avant de voir la boutique.

                 Décaler le cadrage change la portion visible de chaque
                 image : deux cases de la même photo ne se ressemblent plus.
                 Ça ne coûte rien — aucun élément de plus, aucun filtre —
                 et ça suffit à casser le motif. */
              style={{
                objectPosition: ["50% 50%", "36% 44%", "64% 56%", "46% 66%", "58% 34%"][i % 5],
              }}
            />
          </span>
        ))}
      </div>
    );

    return (
      <div
        className="atelier-porte"
        aria-hidden="true"
        style={{ animation: "atelier-porte-traverse 1.1s cubic-bezier(.55,0,.4,1) 2.9s both" }}
      >
        <NomQuiTient
          morceaux={motsInsecables(INTRO.texte)}
          haut="38vh"
          hauteurMax="30vh"
          styleZone={{ zIndex: 2 }}
          styleNom={{
            backgroundImage: `linear-gradient(176deg, ${melangeCouleur(rose, "#ffffff", 0.82)} 2%, ${rose} 46%, ${melangeCouleur(violet, "#000000", 0.35)} 98%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text",
            color: "transparent",
            animation: "atelier-nom-du-fond 1.6s cubic-bezier(.2,.9,.2,1) 1.55s both",
          }}
        />

        <span
          style={{
            position: "absolute", top: "40vh", left: "50%",
            width: "min(90vw, 360px)", aspectRatio: "1",
            marginLeft: "calc(min(90vw, 360px) / -2)", marginTop: "calc(min(90vw, 360px) / -2)",
            borderRadius: "50%", zIndex: 1, opacity: 0.5, pointerEvents: "none",
            background: `radial-gradient(closest-side, ${rose}4D, transparent)`,
            animation: "atelier-lueur-or 1.5s ease-out 1.7s both",
          }}
        />

        {tuiles.length > 0 && (
          <>
            <div className="atelier-battant atelier-battant-g"
              style={{ animation: "atelier-battant-g 1.6s cubic-bezier(.52,0,.22,1) 1s both" }}>
            {mur}
            </div>
            <div className="atelier-battant atelier-battant-d"
              style={{ animation: "atelier-battant-d 1.6s cubic-bezier(.52,0,.22,1) 1s both" }}>
            {mur}
            </div>
            <span className="atelier-fente-lumiere"
              style={{ animation: "atelier-fente-eclair 1.2s ease-out .92s both" }} />
            <span className="atelier-eclat-porte"
              style={{ animation: "atelier-eclat-porte .5s ease-out .95s both" }} />
          </>
        )}
      </div>
    );
  }

  /* ───── ⑤ LA DORURE ─────
     Tout est gravé dans le noir, presque éteint : un guilloché au fond, un
     cadre, un médaillon, le nom et son reflet. Une large lame de lumière
     traverse l'écran en diagonale et les allume l'un après l'autre, dans
     l'ordre où elle les rencontre.

     🚨 C'EST LA PREMIÈRE OUVERTURE OÙ RIEN NE BOUGE. Le sceau se pose, la
     fente s'écarte, les lamelles montent, les cartes arrivent du bas :
     toutes DÉPLACENT quelque chose. Ici, chaque chose est déjà à sa place
     dès la première image — c'est la LUMIÈRE qui se déplace. C'est ce qui
     fait « bijouterie » plutôt que « application », et c'est ce qui la rend
     vendable.

     ⚠️ ELLE TIENT SANS LOGO, ET C'EST LE CAS LE PLUS FRÉQUENT. Mesuré le
     16 octobre 2026 sur les cinq boutiques en service : TROIS n'ont aucun
     fichier de logo — dont Amira Luxury, la boutique de luxe. Le médaillon
     prend donc le logo s'il existe, sinon l'emoji de la boutique, sinon
     l'initiale de son nom. Le même ordre que l'icône d'installation.

     ⚠️ LE MÉDAILLON S'ALLUME APRÈS LE NOM, ET C'EST UNE QUESTION DE
     GÉOMÉTRIE. La lame est inclinée de 19° vers la droite : son haut est donc
     EN AVANCE sur son bas, ce qui veut dire qu'elle atteint le haut de
     l'écran EN DERNIER. Le médaillon est au-dessus du nom : il doit donc
     s'allumer après lui. Mesuré sur banc : avec les retards d'origine, les
     deux culminaient ensemble, et on sentait que l'allumage ne suivait rien.

     ⚠️ UN LOGO EN PHOTO NE DEVIENT PAS DE L'OR. On ne peut pas doré une
     image : elle garde ses couleurs, sertie dans l'anneau. C'est la lame
     qui l'éclaire au passage, comme elle éclaire tout le reste. */
  if (style === "dorure") {
    /* Le métal, tiré des deux couleurs de la boutique : son éclat en haut,
       sa teinte au milieu, son ombre en bas. Une boutique rose a de l'or
       rose, une boutique verte a du métal vert — et aucune n'a besoin de
       régler quoi que ce soit. */
    const eclat = melangeCouleur(rose, "#ffffff", 0.82);
    const ombre = melangeCouleur(violet, "#000000", 0.35);
    const metal = `linear-gradient(176deg, ${eclat} 2%, ${rose} 44%, ${ombre} 98%)`;
    const lameEtMetal = `linear-gradient(100deg, transparent 36%, rgba(255,255,255,.95) 50%, transparent 64%), ${metal}`;

    /* Le signe du médaillon : le logo, puis l'emoji, puis l'initiale. */
    const logo = String(BOUTIQUE.logo || "").trim();
    const emoji = String(BOUTIQUE.emoji || "").trim();
    const initiale = (String(BOUTIQUE.nom || "?").trim()[0] || "?").toUpperCase();
    /* 🚨 LE LOGO EST SERTI, IL NE REMPLIT PAS LE MEDAILLON.
       Mesure sur capture le 16 octobre 2026 : a 100 % de largeur, la photo
       recouvrait le disque jusqu'au bord et l'anneau d'or disparaissait
       dessous. On ne voyait plus un medaillon : on voyait une photo ronde.
       C'est l'or autour qui fait le bijou — on laisse donc 11 % de marge,
       et la photo se pose DEDANS. */
    const dedans = logo
      ? (
        <span
          style={{
            display: "block", width: "78%", height: "78%",
            borderRadius: "50%", overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.5)",
          }}
        >
          <img
            src={logo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </span>
      ) : (
        <span
          style={{
            fontSize: "min(10vw, 42px)", lineHeight: 1,
            fontFamily: TITRE, color: ENCRE(rose),
          }}
        >
          {emoji || initiale}
        </span>
      );

    /* 🚨 « marginLeft » ET NON « translateX » POUR CENTRER.
       Le médaillon et son onde portent tous deux une animation qui écrit
       dans « transform ». Un « translateX(-50%) » posé en style serait
       écrasé par la première image clé, et les deux partiraient se coller
       au bord droit. La marge, elle, ne se fait jamais écraser. */
    const tailleMed = "min(23vw, 100px)";
    const tailleAnneau = "min(29vw, 126px)";

    const grains = Array.from({ length: 18 }, (_, i) => {
      const x = (6 + ((i * 37) % 88)).toFixed(1);
      const taille = (1.6 + ((i * 7) % 5) * 0.6).toFixed(1);
      const derive = (((i % 2) ? 1 : -1) * (6 + ((i * 11) % 20))).toFixed(0);
      const retard = (0.1 + ((i * 13) % 26) / 10).toFixed(2);
      const duree = (2.6 + ((i * 17) % 20) / 10).toFixed(2);
      return (
        <span
          key={"grain" + i}
          aria-hidden="true"
          style={{
            position: "absolute", bottom: "-2vh", left: x + "%",
            width: taille + "px", height: taille + "px", borderRadius: "50%",
            background: rose, opacity: 0, zIndex: 5, pointerEvents: "none",
            "--derive": derive + "px",
            animation: `atelier-grain-or ${duree}s linear ${retard}s both`,
          }}
        />
      );
    });

    /* Les étincelles sont posées SUR LE CHEMIN de la lame, et leur retard
       suit sa progression : une étincelle qui claque là où il n'y a pas de
       lumière se voit tout de suite comme un ajout. */
    const PLACES = [[24, 46, 0.95], [46, 34, 1.2], [62, 24, 1.45], [36, 17, 1.68], [74, 40, 1.3], [18, 28, 1.58]];
    const etincelles = PLACES.map(([x, y, quand], i) => (
      <span
        key={"etin" + i}
        aria-hidden="true"
        className="atelier-etincelle"
        style={{
          left: x + "%", top: y + "vh",
          background: "radial-gradient(circle, #fff 0 22%, " + eclat + " 30%, transparent 70%)",
          animation: `atelier-etincelle .85s ease-out ${quand}s both`,
        }}
      />
    ));

    const trait = (cle, style, retard, horizontal) => (
      <span
        key={cle}
        aria-hidden="true"
        style={{
          position: "absolute", pointerEvents: "none",
          background: horizontal
            ? `linear-gradient(90deg, transparent, ${rose}, transparent)`
            : `linear-gradient(180deg, transparent, ${rose}, transparent)`,
          transformOrigin: "center",
          opacity: horizontal ? 0.55 : 0.4,
          animation: `atelier-trait-${horizontal ? "h" : "v"} .9s ease-out ${retard}s both`,
          ...style,
        }}
      />
    );

    const reflet = (
      <p
        aria-hidden="true"
        style={{
          fontFamily: TITRE, margin: 0, lineHeight: 1.14,
          letterSpacing: ".10em", textIndent: ".10em",
          fontSize: "var(--taille-nom, 9.8vw)",
          backgroundImage: lameEtMetal,
          backgroundSize: "240% 100%, 100% 100%",
          backgroundPosition: "-65% 0, 0 0",
          backgroundRepeat: "no-repeat",
          WebkitBackgroundClip: "text", backgroundClip: "text",
          color: "transparent",
          opacity: 0.2,
          /* 🚨 LE MIROIR SE FAIT SUR PLACE, PAS AUTOUR DU HAUT.

             Mesuré sur banc le 16 octobre 2026 : avec « transformOrigin:
             center top », le reflet remontait PILE SUR LE NOM — deux textes
             l'un sur l'autre, et aucun reflet nulle part. Les deux boîtes
             mesuraient exactement le même rectangle, ce qui est le signe le
             plus net de cette faute.

             L'origine par défaut, elle, laisse la boîte où elle est — juste
             sous le nom, puisque le reflet le suit dans le flux — et ne
             retourne que son contenu. C'est exactement ce qu'on veut.

             ⚠️ ET LE MASQUE BASCULE AVEC. Il est peint dans la boîte, puis
             tout est retourné : un dégradé « vers le bas » finit donc par
             effacer le reflet DU CÔTÉ DU NOM et le laisser plein au loin —
             l'inverse exact d'un reflet. On l'écrit donc « vers le haut ». */
          transform: "scaleY(-1)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,.6), transparent 72%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,.6), transparent 72%)",
          animation: "atelier-dore-reflet 1.9s cubic-bezier(.45,0,.25,1) 1.02s both",
        }}
      >
        {INTRO.texte}
      </p>
    );

    return (
      <>
        <span className="atelier-guilloche" aria-hidden="true" />
        <span
          aria-hidden="true"
          style={{
            position: "absolute", top: "26vh", left: "50%",
            width: "min(86vw, 340px)", aspectRatio: "1",
            marginLeft: "calc(min(86vw, 340px) / -2)",
            borderRadius: "50%", pointerEvents: "none", opacity: 0.5,
            background: `radial-gradient(closest-side, ${rose}4D, transparent)`,
            animation: "atelier-lueur-or 2.6s ease-in-out 1.5s both",
          }}
        />

        {trait("cadre-h", { top: "4vh", left: "5vw", right: "5vw", height: 1 }, 0.55, true)}
        {trait("cadre-b", { bottom: "4vh", left: "5vw", right: "5vw", height: 1 }, 0.7, true)}
        {trait("cadre-g", { left: "5vw", top: "4vh", bottom: "4vh", width: 1 }, 0.8, false)}
        {trait("cadre-d", { right: "5vw", top: "4vh", bottom: "4vh", width: 1 }, 0.8, false)}

        <span
          aria-hidden="true"
          style={{
            position: "absolute", top: "calc(24vh - 13px)", left: "50%",
            width: tailleAnneau, aspectRatio: "1",
            marginLeft: "calc(" + tailleAnneau + " / -2)",
            borderRadius: "50%", border: "1px solid " + rose,
            opacity: 0, pointerEvents: "none",
            animation: "atelier-onde-or 1.4s cubic-bezier(.2,.8,.3,1) 1.75s both",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "24vh", left: "50%",
            width: tailleMed, aspectRatio: "1",
            marginLeft: "calc(" + tailleMed + " / -2)",
            borderRadius: "50%", overflow: "hidden",
            display: "grid", placeItems: "center", pointerEvents: "none",
            background: `radial-gradient(130% 130% at 34% 26%, ${eclat}, ${rose} 54%, ${ombre})`,
            boxShadow: "0 12px 32px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.45)",
            animation: "atelier-parait-or .5s ease-out .35s both, atelier-allume-or 1.1s ease-out 1.6s both",
          }}
        >
          {dedans}
        </div>

        <NomQuiTient
          morceaux={motsInsecables(INTRO.texte)}
          styleNom={{
            backgroundImage: lameEtMetal,
            backgroundSize: "240% 100%, 100% 100%",
            backgroundPosition: "-65% 0, 0 0",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text", backgroundClip: "text",
            color: "transparent",
            animation: "atelier-dore 1.9s cubic-bezier(.45,0,.25,1) .95s both",
          }}
          haut="41vh"
          hauteurMax="34vh"
          dessous={reflet}
        />

        {grains}
        {etincelles}
        <span className="atelier-lame" aria-hidden="true" />
      </>
    );
  }

  /* ───── ③ LES LAMELLES ─────
     Le nom paraît, puis le noir s'en va par six bandes verticales qui
     montent l'une après l'autre, et le catalogue se découvre.

     ⚠️ Comme la fente, cette ouverture DÉCOUVRE la boutique : sa couche est
     donc transparente (voir COUCHE_TRANSPARENTE) et ce sont les lamelles
     qui portent le fond. */
  if (style === "lamelles") {
    const combien = 6;
    /* 101 % de large et un chevauchement d'un demi pour cent : à certains
       rapports d'écran, des bandes posées bord à bord laissent un liseré
       d'un pixel entre elles. */
    const lames = Array.from({ length: combien }, (_, i) => (
      <span
        key={i}
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, bottom: 0,
          left: (i * (100 / combien)) + "%",
          width: ((100 / combien) + 0.5) + "%",
          background: COULEURS.fond || "#050505", pointerEvents: "none",
          animation: `atelier-lamelle .72s cubic-bezier(.65,.02,.3,1) ${(1.9 + i * 0.07).toFixed(2)}s both`,
        }}
      />
    ));

    return (
      <>
        {lames}
        <p
          className="text-center relative"
          style={{
            ...TITRE_OUVERTURE, letterSpacing: ".04em",
            animation: "atelier-fente-nom 1.45s cubic-bezier(.2,.9,.2,1) .45s both",
          }}
        >
          {INTRO.texte}
        </p>
      </>
    );
  }

  /* ───── LES AUTRES OUVERTURES REVIENDRONT ICI, UNE PAR UNE ─────

     🚨 ET AUCUNE NE MONTRERA LE LOGO. Décidé le 14 octobre 2026, en même
     temps que le sceau était validé : « ça sera la seule qui fera
     apparaître le logo, on va la garder, mais ça doit être la seule ».

     Ce n'est pas un goût, c'est une règle qui tient debout : une boutique
     n'a QU'UN logo. Si trois ouvertures le montrent, elles se ressemblent
     toutes et le choix n'en est plus un — on choisirait entre trois façons
     de montrer la même image. Une seule le montre, les autres travaillent
     le nom, la lumière, le mouvement, et chaque ouverture redevient une
     vraie proposition.

     L'essai `essayer-les-ouvertures.mjs` compte les ouvertures qui lisent
     BOUTIQUE.logo et refuse la deuxième. */
  return null;
}
// ══════════ OUVERTURE DE LA BOUTIQUE ══════════
// Jouée une fois par visite. La vidéo est muette : tous les navigateurs
// refusent de démarrer un son tout seul, sans quoi rien ne se lancerait.
export function Intro({ onFini }) {
  const [sort, setSort] = useState(false);
  const dejaFait = useRef(false);

  /* 🚨 ON ATTEND QUE L'ÉCRAN DE LANCEMENT DU TÉLÉPHONE AIT DISPARU.

     Une boutique installée s'ouvre sur l'écran de lancement d'Android :
     l'icône posée sur « background_color », affichée jusqu'au premier
     affichage de la page — et parfois un peu après. Notre animation, elle,
     démarrait dès que React se montait : son début se jouait DERRIÈRE cet
     écran, et on ne voyait que la fin.

     320 ms de rien, donc, avant de dessiner quoi que ce soit. La couche est
     déjà là, peinte avec le fond de la boutique — la même couleur que
     l'écran de lancement : il n'y a aucune bascule à voir.

     ⚠️ ÉCRIT ICI, UNE FOIS, ET NON DANS CHAQUE ANIMATION. La prochaine
     ouverture en profitera sans une ligne de plus.

     ⚠️ ET PAS EN APERÇU : là, il n'y a pas d'écran de lancement à attendre.
     Un temps mort devant quelqu'un qui règle son ouverture et la rejoue dix
     fois serait une punition. */
  /* 🚨 IL Y AVAIT ICI 320 ms D'ATTENTE, et elles ont disparu avec leur
     raison d'être : elles laissaient l'écran de lancement d'Android finir
     avant de dessiner. Or l'ouverture ne se joue plus depuis le raccourci —
     il n'y a donc plus rien à attendre, et ce tiers de seconde ne serait
     plus que du vide devant un client arrivé par un lien. */

  const fermer = () => {
    if (dejaFait.current) return;
    dejaFait.current = true;
    setSort(true);
    setTimeout(onFini, 420);
  };

  // Filet de sécurité : même si la vidéo ne démarre pas, l'intro s'efface.
  useEffect(() => {
    const t = setTimeout(fermer, INTRO.duree * 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={"atelier-ouverture fixed inset-0 z-[60] flex flex-col items-center"
        + " justify-center px-6 cursor-pointer overflow-hidden"
        /* « forcee » : le vendeur a demandé à voir l'ouverture, on la lui
           montre même si son appareil refuse les animations. Jamais sur
           une boutique en service. */
        + (APERCU && VERS === "ouverture" ? " forcee" : "")}
      /* 🚨 LE FOND DE LA BOUTIQUE, PAS UN NOIR À PART.

         C'était « #050505 » en dur. L'écran de lancement d'Android, lui, est
         peint avec « background_color » du manifeste, c'est-à-dire le fond de
         la boutique — #030303 sur Mapuche Arts. Deux noirs presque égaux, et
         « presque » se voit sur un téléphone, dans le noir : un changement de
         teinte au moment où la page s'affiche.

         Une boutique CLAIRE y gagne aussi : son ouverture se jouait sur du
         noir alors que tout le reste est pâle. */
      style={{
        /* Transparente pour les ouvertures qui écartent le noir elles-mêmes
           (voir COUCHE_TRANSPARENTE). Sinon, le fond de la boutique — la même
           couleur que l'écran de lancement du téléphone, et la bonne couleur
           pour une boutique claire. */
        background: COUCHE_TRANSPARENTE.includes(INTRO.style)
          ? "transparent"
          : (COULEURS.fond || "#050505"),
        animation: sort ? "atelier-sortie .4s ease forwards" : "none",
      }}
      onClick={fermer}
    >
      {INTRO.video ? (
        /* LE TITRE PAR-DESSUS LA VIDÉO.

           Le texte d'ouverture n'apparaissait que faute de vidéo : dès qu'on en
           mettait une, le nom de la boutique disparaissait. Or c'est justement
           là qu'il sert — trois secondes d'images, et rien pour dire chez qui
           on vient d'entrer.

           Il se pose donc SUR la vidéo, au centre, sur un voile sombre. Le
           voile n'est pas une décoration : un titre clair sur des images
           claires ne se lit pas, et une vidéo change d'image vingt-cinq fois
           par seconde. Le voile est le seul moyen de tenir la lisibilité sans
           connaître le film.

           « pointer-events-none » : le doigt traverse le texte et atteint le
           fond, qui referme l'ouverture. Sans cela, taper sur le titre — le
           plus gros élément de l'écran — ne ferait rien. */
        <div className="relative">
          <video
            src={INTRO.video}
            autoPlay
            muted
            playsInline
            onEnded={fermer}
            onError={fermer}
            className="block max-w-full max-h-[76vh] rounded-2xl"
            style={{ border: `2px solid ${rose}`, boxShadow: `0 0 40px ${rose}55` }}
          />
          {INTRO.texte && (
            <div
              className="absolute inset-0 flex items-center justify-center px-5 rounded-2xl pointer-events-none"
              style={{
                /* Le voile est le plus sombre AU CENTRE, là où le titre se pose.
                   Un dégradé du bas vers le haut, comme sur les tuiles de marque,
                   laissait justement le milieu de l'image en clair : le texte y
                   tombait sur la partie la moins couverte. */
                background: "radial-gradient(ellipse at center, rgba(0,0,0,.66) 0%, rgba(0,0,0,.44) 58%, rgba(0,0,0,.58) 100%)",
                /* L'ombre est portée par le cadre, non par le texte : les
                   lettres sont transparentes — c'est le dégradé qui se voit à
                   travers — et une ombre de texte n'aurait rien à assombrir. */
                filter: "drop-shadow(0 2px 14px rgba(0,0,0,.9))",
              }}
            >
              <p
                className="atelier-anime text-center"
                style={{
                  fontFamily: TITRE, fontSize: "clamp(26px, 8.5vw, 54px)", lineHeight: 1.02,
                  backgroundImage: DEGRADE, WebkitBackgroundClip: "text", backgroundClip: "text",
                  color: "transparent",
                  animation: "atelier-apparition .8s cubic-bezier(.2,.9,.2,1) both, atelier-lueur 2.4s ease-in-out .8s infinite",
                }}
              >
                {INTRO.texte}
              </p>
            </div>
          )}
        </div>
      ) : (
        <OuvertureDessinee />
      )}
      <p
        className="absolute bottom-7 text-[11px] uppercase tracking-[.2em]"
        style={{ color: texteDoux, fontFamily: CORPS }}
      >
        Tape pour entrer
      </p>
    </div>
  );
}

// ══════════ VISIONNEUSE DU PRODUIT ══════════
// Un appui sur la photo ouvre tout ce que le produit contient : ses photos,
// l'une après l'autre, son descriptif, et sa vidéo s'il en a une. Chaque partie
// n'apparaît que si elle existe.
export function Visionneuse({ produit, famille, depart = 0, onFermer }) {
  const photos = GALERIE(produit);
  const affichees = photos.length ? photos : [visuelProduit(produit, famille.couleurs, famille.glyphe)];
  const plusieurs = affichees.length > 1;
  const aVideo = !!(produit.video || "").trim();

  const [i, setI] = useState(depart);
  // Un produit filmé et non photographié s'ouvre directement sur son film :
  // sinon la visionneuse s'ouvrait sur le dessin de remplacement, et il fallait
  // encore un bouton pour atteindre la seule vraie image du produit.
  const [surVideo, setSurVideo] = useState(aVideo && photos.length === 0);
  const doigtX = useRef(null);

  const suivante = () => setI((n) => (n + 1) % affichees.length);
  const precedente = () => setI((n) => (n - 1 + affichees.length) % affichees.length);

  // Clavier sur ordinateur, glissement du doigt sur téléphone.
  useEffect(() => {
    const touche = (e) => {
      if (e.key === "Escape") onFermer();
      else if (e.key === "ArrowRight" && plusieurs) suivante();
      else if (e.key === "ArrowLeft" && plusieurs) precedente();
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [plusieurs, affichees.length]);

  const debutGlisse = (e) => { doigtX.current = e.touches[0].clientX; };
  const finGlisse = (e) => {
    if (doigtX.current === null || !plusieurs || surVideo) return;
    const ecart = e.changedTouches[0].clientX - doigtX.current;
    if (Math.abs(ecart) > 45) (ecart < 0 ? suivante : precedente)();
    doigtX.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,.97)" }}>
      {/* barre du haut */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        <p className="flex-1 truncate" style={{ fontFamily: TITRE, fontSize: 18, color: texte }}>
          {produit.nom}
        </p>
        {plusieurs && !surVideo && (
          <span className="px-2 py-1 rounded-lg text-[11px] font-bold flex-shrink-0"
            style={{ background: "#1A1A1A", color: texteDoux, border: `1px solid ${bordure}`, fontFamily: CORPS }}>
            {i + 1} / {affichees.length}
          </span>
        )}
        <button onClick={onFermer} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#1A1A1ACC", border: `1px solid ${bordure}` }} aria-label="Fermer">
          <X size={17} color={texte} />
        </button>
      </div>

      {/* la photo, ou la vidéo */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-3"
        onTouchStart={debutGlisse} onTouchEnd={finGlisse}>
        {surVideo ? (
          <Video source={produit.video} nom={produit.nom} className="max-w-full max-h-full rounded-xl" />
        ) : (
          <>
            <img src={affichees[i]} alt={produit.nom} className="max-w-full max-h-full object-contain rounded-xl" />
            {plusieurs && (
              <>
                <button onClick={precedente} aria-label="Photo précédente"
                  className="absolute left-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-90"
                  style={{ background: "#000000B8", border: `1px solid ${bordure}` }}>
                  <ChevronLeft size={22} color={texte} />
                </button>
                <button onClick={suivante} aria-label="Photo suivante"
                  className="absolute right-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-90"
                  style={{ background: "#000000B8", border: `1px solid ${bordure}` }}>
                  <ChevronRight size={22} color={texte} />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* pastilles des photos */}
      {plusieurs && !surVideo && (
        <div className="flex gap-2 overflow-x-auto px-3 pt-3 flex-shrink-0" style={{ scrollbarWidth: "none" }}>
          {affichees.map((src, n) => (
            <button key={n} onClick={() => setI(n)} className="flex-shrink-0 rounded-lg overflow-hidden"
              style={{ border: `2px solid ${n === i ? famille.couleurs[0] : bordure}`, opacity: n === i ? 1 : 0.6 }}>
              <img src={src} alt="" className="w-14 h-14 object-cover block" />
            </button>
          ))}
        </div>
      )}

      {/* descriptif et vidéo */}
      <div className="px-4 pt-3 pb-5 flex-shrink-0" style={{ maxHeight: "34vh", overflowY: "auto" }}>
        {aVideo && (
          <button onClick={() => setSurVideo((v) => !v)}
            className="w-full mb-3 py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ background: CARTE, border: `2px solid ${cyan}` }}>
            <PlayCircle size={18} color={cyan} />
            <span style={{ fontFamily: TITRE, fontSize: 15, color: cyan, letterSpacing: ".5px" }}>
              {surVideo ? "REVENIR AUX PHOTOS" : "VOIR LA VIDÉO"}
            </span>
          </button>
        )}
        {(produit.description || "").trim() ? (
          <p className="text-[13.5px]" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {produit.description}
          </p>
        ) : (
          <p className="text-[12px] text-center" style={{ color: texteDoux, fontFamily: CORPS }}>
            {plusieurs ? "Fais glisser pour voir les autres photos." : "Tape sur la croix pour revenir."}
          </p>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   LE PIED LÉGAL — CE QUE TOUTE BOUTIQUE DOIT DIRE
   ═══════════════════════════════════════════════════════════════════════

   🚨 IL N'EST PAS DANS UN ONGLET, ET C'EST TOUT L'INTÉRÊT.
   ────────────────────────────────────────────────────────
   Le premier endroit évident était l'onglet INFOS. Mais cet onglet
   s'éteint : « afficherInfos: false » le retire de la barre du bas. Une
   obligation légale qu'un vendeur peut décocher n'est pas une obligation.

   Le pied est donc rendu avec l'écran, sous le contenu et au-dessus de la
   barre, sur les DEUX moteurs — vente et location. Il n'a pas d'interrupteur.

   CE QU'IL DIT, ET POURQUOI
   ─────────────────────────
     • QUI VEND, et s'il est particulier ou professionnel — Code de la
       consommation, L111-7. Un client qui achète à un particulier n'a ni
       droit de rétractation ni garantie légale : il doit pouvoir le savoir
       AVANT d'acheter, pas après.
     • QUE LE CONTRAT N'EST PAS AVEC DMiana, et que le paiement se règle
       directement avec le vendeur.
     • COMMENT SIGNALER — DSA, article 16. Sans ce chemin, DMiana n'est jamais
       « informé », et la protection d'hébergeur tient à ça.

   ⚠️ LE STATUT PEUT MANQUER, ET ON NE L'INVENTE PAS. « vendeur » arrive par
   config.js, donc à la publication de la boutique. Une boutique qui n'a pas
   republié depuis n'en a pas : on n'écrit alors ni « particulier » ni
   « professionnel » — on dit seulement ce qui est vrai pour tout le monde.
   Afficher « particulier » par défaut serait un mensonge au client sur ses
   propres droits. */
export const VENDEUR = (function () {
  const v = (BOUTIQUE && BOUTIQUE.vendeur) || {};
  /* 🚨 TROIS RÉPONSES, ET « VIDE » EST UNE QUATRIÈME CHOSE.
     « non_precise » veut dire : on lui a demandé, il a préféré ne pas le dire.
     « » veut dire : on n'en sait rien — une boutique publiée avant que la
     question existe. Les deux ne s'affichent pas pareil, et les confondre
     ferait dire d'un ancien vendeur qu'il a refusé de répondre. */
  const connus = ["pro", "particulier", "non_precise"];
  const type = connus.indexOf(v.type) >= 0 ? v.type : "";
  return {
    type,
    siret: String(v.siret || "").trim(),
    nom: String(v.nom || "").trim(),
  };
})();

/* ═══════ OÙ PART UN SIGNALEMENT ═══════

   🚨 CES DEUX LIGNES SONT REMPLIES PAR L'ATELIER, PAS PAR config.js.
   ──────────────────────────────────────────────────────────────────
   Une boutique publiée il y a six mois a un config.js d'il y a six mois. Le
   jour où un fichier du moteur lui a réclamé une ligne neuve, sa
   reconstruction a échoué EN PRODUCTION, chez un client :

       No matching export in config.js for import SUPABASE

   Ce qui est nouveau voyage donc AVEC LE MOTEUR : « generer.js » remplace
   ces marques dans tous les fichiers du squelette au moment de les
   fabriquer. L'adresse arrive avec la mise à jour, sans qu'aucune boutique
   n'ait à republier son contenu.

   ⚠️ ET ELLE EST RECOPIÉE ICI PLUTÔT QU'IMPORTÉE DE visites.js, QUI LA PORTE
   DÉJÀ. Ce n'est pas un oubli : « essayer-les-promotions.mjs » éprouve ce
   fichier-ci seul, posé dans une VRAIE boutique dont les autres fichiers sont
   anciens. L'import a fait tomber cet essai aussitôt —

       No matching export in "../amira-luxury/src/visites.js"
       for import "signalerLaBoutique"

   — et c'était le même défaut que l'incident ci-dessus, en plus discret : un
   fichier du moteur qui en réclame un autre, plus récent. Les deux copies ne
   peuvent pas diverger, puisqu'elles sortent de la même ligne de generer.js.

   ⚠️ LE VISITEUR N'EST PAS IDENTIFIÉ. Ni cookie, ni jeton, ni rien qui le
   nomme : l'adresse de la boutique, une raison choisie dans une liste, un
   détail libre, et un moyen de le recontacter S'IL le donne. C'est exactement
   ce que l'article 6.1 des conditions annonce, et rien de plus. */
const BASE_SIGNALEMENT = {
  url: "https://jydppdjkeidvbuflklsa.supabase.co",
  cle: "sb_publishable_nxSPX5Myp4an9DCyeP77iQ_2_K954Lz",
};

function signalerLaBoutique({ raison, details, contact }) {
  if (!BASE_SIGNALEMENT.url || !BASE_SIGNALEMENT.cle) return Promise.resolve(false);
  // Squelette non rempli par l'atelier : les marques sont encore là.
  if (BASE_SIGNALEMENT.url.indexOf("{{") === 0) return Promise.resolve(false);

  const adresse = (typeof location !== "undefined" && location.origin) || "";
  if (!adresse) return Promise.resolve(false);

  return fetch(BASE_SIGNALEMENT.url + "/rest/v1/rpc/signaler_une_boutique", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: BASE_SIGNALEMENT.cle,
      Authorization: "Bearer " + BASE_SIGNALEMENT.cle,
    },
    body: JSON.stringify({
      p_url: adresse,
      p_raison: raison || "autre",
      p_details: details || "",
      p_contact: contact || "",
    }),
  })
    .then(function (r) { return r.ok; })
    /* 🚨 UN SIGNALEMENT QUI NE PART PAS DOIT LE DIRE. C'est la seule chose de
       cette boutique dont l'échec compte vraiment : quelqu'un a pris la peine
       de prévenir, et croire que c'est parti alors que non est pire que de
       n'avoir pas de bouton. L'écran montre un vrai message d'échec. */
    .catch(function () { return false; });
}

/* Une liste fermée, et les mêmes clés que la base attend
   (supabase/21-signalements.sql). Un texte libre à la place serait un champ
   de plus à nettoyer, et un endroit où écrire n'importe quoi en grand. */
const RAISONS = [
  ["illegal", "Produit interdit ou illégal"],
  ["contrefacon", "Contrefaçon"],
  ["arnaque", "Arnaque, vendeur malhonnête"],
  ["haine", "Contenu haineux ou violent"],
  ["erreur", "Erreur dans une fiche"],
  ["autre", "Autre raison"],
];

/* 🚨 DEUX ENDROITS, ET LA RAISON N'EST PAS LA MÊME.

   Demandé le 17 octobre 2026 : « je veux que information et mentions, le
   petit lien, se trouve dans ma rubrique info », et « le petit "créée avec
   DMiana" doit être un peu plus gros, et partout sur toutes les pages tout en
   bas ».

   Les deux sont justes, et ils ne vont pas au même endroit :

     • LA SIGNATURE est en bas de CHAQUE page, toujours. C'est elle qui fait
       venir les clients : une boutique qui marche est la meilleure
       démonstration qui soit.

     • LE LÉGAL vit dans l'onglet INFOS, là où on va chercher ce genre de
       chose.

   ⚠️ MAIS L'ONGLET INFOS PEUT ÊTRE ÉTEINT. « afficherInfos: false » le retire
   de la barre du bas, et une obligation légale qu'un vendeur peut décocher
   n'est pas une obligation. Quand il est éteint, le lien « Informations &
   mentions » REVIENT donc en bas de page, à côté de la signature.

   C'est le seul moyen de faire ce qui est demandé sans ouvrir un trou :
   personne ne doit pouvoir rendre ces mentions introuvables. */
export function PiedLegal({ ou = "bas" }) {
  const [ouvert, setOuvert] = useState(false);
  const [infos, setInfos] = useState(false);
  const [raison, setRaison] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [envoi, setEnvoi] = useState("");

  const siret = VENDEUR.siret ? VENDEUR.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, "$1 $2 $3 $4") : "";

  async function envoyer() {
    if (!raison) return;
    setEnvoi("en cours");

    /* 🚨 UN APERÇU NE SIGNALE RIEN. L'atelier ouvre la boutique en aperçu
       pour la regarder : un clic d'essai ne doit pas poser une ligne dans
       la base, ni déclencher un examen pour rien. */
    if (APERCU) {
      setEnvoi("apercu");
      return;
    }

    const parti = await signalerLaBoutique({ raison, details, contact });
    setEnvoi(parti ? "parti" : "rate");
  }

  function fermer() {
    setOuvert(false);
    setEnvoi("");
    setRaison("");
    setDetails("");
    setContact("");
  }

  const champ = {
    background: fond,
    border: `1px solid ${bordure}`,
    color: texte,
    fontFamily: CORPS,
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    width: "100%",
    outline: "none",
  };

  return (
    <>
      {/* ═══════ LE PIED, REPLIÉ ═══════

          🚨 TOUT CE QUI EST OBLIGATOIRE N'A PAS À ÊTRE LE PLUS VISIBLE.

          Demandé le 17 octobre 2026 : « les textes de responsabilité en bas de
          chaque boutique sont beaucoup trop visibles, fais-les s'afficher après
          l'appui sur un petit bouton », et « tu dois protéger mes informations
          personnelles un maximum — si elles doivent être mises, cache-les bien ».

          Il a raison sur les deux, et pour la même raison. Un pavé juridique
          sous le dernier produit raconte au visiteur que la boutique se méfie
          de lui — et il expose, en permanence, le nom et le SIRET du vendeur à
          quiconque fait défiler la page jusqu'en bas, y compris aux machines
          qui ramassent.

          ⚠️ RIEN N'EST RETIRÉ. La loi veut que ce soit ACCESSIBLE, pas que ce
          soit criant : un bouton nommé, à une tape, toujours au même endroit.
          Le contenu est identique au mot près.

          ⚠️ « SIGNALER » EST DEDANS, ET C'EST VOULU. Quelqu'un qui veut
          signaler une boutique commence par chercher qui la tient : il ouvre
          donc le pli, lit, et trouve le bouton au bout. Le sortir pour le
          rendre plus visible mettrait un bouton d'accusation sous chaque
          vitrine honnête — et elles le sont presque toutes. */}
      {/* ⚠️ L'ONGLET INFOS PORTE LE LÉGAL : en bas, il ne reste que la
          signature. Sauf si l'onglet est éteint — alors le lien revient. */}
      <div className={ou === "infos" ? "px-3 pb-2" : "px-3 pb-6 mt-6"}>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {(ou === "infos" || BOUTIQUE.afficherInfos === false) && (
          <button
            onClick={() => setInfos((v) => !v)}
            aria-expanded={infos}
            className="text-[12px] underline"
            style={{ color: texteDoux, fontFamily: CORPS, padding: "11px 4px" }}
          >
            {infos ? "Masquer les informations" : "Informations & mentions"}
          </button>)}

          {/* ═══════ LA SIGNATURE ═══════

              🚨 DESSINÉE DANS LA PAGE, JAMAIS TÉLÉCHARGÉE.
              Demandé le 18 octobre : « rajouter un lien avec le logo de mon
              application pour que, si une boutique d'un client fonctionne bien,
              les gens puissent voir qui a créé la boutique et devenir à leur
              tour des clients ». C'est juste : une boutique qui marche est la
              meilleure démonstration qui soit.

              Mais la règle de la maison tient : une boutique ne télécharge
              rien d'ailleurs. Aller chercher icone-192.png sur dmiana.vercel.app
              ajouterait une requête vers un autre domaine à CHAQUE visite de
              CHAQUE boutique — lente sur un partage de connexion, et cassée le
              jour où cette adresse bouge. Le signe est donc tracé ici, en
              quelques traits : rien à charger, net à toutes les tailles, et il
              prend les couleurs de la boutique qui l'accueille.

              ⚠️ Discret, et pas une publicité : c'est la boutique du vendeur,
              pas la nôtre. */}
          {/* 🚨 UN PEU PLUS GROSSE, ET PAS PLUS. Demandé le 18 octobre.
              13 px au lieu de 11, le signe à 18 au lieu de 15 : assez pour
              qu'on la voie en faisant défiler, pas assez pour qu'elle
              ressemble à une publicité posée sur la boutique d'un autre. */}
          {ou === "bas" && (
          <a
            href="https://dmiana.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[13px]"
            style={{ color: texteDoux, fontFamily: CORPS, padding: "12px 4px", textDecoration: "none" }}
            title="Créer ma boutique avec DMiana"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3.2c-4.7 0-8.5 3-8.5 6.8 0 2.2 1.3 4.1 3.3 5.4l-.7 3.1 3.2-1.7c.8.2 1.7.3 2.7.3 4.7 0 8.5-3 8.5-6.8S16.7 3.2 12 3.2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9.6 8.4h4.8l.5 4.2H9.1l.5-4.2Zm1.1 0V7.3a1.3 1.3 0 0 1 2.6 0v1.1"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
            Créée avec DMiana
          </a>)}
        </div>

        {infos && (ou === "infos" || BOUTIQUE.afficherInfos === false) && (
        <div
          className="rounded-2xl p-4 mt-3"
          style={{ background: CARTE, border: `1px solid ${bordure}` }}
        >
          {/* QUI VEND — seulement si on le sait. */}
          {VENDEUR.type === "non_precise" ? (
            /* ⚠️ NEUTRE, ET SANS REPROCHE. « Il fait ce qu'il veut, il est
               responsable. » La phrase dit au client ce qu'il doit savoir
               pour décider, et rien sur le vendeur. */
            <p className="text-[12px]" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
              La qualité de ce vendeur n'est pas précisée. Le droit de rétractation et les
              garanties légales ne valent que face à un professionnel : si c'est important
              pour toi, demande-le-lui avant d'acheter.
            </p>
          ) : VENDEUR.type ? (
            <p className="text-[12px]" style={{ color: texte, fontFamily: CORPS, lineHeight: 1.6 }}>
              {VENDEUR.nom ? VENDEUR.nom + " — vendeur " : "Vendeur "}
              <b style={{ color: jaune }}>
                {VENDEUR.type === "pro" ? "professionnel" : "particulier"}
              </b>
              {VENDEUR.type === "pro" && siret ? ` · SIRET ${siret}` : ""}
            </p>
          ) : null}

          <p className="text-[12px] mt-1" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
            Cette boutique est tenue par un vendeur indépendant. Le contrat de vente est
            conclu avec lui, et le paiement se règle <b style={{ color: texte }}>directement</b> avec
            lui — rien ne passe par la plateforme.
          </p>

          {/* 🚨 LA PHRASE QUI COÛTE LE PLUS CHER SI ELLE MANQUE : un acheteur
              qui ignore qu'il n'a aucun recours légal face à un particulier
              croit en avoir un, et il le découvre au pire moment. */}
          {VENDEUR.type === "particulier" && (
            <p className="text-[12px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
              En achetant à un particulier, tu ne bénéficies pas du droit de rétractation ni
              des garanties légales : ils ne s'appliquent que face à un professionnel.
            </p>
          )}

          <p className="text-[12px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
            En cas de litige, adresse-toi au vendeur. La plateforme peut retirer une boutique
            signalée, mais elle n'arbitre pas les litiges.
          </p>

          <button
            onClick={() => setOuvert(true)}
            className="mt-3 text-[12px] underline"
            style={{ color: texteDoux, fontFamily: CORPS }}
          >
            Signaler cette boutique
          </button>
        </div>
        )}
      </div>

      {ouvert && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,.8)" }}
          onClick={fermer}
        >
          <div
            className="w-full max-w-[560px] rounded-t-3xl p-4 pb-7"
            style={{ background: COLONNE, border: `1px solid ${bordure}`, maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <p style={{ fontFamily: TITRE, fontSize: 18, color: texte }}>SIGNALER CETTE BOUTIQUE</p>
              <button onClick={fermer} aria-label="Fermer">
                <X size={20} color={texteDoux} />
              </button>
            </div>

            {envoi === "parti" ? (
              <div className="mt-4">
                <p className="text-[14px]" style={{ color: vert, fontFamily: CORPS }}>
                  <Check size={16} color={vert} style={{ display: "inline", marginRight: 6 }} />
                  C'est transmis.
                </p>
                <p className="text-[12.5px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
                  Ton signalement est examiné. Si le contenu est manifestement illégal ou
                  contraire aux conditions, la boutique est retirée et son vendeur en est
                  informé avec la raison.
                </p>
                <button
                  onClick={fermer}
                  className="w-full mt-4 py-3 rounded-xl text-[14px]"
                  style={{ background: fond, border: `1px solid ${bordure}`, color: texte, fontFamily: CORPS }}
                >
                  Fermer
                </button>
              </div>
            ) : envoi === "apercu" ? (
              <p className="text-[13px] mt-4" style={{ color: jaune, fontFamily: CORPS, lineHeight: 1.6 }}>
                C'est un aperçu : rien n'est envoyé. Sur la vraie boutique, ce bouton transmet
                le signalement.
              </p>
            ) : (
              <>
                <p className="text-[12.5px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
                  Dis-nous ce qui ne va pas. Ton signalement est lu, et tu n'as pas besoin de
                  te nommer.
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {RAISONS.map(([cle, nom]) => (
                    <button
                      key={cle}
                      onClick={() => setRaison(cle)}
                      className="px-3 py-2 rounded-xl text-[12.5px]"
                      style={{
                        background: raison === cle ? jaune : fond,
                        color: raison === cle ? "#111" : texteDoux,
                        border: `1px solid ${raison === cle ? jaune : bordure}`,
                        fontFamily: CORPS,
                      }}
                    >
                      {nom}
                    </button>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
                  placeholder="Ce qui te semble poser problème, et où (facultatif)"
                  rows={3}
                  className="mt-3"
                  style={{ ...champ, resize: "vertical" }}
                />

                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value.slice(0, 200))}
                  placeholder="Ton email, si tu veux une réponse (facultatif)"
                  className="mt-2"
                  style={champ}
                />

                {envoi === "rate" && (
                  <p className="text-[12.5px] mt-3" style={{ color: rose, fontFamily: CORPS, lineHeight: 1.55 }}>
                    Le signalement n'est pas parti — vérifie ta connexion et réessaie. Si ça
                    ne marche toujours pas, écris directement au vendeur.
                  </p>
                )}

                <button
                  onClick={envoyer}
                  disabled={!raison || envoi === "en cours"}
                  className="w-full mt-4 py-3 rounded-xl text-[14px]"
                  style={{
                    background: raison ? jaune : fond,
                    color: raison ? "#111" : texteDoux,
                    border: `1px solid ${raison ? jaune : bordure}`,
                    fontFamily: TITRE,
                    opacity: envoi === "en cours" ? 0.6 : 1,
                  }}
                >
                  {envoi === "en cours" ? "Envoi…" : "Envoyer le signalement"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
