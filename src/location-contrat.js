// LE CONTRAT DE LOCATION — CE QUI SE VÉRIFIE, ET CE QUI S'ENVOIE
// ==============================================================
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CE FICHIER N'EST LU QUE PAR App-location.jsx.                        │
// │ Il n'importe rien : on lui passe ce qu'il doit vérifier, et il répond.  │
// │ C'est ce qui permet de l'éprouver avec node — et les règles d'âge et de │
// │ permis sont exactement le genre de chose qu'on ne veut pas découvrir    │
// │ fausse chez le client d'un loueur.                                      │
// └─────────────────────────────────────────────────────────────────────────┘
//
// Consigne N°25, écrans 1 et 2 du parcours.

const BASE = {
  url: "https://jydppdjkeidvbuflklsa.supabase.co",
  cle: "sb_publishable_nxSPX5Myp4an9DCyeP77iQ_2_K954Lz",
};

const PRETE = BASE.url.indexOf("{{") !== 0;
const JOUR = /^\d{4}-\d{2}-\d{2}$/;

/* ═══════════ CE QU'ON DEMANDE AU CLIENT ═══════════

   🚨 CHAQUE LIGNE A UNE RAISON, ET ELLE EST ÉCRITE.
   La date et le lieu de naissance ne sont pas de la curiosité : sans eux, le
   loueur ne peut pas désigner le conducteur après une amende, et c'est lui
   qui paie. Le numéro de permis et sa date servent au contrat. Rien de plus
   n'est demandé — et aucune photo de papiers : ils se vérifient EN VRAI au
   moment de remettre les clés. */
export const CHAMPS_DU_CLIENT = [
  { cle: "nom", nom: "Nom et prénom", exemple: "Camille Durand", obligatoire: true },
  { cle: "adresse", nom: "Adresse complète", exemple: "3 rue des Alpes, 38000 Grenoble", obligatoire: true },
  { cle: "telephone", nom: "Téléphone", exemple: "06 12 34 56 78", obligatoire: true, genre: "tel" },
  { cle: "courriel", nom: "E-mail", exemple: "camille@exemple.fr", obligatoire: true, genre: "email" },
  { cle: "neLe", nom: "Date de naissance", obligatoire: true, genre: "date",
    pourquoi: "Obligatoire pour désigner le conducteur en cas d'amende." },
  { cle: "neA", nom: "Lieu de naissance", exemple: "Lyon", obligatoire: true },
  { cle: "piece", nom: "N° de pièce d'identité", exemple: "123456789012", obligatoire: true },
  { cle: "permis", nom: "N° de permis", exemple: "12AB34567", obligatoire: true },
  { cle: "permisLe", nom: "Permis obtenu le", obligatoire: true, genre: "date" },
];

const vide = (v) => !String(v == null ? "" : v).trim();

/* L'e-mail : on vérifie la FORME, pas l'existence. Un « @ » et un point
   après, c'est tout ce qu'on peut savoir sans envoyer un message. */
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* Le téléphone : au moins huit chiffres, espaces et points permis. On ne
   refuse pas un numéro étranger. */
const chiffres = (v) => String(v || "").replace(/[^0-9]/g, "").length;

/** Les années révolues entre deux jours, en AAAA-MM-JJ. */
export function annees(depuis, jusqua) {
  if (!JOUR.test(String(depuis || "")) || !JOUR.test(String(jusqua || ""))) return -1;
  const [a1, m1, j1] = depuis.split("-").map(Number);
  const [a2, m2, j2] = jusqua.split("-").map(Number);
  let n = a2 - a1;
  if (m2 < m1 || (m2 === m1 && j2 < j1)) n -= 1;
  return n;
}

/* ═══════════ ÉCRAN 1 : CE QUI MANQUE ═══════════
   Rend la liste des champs mal remplis, avec la raison. Jamais un « formulaire
   incomplet » tout seul : le client doit savoir QUOI corriger. */
