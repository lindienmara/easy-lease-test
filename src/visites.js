// LE COMPTEUR DE VISITES
// ----------------------
// Il dit une chose, et une seule : « cette boutique a été ouverte N fois
// aujourd'hui ». Le propriétaire le lit dans son atelier.
//
// 🚨 TROIS RÈGLES, ET AUCUNE N'EST NÉGOCIABLE.
//
// ① IL NE RETARDE JAMAIS L'AFFICHAGE. L'appel part et on l'oublie — aucun
//    « await », aucune attente. Un client qui ouvre une boutique ne doit pas
//    patienter une milliseconde de plus parce qu'on compte. Si le réseau est
//    coupé, si Supabase est en panne, si le fichier SQL n'a pas été lancé :
//    la boutique s'ouvre exactement pareil, et le compteur se tait.
//
// ② IL NE DIT RIEN DE PERSONNE. Il envoie l'adresse de la boutique, point.
//    Pas d'adresse IP, pas de cookie, pas de numéro de visiteur, pas de page
//    visitée, pas d'appareil, pas de provenance. Il n'y a rien à recouper
//    avec quoi que ce soit, et c'est voulu : on veut savoir si la boutique
//    vit, pas qui la regarde.
//
// ③ IL NE COMPTE PAS LES APERÇUS. Quand le propriétaire regarde son
//    brouillon depuis l'atelier, ce n'est pas une visite. Sinon le chiffre
//    mesurerait surtout le temps qu'il passe à régler ses couleurs.
//
// POURQUOI « sessionStorage » ET PAS UN COOKIE.
// Recharger la page ne doit pas compter deux fois, sinon le chiffre ne veut
// plus rien dire. Il faut donc se souvenir, le temps de la visite, qu'on a
// déjà compté. « sessionStorage » s'efface tout seul à la fermeture de
// l'onglet : rien ne survit, rien ne suit personne d'un site à l'autre, et il
// n'y a pas d'identifiant à poser. C'est la forme la plus légère possible —
// un cookie durable serait à la fois plus intrusif et plus lourd à justifier.

/* 🚨 L ADRESSE VOYAGE AVEC LE MOTEUR, PAS AVEC LA BOUTIQUE.
   ────────────────────────────────────────────────────────
   Ce fichier lisait « import { SUPABASE } from ./config.js ». C etait
   faux, et ca a casse une vraie boutique en production :

       Le deploiement en production du projet mapuche-shop-1 a echoue.
       La commande « npm run build » s est terminee avec le code 1.
       No matching export in config.js for import SUPABASE

   POURQUOI. Mettre le moteur a jour remplace le CODE de la boutique et
   rien d autre : config.js contient ses reglages, ses couleurs, son nom —
   il lui appartient, et on n y touche jamais. Une boutique publiee avant
   cette version a donc un config.js SANS cette ligne. Le moteur neuf lui
   reclamait quelque chose qui n existait pas chez elle, et la
   reconstruction echouait.

   LA REGLE QUI EN SORT : un fichier du moteur ne peut demander a config.js
   que ce que TOUTES les boutiques ont deja, y compris les plus anciennes.
   Ce qui est nouveau voyage avec le moteur. L atelier remplit les deux
   lignes ci-dessous au moment de fabriquer les fichiers.
   « verifier-config.mjs » refuse desormais tout nouveau nom demande a
   config.js. */
const BASE = {
  url: "https://jydppdjkeidvbuflklsa.supabase.co",
  cle: "sb_publishable_nxSPX5Myp4an9DCyeP77iQ_2_K954Lz",
};

const DEJA_COMPTE = "visite-comptee";

export function compterLaVisite(apercu) {
  // Un aperçu n'est pas une visite.
  if (apercu) return;

  // Une boutique ouverte depuis un fichier sur le disque n'a pas d'adresse
  // publique : il n'y a rien à compter, et rien à quoi rattacher le chiffre.
  if (typeof location === "undefined" || !/^https?:$/.test(location.protocol)) return;

  if (!BASE || !BASE.url || !BASE.cle) return;
  // Squelette non rempli par l atelier : les marques sont encore la.
  if (BASE.url.indexOf("{{") === 0) return;

  // Déjà compté pendant cette visite ? On s'arrête là.
  try {
    if (sessionStorage.getItem(DEJA_COMPTE)) return;
    sessionStorage.setItem(DEJA_COMPTE, "1");
  } catch (e) {
    /* Navigation privée, stockage refusé : on compte quand même. Mieux vaut
       un chiffre un peu haut qu'un compteur muet. */
  }

  /* L'appel part, et on ne l'attend pas. Le « catch » est là pour que la
     promesse refusée ne remonte jamais dans la console du client : une
     erreur rouge sur la boutique de quelqu'un, pour un compteur, serait
     disproportionné. */
  try {
    fetch(BASE.url + "/rest/v1/rpc/compter_visite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: BASE.cle,
        Authorization: "Bearer " + BASE.cle,
      },
      body: JSON.stringify({ adresse: location.origin }),
      // La page peut se fermer juste après : « keepalive » laisse l'appel
      // partir quand même, au lieu d'être annulé en vol.
      keepalive: true,
    }).catch(function () {});
  } catch (e) {
    /* Rien. Un compteur qui tombe en panne doit tomber en silence. */
  }
}

/* ═══════ LES INSTALLATIONS SUR L'ÉCRAN D'ACCUEIL ═══════

   Une visite passe, une installation reste : c'est le chiffre qui dit si la
   boutique a trouvé sa place sur le téléphone de quelqu'un.

   ⚠️ « appinstalled » N'EXISTE PAS SUR IPHONE. Apple ne déclenche aucun
   événement quand on ajoute une page à l'écran d'accueil. Ce compteur ne voit
   donc qu'Android et les ordinateurs : c'est un plancher, et l'écran qui
   l'affiche doit le dire. */
export function compterLesInstallations() {
  if (typeof window === "undefined") return;
  if (BASE.url.indexOf("{{") === 0) return;
  window.addEventListener("appinstalled", function () {
    try {
      fetch(BASE.url + "/rest/v1/rpc/compter_installation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: BASE.cle,
          Authorization: "Bearer " + BASE.cle,
        },
        body: JSON.stringify({ adresse: location.origin }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {
      /* Rien. */
    }
  });
}
