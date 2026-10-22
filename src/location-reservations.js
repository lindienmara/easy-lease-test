// LES RÉSERVATIONS EN LIGNE — LA BOUTIQUE PARLE À LA BASE
// =======================================================
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CE FICHIER N'EST LU QUE PAR App-location.jsx.                        │
// │ Une boutique de vente ne l'exécute jamais, et une boutique de location  │
// │ qui n'a pas allumé « Réservation en ligne » ne l'appelle pas non plus.  │
// └─────────────────────────────────────────────────────────────────────────┘
//
// Consigne N°25, interrupteur 1 : « Dès qu'un client envoie sa demande, même
// une semaine avant, les dates choisies doivent se bloquer automatiquement
// dans le calendrier du véhicule. »
//
// 🚨 L'ADRESSE ET LA CLÉ ARRIVENT DU MOTEUR, PAS DE config.js.
// Même raison que le journal des erreurs : config.js appartient à la boutique
// et peut dater de six mois. Les marques ci-dessous sont remplacées quand
// l'atelier fabrique les fichiers du moteur — voir fichiersMoteur() dans
// generer.js.
//
// 🚨 ET RIEN ICI NE DOIT POUVOIR CASSER LA BOUTIQUE.
// Le réseau tombe, la base ne répond pas, la réponse est bizarre : la
// boutique doit continuer à marcher exactement comme avant, avec le
// calendrier que le loueur a rempli à la main. Tout est entouré, et en cas de
// doute on ne bloque rien.

const BASE = {
  url: "https://jydppdjkeidvbuflklsa.supabase.co",
  cle: "sb_publishable_nxSPX5Myp4an9DCyeP77iQ_2_K954Lz",
};

/* Les marques ne sont pas remplacées : on est dans le squelette, pas dans une
   vraie boutique. */
const PRETE = BASE.url.indexOf("{{") !== 0;

async function appeler(quoi, corps) {
  if (!PRETE) return null;
  try {
    const reponse = await fetch(BASE.url + "/rest/v1/rpc/" + quoi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: BASE.cle,
        Authorization: "Bearer " + BASE.cle,
      },
      body: JSON.stringify(corps),
    });
    if (!reponse.ok) return null;
    return await reponse.json();
  } catch (e) {
    return null;
  }
}

/* ═══════════ CE QUE LA BOUTIQUE LIT AU CHARGEMENT ═══════════

   Une seule requête pour toute la flotte. La réponse ne contient que des
   dates : ni nom, ni téléphone, ni référence. Un visiteur curieux n'apprend
   que ce que le calendrier montre déjà.

   ⚠️ EN CAS D'ÉCHEC, ON REND UNE LISTE VIDE. Le calendrier affiche alors les
   seules périodes que le loueur a écrites à la main — c'est-à-dire la
   boutique d'avant cette version. Jamais d'écran d'erreur chez un client. */
export async function lireLesJoursPris(adresse) {
  const r = await appeler("jours_pris", { boutique_: String(adresse || "") });
  return Array.isArray(r) ? r : [];
}

/* ═══════════ CE QUE LE CLIENT ÉCRIT ═══════════

   Rend toujours la même forme : { ok, pourquoi }.

     ok: true                    les jours sont bloqués pour lui
     pourquoi: "pris"            quelqu'un vient de prendre ces dates
     pourquoi: "boutique"        l'adresse n'est pas celle d'une boutique
     pourquoi: "dates"|"passe"   la période n'a pas de sens
     pourquoi: "trop"            40 demandes dans la journée, on s'arrête
     pourquoi: "reseau"          on n'a pas pu joindre la base

   🚨 « reseau » NE DOIT PAS EMPÊCHER LA DEMANDE DE PARTIR.
   Si la base ne répond pas, le client doit quand même pouvoir écrire au
   loueur sur WhatsApp : c'est comme ça que la boutique marchait avant, et
   une panne de notre côté ne doit pas coûter une location à la cliente. */
export async function reserverDesDates({ adresse, vehicule, du, au, heures, reference }) {
  const r = await appeler("reserver", {
    boutique_: String(adresse || ""),
    vehicule_: String(vehicule || ""),
    du_: String(du || ""),
    au_: String(au || ""),
    heures_: String(heures || ""),
    reference_: String(reference || ""),
  });
  if (!r || typeof r !== "object") return { ok: false, pourquoi: "reseau" };
  return { ok: r.ok === true, pourquoi: String(r.pourquoi || "") };
}

/* ═══════════ CE QUE LE CALENDRIER EN FAIT ═══════════

   Les réservations deviennent des périodes, de la même forme que celles que
   le loueur écrit à la main — { du, au, motif } — pour que le calendrier
   n'ait rien de nouveau à apprendre.

   ⚠️ ET LE MOT CHANGE SELON LE STATUT. « Réservé » quand le loueur a
   confirmé, « En cours de réservation » quand il n'a pas encore répondu :
   les jours sont bloqués dans les deux cas, mais le visiteur n'a pas à
   croire que c'est définitif quand ça ne l'est pas. */
export function periodesDesReservations(liste, vehicule) {
  const ref = String(vehicule || "");
  return (Array.isArray(liste) ? liste : [])
    .filter((r) => r && String(r.vehicule || "") === ref && r.du && r.au)
    .map((r) => ({
      du: String(r.du),
      au: String(r.au),
      motif: r.statut === "reserve" ? "Réservé" : "En cours de réservation",
    }));
}

/* Ce qu'on dit au client quand ça n'a pas marché. En français, et sans
   jargon : « exclusion_violation » n'aide personne. */
export function phraseDeRefus(pourquoi) {
  if (pourquoi === "pris") return "Ces dates viennent d'être réservées par quelqu'un d'autre. Choisissez-en d'autres — le calendrier est à jour.";
  if (pourquoi === "trop") return "Beaucoup de demandes aujourd'hui sur cette boutique. Réessayez dans quelques minutes, ou écrivez-nous directement.";
  if (pourquoi === "passe" || pourquoi === "dates") return "Ces dates ne sont plus valables. Choisissez un départ et un retour à venir.";
  return "";
}