export function ceQuiManque(client) {
  const c = client && typeof client === "object" ? client : {};
  const manques = [];

  for (const champ of CHAMPS_DU_CLIENT) {
    if (champ.obligatoire && vide(c[champ.cle])) {
      manques.push({ cle: champ.cle, dit: champ.nom + " : à remplir" });
    }
  }
  if (!vide(c.courriel) && !MAIL.test(String(c.courriel).trim())) {
    manques.push({ cle: "courriel", dit: "Cet e-mail n'a pas l'air juste." });
  }
  if (!vide(c.telephone) && chiffres(c.telephone) < 8) {
    manques.push({ cle: "telephone", dit: "Ce téléphone est trop court." });
  }
  for (const cle of ["neLe", "permisLe"]) {
    if (!vide(c[cle]) && !JOUR.test(String(c[cle]))) {
      manques.push({ cle, dit: "Cette date n'est pas une date." });
    }
  }
  return manques;
}

/* ═══════════ ÉCRAN 2 : L'ÂGE ET LE PERMIS ═══════════

   🚨 ON REFUSE EN EXPLIQUANT, ET SANS JUGER.
   Sa consigne : « si la date de naissance donne moins de 21 ans, ou si le
   permis a moins d'un an, on affiche un message gentil et on bloque ».

   ⚠️ ET LES DEUX SEUILS VIENNENT DU LOUEUR. Zéro = il n'en annonce pas, et
   on ne vérifie rien : ce n'est pas à DMïana de décider qui peut louer. */
export function ceQuiBloque(client, reglages, aujourdhui) {
  const c = client && typeof client === "object" ? client : {};
  const r = reglages && typeof reglages === "object" ? reglages : {};
  const jour = JOUR.test(String(aujourdhui || "")) ? aujourdhui : "";
  const refus = [];
  if (!jour) return refus;

  const ageMin = Math.max(0, Math.trunc(Number(r.ageMin) || 0));
  const permisMin = Math.max(0, Math.trunc(Number(r.permisAns) || 0));

  if (ageMin && JOUR.test(String(c.neLe || ""))) {
    const age = annees(c.neLe, jour);
    if (age >= 0 && age < ageMin) {
      refus.push({
        cle: "neLe",
        dit: "Nos véhicules se louent à partir de " + ageMin + " ans. "
          + "Écrivez-nous : selon le véhicule, c'est parfois possible autrement.",
      });
    }
  }

  if (permisMin && JOUR.test(String(c.permisLe || ""))) {
    const anciennete = annees(c.permisLe, jour);
    if (anciennete >= 0 && anciennete < permisMin) {
      refus.push({
        cle: "permisLe",
        dit: "Il faut un permis depuis au moins " + permisMin + " an"
          + (permisMin > 1 ? "s" : "") + ". Écrivez-nous, nous verrons ensemble.",
      });
    }
  }

  return refus;
}

/* Les trois cases obligatoires de l'écran 2. Leur texte dépend de ce que le
   loueur a annoncé : sans âge minimum, la case n'a pas lieu d'être. */
export function casesAAccepter(reglages, nomDeLaBoutique) {
  const r = reglages && typeof reglages === "object" ? reglages : {};
  const cases = [];
  const ageMin = Math.max(0, Math.trunc(Number(r.ageMin) || 0));
  const permisMin = Math.max(0, Math.trunc(Number(r.permisAns) || 0));

  if (ageMin) cases.push({ id: "age", dit: "J'ai au moins " + ageMin + " ans" });
  if (permisMin) {
    cases.push({
      id: "permis",
      dit: "J'ai mon permis depuis au moins " + permisMin + " an" + (permisMin > 1 ? "s" : ""),
    });
  }
  if (String(r.conditions || "").trim()) {
    cases.push({
      id: "conditions",
      dit: "J'ai lu et j'accepte les conditions générales de location"
        + (nomDeLaBoutique ? " de " + nomDeLaBoutique : ""),
    });
  }
  return cases;
}

/* ═══════════ SIGNER ═══════════

   Rend { ok, numero, pourquoi }. Les mots de refus sont ceux de la base :
     pris        les dates viennent d'être prises
     incomplet   un nom ou une signature manquent
     boutique    l'adresse n'est pas celle d'une boutique
     trop        vingt contrats dans la journée
     reseau      on n'a pas pu joindre la base */
