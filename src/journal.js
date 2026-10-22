// LE JOURNAL DES ERREURS DE LA BOUTIQUE
// -------------------------------------
// 🚨 CONSIGNE N°16, PHASE 1. Jusqu'au 21 octobre 2026, une boutique pouvait
// afficher un écran blanc chez la cliente d'une vendeuse sans que personne ne
// l'apprenne jamais. La vendeuse perdait des ventes et croyait simplement que
// personne ne passait.
//
// ⚠️ POURQUOI UN FICHIER À PART, ET PAS DANS visites.js.
// Un contrôle de fabrication interdit à visites.js de lire
// « navigator.userAgent » : le compteur de visites ne doit RIEN pouvoir
// utiliser pour reconnaître quelqu'un. La règle est juste, et elle reste
// intacte. Un journal d'erreurs, lui, a besoin de savoir sur quel genre
// d'appareil ça casse — mais pas de savoir QUI.
//
// 🚨 D'OÙ UNE DESCRIPTION GROSSIÈRE, JAMAIS L'IDENTITÉ DU NAVIGATEUR.
// « Chrome · Android » suffit à comprendre un défaut. La chaîne complète,
// elle, sert à reconnaître un appareil parmi des milliers : on ne l'envoie
// pas depuis la boutique d'une cliente.
//
// 🚨 ET CE CODE NE DOIT JAMAIS CASSER UNE BOUTIQUE.
// Un rapporteur d'erreurs qui plante, c'est une panne causée par l'outil
// censé observer les pannes. Tout est entouré, et en cas de doute on ne fait
// rien.

/* 🚨 L'ADRESSE ET LA CLÉ ARRIVENT DU MOTEUR, PAS DE config.js.
   config.js appartient à la boutique et peut dater de six mois ; une
   boutique publiée avant cette version n'aurait pas la ligne. Les marques
   ci-dessous sont remplacées quand l'atelier fabrique les fichiers du
   moteur — voir fichiersMoteur() dans generer.js. */
const BASE = {
  url: "https://jydppdjkeidvbuflklsa.supabase.co",
  cle: "sb_publishable_nxSPX5Myp4an9DCyeP77iQ_2_K954Lz",
};

let enCours = false;
const dejaVues = {};
let envoyees = 0;
const MAX_PAR_VISITE = 10;

/** Un genre d'appareil, pas une identité. */
function genreDAppareil() {
  try {
    const ua = String(navigator.userAgent || "");
    const navigateur = /Edg\//.test(ua) ? "Edge"
      : /OPR\//.test(ua) ? "Opera"
      : /Chrome\//.test(ua) ? "Chrome"
      : /Safari\//.test(ua) ? "Safari"
      : /Firefox\//.test(ua) ? "Firefox"
      : "autre";
    const systeme = /Android/.test(ua) ? "Android"
      : /iPhone|iPad|iPod/.test(ua) ? "iOS"
      : /Windows/.test(ua) ? "Windows"
      : /Mac OS/.test(ua) ? "Mac"
      : /Linux/.test(ua) ? "Linux"
      : "autre";
    return navigateur + " · " + systeme;
  } catch (e) {
    return "";
  }
}

export function installerLeJournal() {
  if (typeof window === "undefined") return;
  /* Les marques ne sont pas remplacées : on est dans le squelette, pas dans
     une vraie boutique. */
  if (BASE.url.indexOf("{{") === 0) return;

  function noter(quoi, detail) {
    try {
      /* 🚨 LE PIÈGE DE LA BOUCLE : si l'envoi échoue et que cet échec est
         rapporté, on écrit en rond jusqu'à remplir la base. */
      if (enCours) return;
      const message = String(quoi || "").slice(0, 400);
      /* ⚠️ ET CELUI DE LA RÉPÉTITION : une erreur dans une boucle de dessin
         part cent fois par seconde. */
      if (!message || dejaVues[message]) return;
      if (envoyees >= MAX_PAR_VISITE) return;
      dejaVues[message] = true;
      envoyees += 1;
      enCours = true;

      fetch(BASE.url + "/rest/v1/rpc/noter_une_erreur", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: BASE.cle },
        body: JSON.stringify({
          /* 🚨 NI QUERY NI FRAGMENT. Une adresse peut transporter des choses
             qu'on ne veut pas écrire dans une table. */
          ou_: location.origin + location.pathname,
          quoi_: message,
          detail_: String(detail || "").slice(0, 1000),
          agent_: genreDAppareil(),
        }),
        /* Une erreur arrive souvent juste avant que la page disparaisse. */
        keepalive: true,
      })
        .catch(function () {})
        .then(function () { enCours = false; }, function () { enCours = false; });
    } catch (e) {
      enCours = false;
    }
  }

  try {
    window.addEventListener("error", function (ev) {
      /* ⚠️ UNE IMAGE QUI NE CHARGE PAS DÉCLENCHE AUSSI « error ». Sans ce
         tri, le journal se remplirait de photos manquantes — et une boutique
         en a beaucoup. */
      if (!ev || !ev.error) return;
      noter(String(ev.message || ev.error), ev.error && ev.error.stack);
    });
    window.addEventListener("unhandledrejection", function (ev) {
      const r = ev && ev.reason;
      if (!r) return;
      noter("Promesse non attrapée : " + String(r.message || r), r.stack);
    });
  } catch (e) {
    /* Rien : si on ne peut pas écouter, la boutique marche quand même. */
  }
}