export async function signerLeContrat(corps) {
  if (!PRETE) return { ok: false, pourquoi: "reseau" };
  try {
    const r = await fetch(BASE.url + "/rest/v1/rpc/signer_un_contrat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: BASE.cle,
        Authorization: "Bearer " + BASE.cle,
      },
      body: JSON.stringify(corps),
    });
    if (!r.ok) return { ok: false, pourquoi: "reseau" };
    const d = await r.json();
    if (!d || typeof d !== "object") return { ok: false, pourquoi: "reseau" };
    return {
      ok: d.ok === true,
      id: String(d.id || ""),
      numero: String(d.numero || ""),
      pourquoi: String(d.pourquoi || ""),
    };
  } catch (e) {
    return { ok: false, pourquoi: "reseau" };
  }
}

/* ═══════════ LE PDF ET LES DEUX MAILS ═══════════

   🚨 ON N'ATTEND PAS, ET C'EST TOUT L'INTÉRÊT.
   Fabriquer quinze pages de PDF prend quelques secondes. Les faire regarder
   au client juste après qu'il a signé serait la pire seconde du parcours —
   et une panne de notre côté lui ferait croire que sa signature n'a pas
   compté. Elle a compté : le contrat est DÉJÀ dans la base. Le document
   arrive derrière, par mail.

   ⚠️ ET ON NE DIT RIEN SI ÇA RATE. Le loueur retrouve le contrat dans son
   atelier de toute façon ; annoncer au client une panne qui ne le concerne
   pas n'ajouterait que de l'inquiétude.

   ⚠️ ET ON REND UNE PROMESSE, SANS OBLIGER À L'ATTENDRE.
   L'écran affiche tout de suite « votre contrat est signé » ; quand le PDF
   est prêt — quelques secondes plus tard — un bouton apparaît pour l'ouvrir.
   Le client n'attend rien, et il n'a pas besoin de son courrier pour avoir
   son document. */
export function fabriquerLePdf(id) {
  if (!PRETE || !id) return Promise.resolve("");
  try {
    return fetch(BASE.url + "/functions/v1/contrat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: BASE.cle,
        Authorization: "Bearer " + BASE.cle,
      },
      body: JSON.stringify({ id }),
      /* Le client ferme souvent l'onglet juste après : « keepalive » laisse
         la demande partir quand même. */
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && d.ok === true ? String(d.lien || "") : ""))
      .catch(() => "");
  } catch (e) {
    /* rien : le contrat est signé, c'est ce qui compte */
    return Promise.resolve("");
  }
}

/* Ce qu'on dit quand ça n'a pas marché. Jamais le mot de la base : « pris »
   n'est pas une phrase. */
export function phraseDeRefusDuContrat(pourquoi) {
  if (pourquoi === "pris") return "Ces dates viennent d'être réservées par quelqu'un d'autre. Choisissez-en d'autres — le calendrier est à jour.";
  if (pourquoi === "incomplet") return "Il manque votre nom ou votre signature.";
  if (pourquoi === "trop") return "Beaucoup de demandes aujourd'hui. Réessayez dans quelques minutes, ou écrivez-nous directement.";
  if (pourquoi === "reseau") return "Nous n'avons pas pu enregistrer votre contrat. Vérifiez votre connexion, ou écrivez-nous : nous ferons la réservation à la main.";
  return "Votre contrat n'a pas pu être enregistré. Écrivez-nous, nous le ferons ensemble.";
}

/* ═══════════ CE QUE LE CLIENT RETROUVE LA PROCHAINE FOIS ═══════════

   🚨 SUR SON TÉLÉPHONE, ET NULLE PART AILLEURS.
   Sa consigne : « la prochaine fois, ses infos sont déjà remplies : elles
   sont gardées sur son téléphone uniquement, avec un bouton Oublier mes
   infos ». Rien ne part ailleurs, et un téléphone partagé se vide d'un
   geste. */
const CLE_MEMOIRE = "dmiana-contrat-location";

export function relireSesInfos() {
  try {
    const brut = localStorage.getItem(CLE_MEMOIRE);
    const d = brut ? JSON.parse(brut) : null;
    return d && typeof d === "object" ? d : {};
  } catch (e) {
    return {};
  }
}

export function garderSesInfos(client) {
  try {
    localStorage.setItem(CLE_MEMOIRE, JSON.stringify(client || {}));
  } catch (e) { /* navigation privée, stockage plein : tant pis */ }
}

export function oublierSesInfos() {
  try { localStorage.removeItem(CLE_MEMOIRE); } catch (e) { /* rien */ }
}
