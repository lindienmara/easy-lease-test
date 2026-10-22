// LE MOTEUR DES BOUTIQUES DE LOCATION
// ===================================
// Une flotte de véhicules, leurs caractéristiques, et un calendrier par
// véhicule où le visiteur choisit ses dates. Rien d'autre.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CE FICHIER NE CONNAÎT PAS LA VENTE, ET NE DOIT JAMAIS L'APPRENDRE.   │
// │                                                                         │
// │ Pas de panier : une voiture se loue une fois à la fois, il n'y a pas de │
// │ quantité à choisir. Pas de taille ni de couleur : on ne demande pas sa  │
// │ pointure pour une Clio. Pas de frais d'envoi, pas d'« envoi offert dès  │
// │ 50 € » — on ne livre pas une voiture dans un carton.                    │
// │                                                                         │
// │ À l'inverse, App.jsx — le moteur de VENTE — ne connaît ni date, ni      │
// │ caution, ni calendrier, et n'a aucune raison de les apprendre.          │
// │                                                                         │
// │ Ce qu'ils partagent vit dans commun.jsx : les couleurs, les polices,    │
// │ les photos, les vidéos, la messagerie, les écrans Infos / Liens / Avis. │
// │ Une correction faite là profite aux deux.                               │
// │                                                                         │
// │ `node outils/verifier-separation.mjs` refuse la fabrication si l'un     │
// │ déborde sur l'autre. Ce n'est pas du style : c'est la garantie qu'on    │
// │ peut corriger la location sans rien casser dans la vente.               │
// └─────────────────────────────────────────────────────────────────────────┘
//
// L'aiguillage entre les deux se fait dans main.jsx, avant que quoi que ce
// soit se construise.

import React, { useState, useMemo, useEffect, useRef } from "react";
/* Le dessin de secours d'un véhicule. « visuelProduit » rend la photo si
   elle existe, et sinon la silhouette dessinée dans visuels.js — citadine,
   berline, SUV ou utilitaire selon la catégorie.

   🚨 Ne jamais passer la photo seule à <Photo source=…> : sans photo, la
      source est vide, et le navigateur affiche une image cassée avec le nom
      du véhicule écrit à côté. Une boutique neuve est pleine de véhicules
      sans photo — c'est son état normal le premier jour. */
import { visuelProduit } from "./visuels.js";
import {
  ChevronLeft, ChevronRight, X, Home, Info, Link2, Star, MessageCircle,
  Calendar, Users, Fuel, Gauge, Briefcase, ShieldCheck, Check, AlertTriangle,
  Settings, Key, Maximize2,
} from "lucide-react";

import {
  /* ── le socle : ce qui habille la boutique ── */
  FONTS, ANIMATIONS, CASCADE, DEGRADE, TITRE, CORPS, INTRO,
  FOND_PAGE, FOND_IMAGE, COLONNE, CARTE, VOILE,
  STYLE_PHOTO, PROPORTION_PHOTO,
  fond, fondCarte, bordure, texte, texteDoux, rose, violet, vert, jaune, cyan,

  /* ── la boutique et son catalogue ── */
  APERCU, VERS, MOUVEMENT_REDUIT, BOUTIQUE, FAMILLES, TOUS_PRODUITS, GALERIE, SECOURS, EN_RUPTURE,

  /* ── les briques d'écran, neutres ── */
  Photo, CadreVideo, Video, BarreSection, RemonterEnHaut,
  MoyensDePaiement, Mesures, EcranInfo, EcranLiens, EcranAvis,
  Intro, Visionneuse,

  /* ── la conversation avec le loueur ──
     « LIVRAISON » est un champ de texte libre que le propriétaire remplit.
     Dans une boutique de vente il sert à demander l'adresse ; ici il sert à
     demander le nom, le téléphone, l'ancienneté du permis. C'est le même
     champ, recopié tel quel à la fin du message — rien à voir avec un calcul
     de frais de port, qui lui n'entre pas dans ce fichier. */
  MESSAGERIE, CONTACT, PAIEMENTS, PEUT_COMMANDER, LIVRAISON as MENTIONS,
  referenceCommande, copierAvantDePartir, ouvrirDehors, clicLien, vibrer,
  telegram, tgEssayer, AVIS,
  PiedLegal,
} from "./commun.jsx";

import {
  jourValide, nbJours, prisLe, periodeQuiGene, grilleMois, moisDecale,
  MOIS, JOURS_COURTS, aujourdhui, enClair, periodeEnClair, morceaux,
} from "./location-dates.js";

/* 🚨 « euros » N'EST PLUS IMPORTÉ ICI, ET C'EST LE GARDE-FOU DU BUG N°5.
   ──────────────────────────────────────────────────────────────────────
   Le « euros » partagé écrit toujours deux décimales : « 80,00 € ». Un loueur
   affiche « 80 € » et « 2 500 € ». Tant qu'il restait importé, un prix oublié
   pouvait garder l'ancien format sans que rien ne le signale.

   En le retirant, le moindre « euros( » qui traînerait fait ÉCHOUER la
   fabrication. On ne peut plus en oublier un. */
import {
  eurosLocation, prixLocation, uniteAffichee, ligneDeCompte, meilleurPrix, optionsDuVehicule,
} from "./location-prix.js";
import {
  cartesPratiques, documentsAApporter, carteOuQuand, equipementsDe, sectionsDesConditions,
} from "./location-infos.js";
import { GalerieVehicule } from "./location-galerie.jsx";
import {
  lireLesJoursPris, reserverDesDates, periodesDesReservations, phraseDeRefus,
} from "./location-reservations.js";
import { ParcoursDuContrat } from "./location-parcours.jsx";

/* ═══════════════════════════ LA FLOTTE ═══════════════════════════
   Un véhicule EST un produit du catalogue : même fiche, mêmes photos, même
   façon de l'écrire dans l'atelier. Il porte seulement quelques champs de
   plus — places, boîte, carburant… — et ses jours déjà pris.

   Les familles du catalogue deviennent ses CATÉGORIES : citadine, berline,
   SUV, utilitaire. C'est ce qui permet de filtrer la flotte sans rien
   inventer de nouveau. */
const FLOTTE = TOUS_PRODUITS;

// Les catégories qui ont au moins un véhicule. Une catégorie vide dans le
// filtre mènerait à un écran blanc, et ferait croire à une panne.
const CATEGORIES = FAMILLES.filter((f) => FLOTTE.some((v) => v.famille.id === f.id));

/* L'état d'un véhicule, aujourd'hui. Trois réponses possibles, et une seule
   à la fois :

   — « arrêté » : le propriétaire l'a mis hors service (révision, réparation).
     C'est l'interrupteur qu'il demande, et il ferme tout : pas de calendrier,
     pas de demande possible.
   — « loué »   : il est pris aujourd'hui. On dit jusqu'à quand, sinon le
     visiteur ne sait pas s'il doit revenir dans deux jours ou dans trois mois.
   — « libre »  : disponible dès maintenant. */
function etatDuJour(v, jour) {
  if (EN_RUPTURE(v)) return { genre: "arrete", mot: "Indisponible", couleur: texteDoux };
  /* Le jour de préparation compte comme pris : un véhicule qu'on ne peut
     pas réserver aujourd'hui n'est pas « disponible aujourd'hui ». */
  const pris = prisLe(jour, periodesAvecBattement(v));
  if (pris) return { genre: "loue", mot: pris.motif === "Préparation du véhicule" ? "En préparation" : "Loué jusqu'au " + enClair(pris.au), couleur: jaune };
  return { genre: "libre", mot: "Disponible", couleur: vert };
}

/* ═══════ COMBIEN SONT DISPONIBLES AUJOURD'HUI — COMPTÉ UNE SEULE FOIS ═══════

   🚨 LE DÉFAUT N°7 : « 5 LIBRES » NE DISAIT PAS DE QUAND IL PARLAIT.

   Le carré en haut à droite affichait un chiffre et le mot « LIBRES », sans
   date. Or il ne compte qu'AUJOURD'HUI : demain, trois de ces cinq peuvent
   être partis. Un visiteur qui cherche des dates dans trois semaines lisait
   une promesse qui ne le concernait pas.

   ⚠️ ET IL SE RECOMPTAIT À CHAQUE DESSIN. Le même calcul tournait dans
   l'entête, dans le titre de la flotte, et à chaque frappe sur un filtre —
   une boucle sur toute la flotte, avec une recherche de période par véhicule.
   Ici, une fois pour la visite : la flotte ne change pas pendant qu'on la
   regarde, et le jour non plus. */
const AUJOURDHUI = aujourdhui();
const DISPONIBLES = FLOTTE.filter((v) => etatDuJour(v, AUJOURDHUI).genre === "libre").length;

/* ═══════ L'ORDRE DE LA FLOTTE — DÉFAUT N°4 ═══════

   « Coup de cœur » et « En vedette » existent dans l'éditeur du loueur, et ne
   faisaient RIEN sur la boutique de location : le loueur cochait, et rien ne
   bougeait. Un réglage sans effet est pire qu'un réglage absent — il fait
   croire qu'on a agi.

   Les véhicules en vedette passent devant, dans leur ordre d'origine. Le
   « coup de cœur » (le champ « chef » de l'éditeur) ne change pas l'ordre :
   il met un badge. Les deux se cumulent sans se gêner. */
const ordonnee = (liste) => [
  ...liste.filter((v) => v.vedette),
  ...liste.filter((v) => !v.vedette),
];

/* ═══════ CE QUE LE LOUEUR DEMANDE AU CLIENT — DÉFAUT N°6 ═══════

   🚨 « POUR L'ENVOI DU COLIS, COMPLÈTE CES TROIS LIGNES » SUR UNE VOITURE.

   Le champ est partagé avec la vente, où il sert à réclamer l'adresse de
   livraison. En location, le loueur y met ce qu'il veut — nom, téléphone,
   ancienneté du permis. Mais à la CRÉATION, toutes les boutiques reçoivent le
   même texte par défaut : celui du colis. Un loueur qui n'y a jamais touché
   envoyait donc « Adresse complète (rue, code postal, ville) » et « la
   commande est prise en charge sous 24 h » dans une demande de location.

   ⚠️ ON NE LE REMPLACE PAR RIEN, c'est sa consigne. Un texte inventé à la
   place serait une phrase que le loueur n'a pas écrite — et il la découvrirait
   dans la conversation d'un client.

   ⚠️ ET ON RECONNAÎT LE TEXTE DE VENTE PLUTÔT QUE DE SE FIER À LA CRÉATION.
   Neuf boutiques existent déjà, créées avant cette correction : les réparer
   une par une laisserait passer la dixième. Le moteur refuse ce texte-là,
   quelle que soit la boutique — et un loueur qui écrirait VRAIMENT un mot sur
   l'envoi d'un colis garde le sien, puisqu'on ne reconnaît que la phrase
   exacte du défaut. */
const DEMANDE_DU_LOUEUR = /^\s*Pour l'envoi du colis/.test(MENTIONS) ? "" : MENTIONS;

/* ═══════ LES RÉGLAGES DU LOUEUR ═══════ — consigne N°24
   « location » n'existe dans config.js que si le loueur a rempli quelque
   chose : une boutique d'avant cette version n'a pas la ligne, et tout ce
   qui en dépend se tait. C'est la même prudence que pour le reste du
   moteur — une boutique publiée il y a six mois a un config.js d'il y a six
   mois. */
const REGLAGES = (BOUTIQUE.location && typeof BOUTIQUE.location === "object") ? BOUTIQUE.location : {};
const HORAIRES = String(REGLAGES.horaires || "").trim();

/* 🚨 LA RÉSERVATION EN LIGNE EST ÉTEINTE PARTOUT, SAUF SI LE LOUEUR L'A
   ALLUMÉE — consigne N°25, interrupteur 1. Éteinte, rien de ce qui suit ne
   s'exécute : pas d'appel à la base, pas de lecture, pas d'écriture, et la
   boutique se comporte exactement comme hier. */
const RESERVATION_EN_LIGNE = REGLAGES.reservationEnLigne === true;

/* 🚨 LE CONTRAT SIGNÉ EXIGE LES DEUX INTERRUPTEURS — consigne N°25, n°2.
   Signer BLOQUE les dates dans la base : c'est le même geste. Si la
   réservation en ligne était éteinte, le calendrier ne lirait jamais ces
   dates, et la boutique montrerait libre un véhicule déjà sous contrat. On
   exige donc les deux, ici et dans l'assistant du loueur (le deuxième
   interrupteur ne s'affiche qu'après le premier). */
const CONTRAT_EN_LIGNE = REGLAGES.contratEnLigne === true && RESERVATION_EN_LIGNE;

/* ═══════ UNE BOUTIQUE D'ESSAI ═══════ — consigne N°27
   Une COPIE qu'un loueur ouvre sur son téléphone pour essayer les nouveautés
   avant qu'on les mette dans sa vraie boutique. Elle le dit dans un bandeau
   à chaque page, et elle se cache des moteurs de recherche. */
const ESSAI = BOUTIQUE.essai === true;

/* 🚨 ET ELLE NE DOIT PAS SE RETROUVER DANS GOOGLE.
   ──────────────────────────────────────────────
   Une copie d'une vraie boutique, avec ses vrais véhicules et ses vrais
   prix, indexée à côté de l'originale : le client tomberait sur la fausse.
   On pose donc la balise « robots » au démarrage.

   ⚠️ POURQUOI ICI ET PAS DANS index.html : index.html appartient au MOTEUR,
   il est le même pour toutes les boutiques et il est remplacé à chaque mise
   à jour du moteur. Une balise écrite là serait perdue au premier
   remplacement — et personne ne s'en apercevrait. Ici, elle revient à chaque
   ouverture de la page, tant que la boutique est marquée d'essai. */
if (ESSAI) {
  try {
    const balise = document.createElement("meta");
    balise.name = "robots";
    balise.content = "noindex, nofollow, noarchive";
    document.head.appendChild(balise);
  } catch (e) { /* un très vieux navigateur : le bandeau reste, lui */ }
}

/* 🚨 L ADRESSE DE LA BOUTIQUE, C EST « location.origin » — PAS « VERS ».
   Mesuré le 22 octobre 2026, dans un vrai navigateur : « VERS » est
   l adresse CIBLE d un aperçu de l atelier, et elle est VIDE dans une
   boutique publiée. L appel partait donc avec « boutique_: "" », la base
   répondait « cette adresse n est pas une boutique », et aucune date ne se
   bloquait jamais — sans un mot à l écran, puisqu on ne montre pas nos
   pannes au client. C est le compteur de visites qui donne la bonne
   réponse : il envoie « location.origin » depuis le premier jour. */
const ADRESSE_DE_LA_BOUTIQUE = (() => {
  try { return window.location.origin; } catch (e) { return ""; }
})();

/* Les heures proposées : de 7 h à 20 h, par demi-heures. Elles ne servent
   que si le loueur a écrit ses horaires — voir le panneau de la demande. */
const HEURES = (() => {
  const liste = [];
  for (let h = 7; h <= 20; h += 1) {
    liste.push(String(h).padStart(2, "0") + ":00");
    if (h < 20) liste.push(String(h).padStart(2, "0") + ":30");
  }
  return liste;
})();

/* ═══════════════════════ UNE CARACTÉRISTIQUE ═══════════════════════
   Toujours la même forme, toujours le même ordre, d'un véhicule à l'autre.
   C'est tout l'intérêt des champs fixes : l'œil apprend où regarder, et
   comparer deux voitures ne demande plus de lire deux paragraphes. */
function Pastille({ Icone, children, titre }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1"
      style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}` }}
      title={titre}
    >
      <Icone size={13} color={texteDoux} />
      <span style={{ fontFamily: CORPS, fontSize: 11.5, fontWeight: 600, color: texte, whiteSpace: "nowrap" }}>
        {children}
      </span>
    </span>
  );
}

// Les pastilles d'un véhicule, dans l'ordre. On n'affiche que ce qui est
// rempli : une ligne « places : 0 » ne renseigne personne.
function Caracteristiques({ v, compact = false }) {
  const bouts = [];
  /* L année en premier : c est ce qu on regarde avant tout le reste sur une
     annonce de location — elle situe le modèle, son équipement et son état. */
  if (v.annee) bouts.push({ Icone: Calendar, texte: v.annee, titre: "Année du modèle" });
  if (v.places > 0) bouts.push({ Icone: Users, texte: v.places + " places", titre: "Nombre de places" });
  if (v.portes > 0) bouts.push({ Icone: Key, texte: v.portes + " portes", titre: "Nombre de portes" });
  if (v.boite) bouts.push({ Icone: Settings, texte: v.boite === "automatique" ? "Auto" : "Manuelle", titre: "Boîte de vitesses" });
  if (v.carburant) bouts.push({ Icone: Fuel, texte: v.carburant, titre: "Carburant" });
  if (v.bagages > 0) bouts.push({ Icone: Briefcase, texte: v.bagages + " bagages", titre: "Nombre de bagages" });
  if (v.kilometrage) bouts.push({ Icone: Gauge, texte: v.kilometrage, titre: "Kilométrage" });

  if (!bouts.length) return null;
  const montrees = compact ? bouts.slice(0, 4) : bouts;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {montrees.map((b) => (
        <Pastille key={b.titre} Icone={b.Icone} titre={b.titre}>{b.texte}</Pastille>
      ))}
    </div>
  );
}

/* ═══════════════════════ LE PRIX AFFICHÉ ═══════════════════════

   Gros, et toujours suivi de SON unité : un chiffre nu laisse le doute entre
   le jour, la semaine et le forfait, et c'est exactement le doute qui fait
   partir un visiteur.

   🚨 DÉFAUT N°2 : L'UNITÉ ÉTAIT ÉCRITE EN DUR. Ce composant s'appelait
   « PrixParJour » et affichait « / jour » quoi qu'il arrive. Le loueur
   choisissait « / semaine » dans l'éditeur, et sa boutique annonçait un prix
   par jour. Maintenant c'est son mot à lui qu'on montre.

   🚨 DÉFAUT N°3 : LA REMISE NE SE VOYAIT PAS. « EN_PROMOTION » baissait déjà
   le prix — le client payait moins — mais la boutique n'en disait rien : ni
   prix barré, ni pastille. Le loueur faisait un geste commercial que personne
   ne voyait. C'est le pire des deux mondes : il perd de la marge ET il n'y
   gagne aucun client.

   Le prix d'origine arrive dans « prixInitial », et le taux dans « remise » —
   posés par le socle commun, les mêmes que pour la vente. Rien à calculer
   ici : seulement à les montrer. */
function PrixAffiche({ v, taille = 20 }) {
  const avant = Number(v.prixInitial) || 0;
  const remise = Number(v.remise) || 0;
  const enPromo = avant > v.prix && remise > 0;

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      {enPromo && (
        <span
          style={{
            fontFamily: CORPS, fontSize: Math.max(10, taille * 0.56), color: texteDoux,
            textDecoration: "line-through", textDecorationThickness: 2, whiteSpace: "nowrap",
          }}
        >
          {eurosLocation(avant)}
        </span>
      )}
      <span className="inline-flex items-baseline gap-1" style={{ whiteSpace: "nowrap" }}>
        <span
          style={{
            fontFamily: TITRE, fontSize: taille, letterSpacing: ".5px",
            backgroundImage: `linear-gradient(90deg, ${jaune}, ${vert})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}
        >
          {eurosLocation(v.prix)}
        </span>
        <span style={{ fontFamily: CORPS, fontSize: Math.max(10, taille * 0.52), color: texteDoux, fontWeight: 600 }}>
          {uniteAffichee(v.unite)}
        </span>
      </span>
      {enPromo && (
        <span
          className="rounded-md px-1.5 py-0.5"
          style={{ background: rose, whiteSpace: "nowrap" }}
        >
          <span style={{ fontFamily: CORPS, fontSize: Math.max(9.5, taille * 0.48), fontWeight: 800, color: "#fff" }}>
            −{remise} %
          </span>
        </span>
      )}
    </span>
  );
}

/* Le badge « coup de cœur » — défaut n°4. Le champ existe depuis toujours dans
   l'éditeur (« ★ En avant »), et la boutique de location l'ignorait. */
function CoupDeCoeur({ petit = false }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1"
      style={{ background: jaune + "22", border: `1px solid ${jaune}66`, whiteSpace: "nowrap" }}
    >
      <Star size={petit ? 11 : 13} color={jaune} fill={jaune} />
      <span style={{ fontFamily: CORPS, fontSize: petit ? 10 : 11.5, fontWeight: 800, color: jaune, letterSpacing: ".3px" }}>
        Coup de cœur
      </span>
    </span>
  );
}

/* ═══════════════════════ LA VIGNETTE D'UN VÉHICULE ═══════════════════════ */
function CarteVehicule({ v, rang, onOuvrir }) {
  const photos = GALERIE(v);
  const visuel = visuelProduit(v, v.famille.couleurs, v.famille.glyphe);
  const etat = etatDuJour(v, aujourdhui());
  const arrete = etat.genre === "arrete";

  return (
    <button
      onClick={() => { vibrer("leger"); onOuvrir(v); }}
      className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-transform atelier-monte"
      style={{
        background: CARTE,
        border: `1px solid ${bordure}`,
        // Un véhicule arrêté reste visible — le visiteur peut vouloir le
        // repérer pour plus tard — mais il s'efface du regard.
        opacity: arrete ? 0.55 : 1,
        ...CASCADE(rang),
      }}
    >
      <div className="relative">
        <Photo
          produit={v}
          secours={SECOURS(v, v.famille)}
          source={visuel}
          alt={v.nom}
          className="w-full block"
        />
        <span
          className="absolute top-2 left-2 rounded-lg px-2 py-1"
          style={{ background: "#0B0B0BE6", border: `1px solid ${etat.couleur}44` }}
        >
          <span style={{ fontFamily: CORPS, fontSize: 10.5, fontWeight: 800, color: etat.couleur, letterSpacing: ".3px" }}>
            {etat.mot}
          </span>
        </span>
        {photos.length > 1 && (
          <span
            className="absolute bottom-2 right-2 rounded-lg px-1.5 py-0.5 flex items-center gap-1"
            style={{ background: "#0B0B0BE6" }}
          >
            <Maximize2 size={11} color="#fff" />
            <span style={{ fontFamily: CORPS, fontSize: 10, color: "#fff", fontWeight: 700 }}>{photos.length}</span>
          </span>
        )}
      </div>

      <div className="p-3">
        <p style={{ fontFamily: CORPS, fontSize: 10.5, color: texteDoux, letterSpacing: ".6px", fontWeight: 700 }}>
          {(v.famille.nom || "").toUpperCase()}
        </p>
        <p
          className="mt-0.5"
          style={{ fontFamily: TITRE, fontSize: 18, color: texte, letterSpacing: ".4px", overflowWrap: "anywhere" }}
        >
          {v.nom}
        </p>

        {v.chef && <div className="mt-1.5"><CoupDeCoeur petit /></div>}

        <Caracteristiques v={v} compact />
        <Equipements v={v} petit />

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <PrixAffiche v={v} taille={19} />
            {v.caution > 0 && (
              <p className="mt-0.5" style={{ fontFamily: CORPS, fontSize: 10.5, color: texteDoux }}>
                caution {eurosLocation(v.caution)}
              </p>
            )}
          </div>
          <span
            className="rounded-xl px-3 py-2 flex items-center gap-1 flex-shrink-0"
            style={{ backgroundImage: DEGRADE }}
          >
            <Calendar size={13} color="#fff" />
            <span style={{ fontFamily: CORPS, fontSize: 11.5, fontWeight: 800, color: "#fff" }}>
              {arrete ? "Voir" : "Dates"}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════ L'ACCUEIL : TOUTE LA FLOTTE ═══════════════════════ */
function EcranFlotte({ onVehicule }) {
  const [categorie, setCategorie] = useState("toutes");

  const vehicules = useMemo(
    () => ordonnee(categorie === "toutes" ? FLOTTE : FLOTTE.filter((v) => v.famille.id === categorie)),
    [categorie]
  );

  return (
    <>
      <div className="px-3 pt-4">
        {/* 🚨 DÉFAUT N°1 : LE TITRE DE LA FLOTTE DISAIT « JE SOUHAITE COMMANDER ».
            ──────────────────────────────────────────────────────────────────
            Sur la boutique d'Easy Lease, en haut de la page : « Bonjour Easy
            lease, je souhaite commander : ». C'est l'accroche par défaut des
            boutiques de VENTE, posée à la création, et réutilisée ici comme
            titre. On ne commande pas une voiture, on la réserve — et un titre
            qui s'adresse au loueur à la place du client n'a aucun sens.

            Le titre devient le SOUS-TITRE du loueur s'il en a mis un (son
            slogan), sinon « Nos véhicules ». L'accroche de vente ne sert plus
            de titre nulle part en location. */}
        <p style={{ fontFamily: TITRE, fontSize: 24, color: texte, letterSpacing: ".5px", lineHeight: 1.1 }}>
          {(BOUTIQUE.sousTitre || "").trim() || "Nos véhicules"}
        </p>
        <p className="mt-1.5" style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux, lineHeight: 1.55 }}>
          {FLOTTE.length} véhicule{FLOTTE.length > 1 ? "s" : ""}
          {DISPONIBLES > 0 ? ` — ${DISPONIBLES} disponible${DISPONIBLES > 1 ? "s" : ""} aujourd'hui` : " — aucun disponible aujourd'hui"}.
          {" "}Choisissez un véhicule pour voir son calendrier.
        </p>
      </div>

      {/* Le filtre par catégorie. Caché s'il n'y a qu'une catégorie : un
          filtre à un seul choix ne filtre rien et occupe une ligne. */}
      {CATEGORIES.length > 1 && (
        <div className="mt-3 px-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[{ id: "toutes", nom: "Tous", emoji: "🔑" }, ...CATEGORIES].map((c) => {
            const actif = categorie === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { vibrer("leger"); setCategorie(c.id); }}
                className="flex-shrink-0 rounded-xl px-3 py-2 active:scale-95 transition-transform"
                style={{
                  // Voir le bouton de demande plus bas : pas de raccourci
                  // « background » à côté d'un « backgroundImage ».
                  backgroundColor: actif ? "transparent" : CARTE,
                  backgroundImage: actif ? DEGRADE : "none",
                  border: `1px solid ${actif ? "transparent" : bordure}`,
                }}
              >
                <span style={{ fontFamily: CORPS, fontSize: 12, fontWeight: 700, color: actif ? "#fff" : texteDoux, whiteSpace: "nowrap" }}>
                  {c.emoji ? c.emoji + " " : ""}{c.nom}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="px-3 mt-3 flex flex-col gap-3">
        {vehicules.length === 0 ? (
          <div className="rounded-2xl px-4 py-6 text-center" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
            <p style={{ fontFamily: TITRE, fontSize: 18, color: texte }}>Aucun véhicule ici</p>
            <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux }}>
              Cette catégorie est vide pour le moment.
            </p>
            <button
              onClick={() => setCategorie("toutes")}
              className="mt-4 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{ backgroundImage: DEGRADE, color: "#fff", fontFamily: CORPS, fontSize: 13, fontWeight: 700 }}
            >
              Voir toute la flotte
            </button>
          </div>
        ) : (
          vehicules.map((v, i) => <CarteVehicule key={v.cle} v={v} rang={i} onOuvrir={onVehicule} />)
        )}
      </div>

      <RemonterEnHaut articles={vehicules.length} seuil={6} />
    </>
  );
}

/* ═════════════════════════════ LE CALENDRIER ═════════════════════════════
   Le cœur de la boutique, et la pièce la plus délicate à l'écran.

   On montre un mois entier, et chaque jour dit ce qu'il est : libre, déjà
   pris, passé, ou choisi. Le visiteur appuie sur son jour de départ, puis sur
   son jour de retour. Les deux bornes sont comprises.

   ⚠️ UN JOUR DÉJÀ PRIS N'EST PAS SEULEMENT GRISÉ : IL EST INCLIQUABLE.
   Un bouton qui a l'air cliquable et qui ne répond pas fait croire à une
   panne. Celui-là n'est pas un bouton — c'est une case barrée, et l'œil
   comprend tout seul.

   Le calcul des dates lui-même n'est pas ici : il est dans location-dates.js,
   éprouvé à part par outils/verifier-dates.mjs. */
/* Les hachures d'un jour pris. Dessinées plutôt que colorées : une teinte
   se confond toujours avec une palette, une rayure jamais. Elles tiennent
   aussi pour qui distingue mal les couleurs — et c'est une case sur laquelle
   on ne peut pas appuyer : il faut que ça se voie avant d'essayer. */
const HACHURE =
  "repeating-linear-gradient(45deg, transparent 0 3px, rgba(255,255,255,.09) 3px 6px)";

function Calendrier({ periodes, du, au, onJour, arrete }) {
  const jour = aujourdhui();
  const debut = morceaux(du) || morceaux(jour);

  // On ouvre sur le mois du départ choisi, sinon sur le mois en cours.
  const [vue, setVue] = useState({ annee: debut.a, mois: debut.mo });
  const semaines = useMemo(() => grilleMois(vue.annee, vue.mois), [vue.annee, vue.mois]);

  /* On ne remonte pas avant le mois en cours : le passé ne se loue pas, et une
     flèche qui mène à des mois entièrement éteints n'est qu'un piège. */
  const maintenant = morceaux(jour);
  const auPlusTot = vue.annee === maintenant.a && vue.mois === maintenant.mo;

  const changerMois = (pas) => {
    vibrer("leger");
    setVue(moisDecale(vue.annee, vue.mois, pas));
  };

  return (
    <div className="rounded-2xl p-3" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
      {/* le mois, et les deux flèches */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => changerMois(-1)}
          disabled={auPlusTot}
          aria-label="Mois précédent"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: auPlusTot ? "transparent" : VOILE(fondCarte, "D9"),
            border: `1px solid ${auPlusTot ? "transparent" : bordure}`,
            opacity: auPlusTot ? 0.25 : 1,
          }}
        >
          <ChevronLeft size={18} color={texte} />
        </button>
        <p style={{ fontFamily: TITRE, fontSize: 16, color: texte, letterSpacing: ".5px" }}>
          {MOIS[vue.mois - 1].toUpperCase()} {vue.annee}
        </p>
        <button
          onClick={() => changerMois(1)}
          aria-label="Mois suivant"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}` }}
        >
          <ChevronRight size={18} color={texte} />
        </button>
      </div>

      {/* les jours de la semaine, lundi en premier */}
      <div className="grid grid-cols-7 gap-1 mt-3">
        {JOURS_COURTS.map((j, i) => (
          <div key={i} className="text-center py-1">
            <span style={{ fontFamily: CORPS, fontSize: 10.5, fontWeight: 800, color: texteDoux }}>{j}</span>
          </div>
        ))}
      </div>

      {/* les cases */}
      <div className="grid grid-cols-7 gap-1 mt-0.5">
        {semaines.flat().map((j, i) => {
          if (!j) return <div key={"vide" + i} />;

          const n = morceaux(j).j;
          const passe = j < jour;
          const pris = prisLe(j, periodes);
          const estDu = du && j === du;
          const estAu = au && j === au;
          const entre = du && au && j > du && j < au;
          const choisi = estDu || estAu || entre;

          /* Un jour inatteignable ne se dessine pas en bouton. L'ordre compte :
             une case prise ET passée est d'abord passée — inutile d'expliquer
             qu'un jour de l'an dernier était loué. */
          if (passe || arrete) {
            return (
              <div key={j} className="aspect-square flex items-center justify-center" style={{ opacity: 0.22 }}>
                <span style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux }}>{n}</span>
              </div>
            );
          }

          if (pris) {
            return (
              <div
                key={j}
                className="aspect-square flex items-center justify-center rounded-lg"
                style={{ backgroundImage: HACHURE, border: `1px solid ${bordure}` }}
                title={"Déjà loué " + periodeEnClair(pris.du, pris.au) + (pris.motif ? " — " + pris.motif : "")}
              >
                <span style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux, textDecoration: "line-through", textDecorationThickness: 2 }}>
                  {n}
                </span>
              </div>
            );
          }

          return (
            <button
              key={j}
              onClick={() => { vibrer("leger"); onJour(j); }}
              className="aspect-square flex items-center justify-center rounded-lg active:scale-90 transition-transform"
              style={{
                // Pas de raccourci « background » ici non plus : il effacerait
                // le dégradé du jour choisi.
                backgroundColor: entre ? rose + "33" : choisi ? "transparent" : VOILE(fondCarte, "D9"),
                backgroundImage: estDu || estAu ? DEGRADE : "none",
                border: `1px solid ${choisi ? "transparent" : bordure}`,
                boxShadow: estDu || estAu ? `0 0 12px ${rose}66` : "none",
              }}
              aria-label={enClair(j, true)}
            >
              <span
                style={{
                  fontFamily: CORPS, fontSize: 13,
                  fontWeight: choisi ? 800 : 500,
                  color: estDu || estAu ? "#fff" : texte,
                }}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* la légende. Sans elle, une case rose barrée peut se lire « promotion ». */}
      {/* 🚨 « inline-block », sans quoi la légende ment.
             Un « span » est en ligne, et la largeur comme la hauteur ne
             s'appliquent pas à un élément en ligne : les trois carrés se
             réduisaient à leur bordure, et n'annonçaient donc pas les
             couleurs qu'ils prétendaient montrer. Une légende fausse est
             pire que pas de légende. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${bordure}` }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}` }} />
          <span style={{ fontFamily: CORPS, fontSize: 10.5, color: texteDoux }}>libre</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded" style={{ backgroundImage: HACHURE, border: `1px solid ${bordure}` }} />
          <span style={{ fontFamily: CORPS, fontSize: 10.5, color: texteDoux }}>déjà loué</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded" style={{ backgroundImage: DEGRADE }} />
          <span style={{ fontFamily: CORPS, fontSize: 10.5, color: texteDoux }}>votre choix</span>
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════ CE QUI PART AU LOUEUR ═══════════════════
   Son propre message, et c'est volontaire : celui de la vente énumère des
   articles, des quantités, des frais d'envoi. Ici il y a un véhicule, deux
   dates, un nombre de jours et une caution. Les mêler aurait donné un
   message faux dans les deux cas. */
function texteDemande(v, du, au, jours, reference, extra) {
  /* 🚨 DÉFAUT N°1, SECONDE MOITIÉ : LA PREMIÈRE LIGNE DU MESSAGE.
     Elle reprenait l'accroche de vente — « Bonjour Easy lease, je souhaite
     commander : ». Le loueur recevait une demande de commande pour une
     voiture. On écrit la phrase de la location, et on garde son nom de
     boutique : c'est ce qui permet de reconnaître d'où vient le message
     quand on en reçoit de plusieurs boutiques.

     ⚠️ ELLE RESTE NEUTRE, ET C'EST VOULU : le reste de la boutique vouvoie le
     client (défaut n°11), mais ce message-ci est écrit PAR le client. */
  /* ═══ LE RÉCAPITULATIF COMPLET — consigne N°24, D.2 et D.3 ═══
     « Le même récapitulatif part dans le message au loueur, bien présenté. »
     Ce que le client a vu à l'écran et ce que le loueur reçoit doivent être
     la même chose, sinon la conversation commence sur un malentendu. */
  const e = extra && typeof extra === "object" ? extra : {};
  const compte = e.compte || null;
  const heures = [e.heureDepart, e.heureRetour].filter(Boolean);

  const lignes = [
    "Bonjour " + (BOUTIQUE.nom || "").trim() + ", je souhaite réserver :",
    "",
    "🔑 " + v.nom + (v.famille && v.famille.nom ? " (" + v.famille.nom + ")" : ""),
    "📅 " + periodeEnClair(du, au) + " — " + jours + " jour" + (jours > 1 ? "s" : ""),
  ];

  /* Les heures seulement si le client en a choisi : « ? → 18:00 » dans un
     message n'aide personne. */
  if (heures.length === 2) lignes.push("🕘 Retrait " + e.heureDepart + " · retour " + e.heureRetour);
  else if (e.heureDepart) lignes.push("🕘 Retrait vers " + e.heureDepart);
  else if (e.heureRetour) lignes.push("🕘 Retour vers " + e.heureRetour);

  /* Le forfait appliqué se nomme AVANT le total : le loueur doit reconnaître
     son propre tarif dans ce qu'il reçoit. */
  if (compte && compte.forfait) lignes.push("🏷️ " + compte.forfait);

  if (compte && compte.devis) {
    lignes.push("💰 " + eurosLocation(v.prix) + " " + compte.unite
      + " — " + jours + " jours : prix sur devis");
  } else if (compte && compte.calculable && compte.options && compte.options.lignes.length) {
    /* Avec des options, le détail doit tenir debout tout seul : la location,
       puis chaque supplément, puis le total. */
    lignes.push("💰 Location : " + eurosLocation(compte.location));
    for (const o of compte.options.lignes) lignes.push("➕ " + o.nom + " : " + o.valeur);
    lignes.push("💶 Total : " + eurosLocation(compte.total));
  } else if (compte && compte.calculable) {
    lignes.push("💰 Total : " + eurosLocation(compte.total));
  } else {
    lignes.push(ligneDeCompte(v.prix, v.unite, jours));
  }

  // La caution se dit, et se dit comme ce qu'elle est : une somme rendue.
  // La passer sous silence serait la mauvaise surprise du jour du départ.
  if (v.caution > 0) lignes.push("🔒 Caution : " + eurosLocation(v.caution) + " (restituée au retour)");

  if (v.ref) lignes.push("", "Véhicule réf. " + v.ref);
  if (reference) lignes.push("", "Référence de la demande : " + reference);

  if (PAIEMENTS.length) lignes.push("", "Paiement accepté : " + PAIEMENTS.map((p) => p.nom).join(", "));

  /* Ce que le loueur demande en retour — nom, téléphone, permis — part EN
     DERNIER, donc juste au-dessus du clavier quand la conversation s'ouvre.
     Plus haut, ça passerait au-dessus du pli et personne ne le lirait. */
  if (DEMANDE_DU_LOUEUR) lignes.push("", DEMANDE_DU_LOUEUR);

  return lignes.join("\n");
}

function lienDemande(v, du, au, jours, reference, extra) {
  return MESSAGERIE.lien(CONTACT, texteDemande(v, du, au, jours, reference, extra));
}

/* ═══════════ LE JOUR DE BATTEMENT ═══════════ — consigne N°24, C.4

   🚨 UN VÉHICULE RENDU LE SOIR N'EST PAS RELOUABLE LE LENDEMAIN MATIN.
   Le loueur peut réserver un ou plusieurs jours entre deux locations — le
   temps de nettoyer, de refaire les pleins, de constater un dégât. Ces
   jours-là sont bloqués au calendrier comme les jours loués, mais ils
   portent leur vraie raison : « Préparation du véhicule ». Les afficher
   comme « réservé » serait dire au client que quelqu'un d'autre l'a pris.

   ⚠️ ZÉRO = RIEN DU TOUT. Les périodes repartent telles quelles, et le
   calendrier est exactement celui d'avant. */
function periodesAvecBattement(v) {
  const jours = Math.max(0, Math.trunc(Number(v && v.battement) || 0));
  const periodes = (v && Array.isArray(v.periodes)) ? v.periodes : [];
  if (!jours || !periodes.length) return periodes;

  const decaler = (jour, pas) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(jour || ""))) return jour;
    const [a, m, j] = jour.split("-").map(Number);
    const d = new Date(Date.UTC(a, m - 1, j) + pas * 86400000);
    return d.toISOString().slice(0, 10);
  };

  const allongees = [];
  for (const periode of periodes) {
    allongees.push(periode);
    /* Le battement se pose APRÈS, pas avant : c'est au retour que le
       véhicule a besoin d'être préparé. Posé des deux côtés, il mangerait
       deux fois plus de jours dans le calendrier du loueur. */
    allongees.push({
      du: decaler(periode.au, 1),
      au: decaler(periode.au, jours),
      motif: "Préparation du véhicule",
    });
  }
  return allongees;
}

/* ═══════════ LES ÉQUIPEMENTS D'UN VÉHICULE ═══════════ — consigne N°24, C.1

   Des pastilles, à côté des places et des portes. Elles ne s'affichent que
   si le loueur en a coché : un véhicule sans équipement renseigné reste
   exactement comme avant. */
function Equipements({ v, petit = false }) {
  const liste = equipementsDe(v);
  if (!liste.length) return null;
  return (
    <div className={(petit ? "mt-1.5" : "mt-2") + " flex flex-wrap gap-1.5"}>
      {liste.map((e) => (
        <span
          key={e.id + e.nom}
          className="px-2 py-1 rounded-lg"
          style={{
            background: CARTE, border: `1px solid ${bordure}`,
            fontFamily: CORPS, fontSize: petit ? 10.5 : 11.5, color: texteDoux,
          }}
        >
          {e.emoji} {e.nom}
        </span>
      ))}
    </div>
  );
}

/* ═══════════ « À APPORTER LE JOUR J » ═══════════ — consigne N°24, B

   Juste au-dessus du bouton de demande, et pas ailleurs : c'est le moment où
   le client s'engage, et la dernière chose qu'il lit avant de partir sur
   WhatsApp. Un client qui se déplace sans son justificatif de domicile
   repart sans voiture — et c'est le loueur qui perd la location.

   ⚠️ RIEN SI LE LOUEUR N'A RIEN COCHÉ. Pas de cadre vide, pas de « aucun
   document demandé » : c'est la règle n°2 de sa consigne. */
function AApporter() {
  const papiers = documentsAApporter(BOUTIQUE.location);
  if (!papiers.length) return null;
  return (
    <div className="mb-3 rounded-2xl p-3" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
      <p className="mb-1.5" style={{ fontFamily: TITRE, fontSize: 13, color: jaune, letterSpacing: ".5px" }}>
        🪪 À APPORTER LE JOUR J
      </p>
      <div className="flex flex-col gap-1">
        {papiers.map((d) => (
          <span key={d.id} style={{ fontFamily: CORPS, fontSize: 12.5, color: texte }}>
            {d.emoji} {d.nom}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ LES CONDITIONS DE LOCATION ═══════════ — consigne N°25

   🚨 LE CLIENT DOIT POUVOIR LES LIRE AVANT DE RÉSERVER.
   C'est ce que demandent les conditions elles-mêmes (« par sa signature, le
   Locataire déclare avoir pris connaissance des CGL »), et l'arrêté du
   17 mars 2015 pour tout ce qui touche au prix et à la durée.

   Article par article, repliés : quinze pages d'un seul bloc sur un écran de
   375 px, personne ne les lit — et un texte que personne ne lit ne protège
   personne.

   ⚠️ RIEN SI LE LOUEUR N'EN A PAS MIS. Pas de bouton, pas de cadre vide. */
function ConditionsDeLocation() {
  const [ouvert, setOuvert] = useState(false);
  const [article, setArticle] = useState(-1);
  const sections = useMemo(() => sectionsDesConditions(REGLAGES.conditions), []);
  if (!sections.length) return null;

  return (
    <div className="px-3 mt-2">
      <button
        onClick={() => { vibrer("leger"); setOuvert((o) => !o); }}
        className="w-full py-3 px-3 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-transform"
        style={{ background: CARTE, border: `1px solid ${bordure}` }}
        aria-expanded={ouvert}
      >
        <span style={{ fontFamily: TITRE, fontSize: 14, color: texte, letterSpacing: ".5px" }}>
          📄 CONDITIONS DE LOCATION
        </span>
        <span style={{ fontFamily: CORPS, fontSize: 18, color: texteDoux, lineHeight: 1 }}>
          {ouvert ? "−" : "+"}
        </span>
      </button>

      {ouvert && (
        <div className="mt-2 flex flex-col gap-1.5">
          {sections.map((s, i) => (
            <div key={s.titre + i} className="rounded-xl overflow-hidden" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
              <button
                onClick={() => setArticle((n) => (n === i ? -1 : i))}
                className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left"
                aria-expanded={article === i}
              >
                <span style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, fontWeight: 600 }}>
                  {s.titre || "Préambule"}
                </span>
                <span style={{ fontFamily: CORPS, fontSize: 15, color: texteDoux, lineHeight: 1 }}>
                  {article === i ? "−" : "+"}
                </span>
              </button>
              {article === i && (
                <p
                  className="px-3 pb-3"
                  style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux, lineHeight: 1.6, whiteSpace: "pre-line" }}
                >
                  {s.texte}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ « CONDITIONS ET INFOS PRATIQUES » ═══════════ — consigne N°24, B

   🚨 UN CLIC DEPUIS CHAQUE VÉHICULE, ET C'EST LA LOI AUTANT QUE LE BON SENS.
   L'arrêté du 17 mars 2015 demande que le prix, la durée, le kilométrage, la
   caution et la franchise soient connus AVANT la réservation. Ce panneau les
   réunit là où le client décide : sur la fiche, pas dans un onglet qu'il
   faudrait penser à aller chercher.

   ⚠️ CE QUI N'EST PAS REMPLI N'EXISTE PAS. cartesPratiques() ne rend que les
   cartes qui ont au moins une ligne ; sans aucune, le bouton lui-même ne
   s'affiche pas. Une boutique de location d'avant cette version reste donc
   exactement comme elle était. */
function InfosPratiques() {
  const [ouvert, setOuvert] = useState(false);
  const cartes = useMemo(() => cartesPratiques(BOUTIQUE.location), []);
  if (!cartes.length) return null;

  return (
    <div className="px-3 mt-4">
      <button
        onClick={() => { vibrer("leger"); setOuvert((o) => !o); }}
        className="w-full py-3 px-3 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-transform"
        style={{ background: CARTE, border: `1px solid ${bordure}` }}
        aria-expanded={ouvert}
      >
        <span style={{ fontFamily: TITRE, fontSize: 14, color: texte, letterSpacing: ".5px" }}>
          ℹ️ CONDITIONS ET INFOS PRATIQUES
        </span>
        <span style={{ fontFamily: CORPS, fontSize: 18, color: texteDoux, lineHeight: 1 }}>
          {ouvert ? "−" : "+"}
        </span>
      </button>

      {ouvert && (
        <div className="mt-2 flex flex-col gap-2">
          {cartes.map((c) => <CartePratique key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

/* Une carte, et le même dessin partout : dans le panneau de la fiche comme
   en haut de l'onglet Infos. Deux dessins pour la même chose, c'est deux
   endroits où corriger — et un des deux qu'on oublie. */
function CartePratique({ c }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
      <p className="mb-2" style={{ fontFamily: TITRE, fontSize: 13.5, color: jaune, letterSpacing: ".5px" }}>
        {c.emoji} {c.titre.toUpperCase()}
      </p>
      <div className="flex flex-col gap-1.5">
        {c.lignes.map((ligne, i) => (
          <div key={c.id + i}>
            {/* Une ligne « nom / valeur » se lit en diagonale ; un paragraphe
                (horaires, exclusions) garde ses retours à la ligne, parce que
                le loueur les a mis exprès. */}
            {ligne.texte && !ligne.nom && (
              <p style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, whiteSpace: "pre-line" }}>
                {ligne.texte}
              </p>
            )}
            {ligne.nom && ligne.texte && (
              <>
                <p style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux, letterSpacing: ".3px" }}>
                  {ligne.nom}
                </p>
                <p style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, whiteSpace: "pre-line" }}>
                  {ligne.texte}
                </p>
              </>
            )}
            {ligne.nom && ligne.valeur && (
              <div className="flex items-baseline justify-between gap-3">
                <span style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}>{ligne.nom}</span>
                {ligne.lien ? (
                  <a
                    href={ligne.lien}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={clicLien(ligne.lien)}
                    className="text-right"
                    style={{ fontFamily: CORPS, fontSize: 12.5, color: cyan, overflowWrap: "anywhere", textDecoration: "underline" }}
                  >
                    {ligne.valeur}
                  </a>
                ) : (
                  <span className="text-right" style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, fontWeight: 600, overflowWrap: "anywhere" }}>
                    {ligne.valeur}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* L'ADRESSE ET LES HORAIRES, EN HAUT DE L'ONGLET INFOS — consigne N°24, B.
   C'est la question qu'on vient y poser : « où est-ce, et c'est ouvert
   quand ? ». Le reste des conditions vit sur la fiche du véhicule, là où on
   décide. Rien ne s'affiche si le loueur n'a rempli ni l'un ni l'autre. */
function OuEtQuand() {
  const c = useMemo(() => carteOuQuand(BOUTIQUE.location), []);
  if (!c) return null;
  return (
    <div className="px-3 mt-4">
      <CartePratique c={c} />
    </div>
  );
}

/* ═══════════ LES JOURS DÉJÀ PRIS, LUS EN DIRECT ═══════════ — N°25

   🚨 UNE SEULE LECTURE POUR TOUTE LA FLOTTE, ET ELLE NE RETARDE RIEN.
   La boutique s'affiche d'abord avec le calendrier que le loueur a rempli à
   la main ; les réservations arrivent une fraction de seconde après et
   s'ajoutent. Si la base ne répond pas, il ne se passe rien de visible — on
   ne montre pas une erreur de base de données à la cliente d'un loueur. */
function useLesJoursPris() {
  const [pris, setPris] = useState([]);

  const relire = () => {
    if (!RESERVATION_EN_LIGNE) return;
    lireLesJoursPris(ADRESSE_DE_LA_BOUTIQUE).then((liste) => setPris(liste)).catch(() => {});
  };

  useEffect(() => { relire(); }, []);
  return [pris, relire];
}

/* ═════════════════════════ LA FICHE D'UN VÉHICULE ═════════════════════════ */
function EcranVehicule({ v, onRetour, onOuvrir, referencePour, joursPris, relirePris }) {
  /* « photos » a disparu d'ici le 21 octobre 2026 : la galerie compte ses
     photos elle-même. Laisser la liste traîner aurait invité à redessiner un
     affichage à côté d'elle — c'est exactement ce qui avait produit le
     carrousel des avis sur une fiche de véhicule. */
  const visuel = visuelProduit(v, v.famille.couleurs, v.famille.glyphe);
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [refus, setRefus] = useState(null);
  /* Les options cochées par le client, par leur rang dans la liste du
     loueur — consigne N°24, C.5. Vide tant qu'il n'a rien coché, et un
     véhicule sans option n'affiche rien du tout. */
  const [options, setOptions] = useState([]);
  /* Les heures de retrait et de retour — consigne N°24, D.1. Elles ne sont
     proposées que si le loueur a écrit ses horaires : sans eux, on ne sait
     pas à quelle heure il ouvre, et une liste d'heures inventée enverrait
     des clients à 7 h du matin devant un rideau fermé. */
  const [heureDepart, setHeureDepart] = useState("");
  const [heureRetour, setHeureRetour] = useState("");
  /* Le parcours du contrat — consigne N°25, interrupteur 2. Fermé par
     défaut, et il n'existe que si le loueur a allumé les deux
     interrupteurs. */
  const [parcours, setParcours] = useState(false);

  const arrete = EN_RUPTURE(v);
  const jours = nbJours(du, au);
  const complet = jours > 0;
  /* Les jours pris : ceux que le loueur a écrits, le jour de préparation
     (N°24), et les réservations en ligne (N°25). Les trois se lisent de la
     même façon dans le calendrier — même forme { du, au, motif }. */
  const PERIODES = useMemo(
    () => periodesAvecBattement(v).concat(periodesDesReservations(joursPris, v.ref)),
    [v, joursPris],
  );
  /* Le compte selon l'unité du loueur — défaut n°2. « calculable » est faux
     pour un forfait (« / week-end », « / heure », un texte libre) : la
     boutique montre alors le tarif et la durée, sans inventer de total. */
  /* 🚨 ET LE MEILLEUR PRIX GAGNE — consigne N°24, C.2. Forfait week-end,
     forfait 7 jours, remise, forfait au mois : on calcule toutes les
     formules du loueur et on garde la MOINS CHÈRE pour le client. Sans
     forfait, c'est exactement le calcul d'avant. */
  const compte = meilleurPrix(v, du, au, jours, options, REGLAGES);
  /* Ce que CE véhicule propose : les options de la boutique, moins celles
     qu il a retirées, plus les siennes — consigne N°25. */
  const OPTIONS = useMemo(() => optionsDuVehicule(v, REGLAGES), [v]);
  /* La reference de CETTE demande : ce vehicule, ces dates. Voir
     « referencePour » dans Location(). */
  const reference = complet ? referencePour(v, du, au) : "";
  const total = compte.total;

  /* 🚨 L'ENCHAÎNEMENT DES DEUX APPUIS.
     ─────────────────────────────────
     Un seul geste — appuyer sur un jour — doit couvrir quatre situations.
     Écrites à la main, elles se contredisaient : on arrivait à choisir un
     retour avant le départ, ou à enjamber une période déjà prise.

       1. rien de choisi          → ce jour devient le départ
       2. un départ, pas de retour
          a. le jour est avant    → il remplace le départ (on s'est trompé)
          b. la période est libre → ce jour devient le retour
          c. elle enjambe du pris → REFUS, et on repart de ce jour
       3. les deux sont choisis   → on recommence à ce jour

     Le refus ne se contente pas de dire non : il dit quelle période gêne. Un
     « impossible » sans raison laisse le visiteur essayer au hasard. */
  const appuyer = (j) => {
    setRefus(null);

    if (!du || (du && au)) { setDu(j); setAu(""); return; }

    if (j < du) { setDu(j); return; }

    const gene = periodeQuiGene(du, j, PERIODES);
    if (gene) {
      setRefus(
        gene.motif === "Préparation du véhicule"
          ? "Le véhicule est en préparation " + periodeEnClair(gene.du, gene.au)
            + " après une location. Choisissez un départ après cette date."
          : "Le véhicule est déjà loué " + periodeEnClair(gene.du, gene.au)
            + ". Cette période ne peut pas être réservée d'un seul coup."
      );
      setDu(j);
      setAu("");
      return;
    }

    /* ═══ LA DURÉE MINIMUM ET MAXIMUM — consigne N°24, C.4 ═══
       🚨 ON REFUSE EN DISANT POURQUOI, ET ON GARDE LE DÉPART CHOISI.
       Un « impossible » muet fait essayer au hasard ; ici le client sait
       quoi corriger, et il n'a pas à re-choisir son jour de départ. */
    const combien = nbJours(du, j);
    const mini = Math.max(0, Math.trunc(Number(v.dureeMin) || 0));
    const maxi = Math.max(0, Math.trunc(Number(v.dureeMax) || 0));
    if (mini && combien < mini) {
      setRefus("Ce véhicule se loue à partir de " + mini + " jour" + (mini > 1 ? "s" : "")
        + ". Choisissez un retour plus tard.");
      return;
    }
    if (maxi && combien > maxi) {
      setRefus("Ce véhicule se loue au plus " + maxi + " jour" + (maxi > 1 ? "s" : "")
        + " d'affilée. Choisissez un retour plus tôt, ou écrivez-nous.");
      return;
    }

    setAu(j);
  };

  /* Ce qui part avec la demande, en un seul endroit : le compte tel qu'il
     est affiché, et les heures choisies. Deux endroits auraient fini par ne
     plus dire la même chose. */
  const avecLeCompte = { compte, heureDepart, heureRetour };

  /* ═══════════ RÉSERVER LES DATES — consigne N°25, interrupteur 1 ═══════════

     🚨 ON NE RETIENT JAMAIS LE CLIENT AU BORD DE SA DEMANDE.
     La réservation part en même temps que lui, sans l'attendre : le lien vers
     la messagerie s'ouvre comme avant, et c'est vital. Un window.open lancé
     APRÈS un aller-retour avec la base est bloqué par les navigateurs des
     téléphones — on aurait échangé un calendrier à jour contre des demandes
     qui ne partent plus. La demande WhatsApp est la vie de la boutique.

     Si la base répond « ces dates viennent d'être prises », le client le lit
     en revenant sur l'onglet, avec un calendrier à jour. Le loueur, lui, ne
     peut pas être doublement réservé : c'est la base qui tranche, et elle
     n'en garde qu'une. */
  const reserverSiAllumee = () => {
    if (!RESERVATION_EN_LIGNE || !complet) return;
    reserverDesDates({
      adresse: ADRESSE_DE_LA_BOUTIQUE,
      vehicule: v.ref || v.nom,
      du,
      au,
      heures: (heureDepart || heureRetour) ? (heureDepart || "?") + " → " + (heureRetour || "?") : "",
      reference,
    })
      .then((r) => {
        if (r.ok) { relirePris(); return; }
        const phrase = phraseDeRefus(r.pourquoi);
        if (phrase) { setRefus(phrase); relirePris(); }
      })
      .catch(() => {});
  };

  const envoyer = () => {
    if (!complet || !PEUT_COMMANDER || arrete) return;
    reserverSiAllumee();
    if (!MESSAGERIE.prerempli) copierAvantDePartir(texteDemande(v, du, au, jours, reference, avecLeCompte));
    ouvrirDehors(lienDemande(v, du, au, jours, reference, avecLeCompte));
  };

  /* ⚠️ UN SEUL GESTE DU CLIENT, DEUX CHEMINS POSSIBLES.
     Contrat en ligne allumé : le parcours s'ouvre, et c'est lui qui réserve
     en signant. Éteint : rien ne change, la demande part sur la messagerie
     exactement comme avant. */
  const demander = () => {
    if (!complet || !PEUT_COMMANDER || arrete) return;
    if (CONTRAT_EN_LIGNE) { vibrer("leger"); setParcours(true); return; }
    envoyer();
  };

  /* Le gros bouton de Telegram, quand on y est. Il ne s'allume que lorsque la
     demande est complète : un bouton toujours actif qui ne fait rien use la
     confiance plus vite qu'un bouton éteint. */
  useEffect(() => {
    if (!tgEssayer(() => telegram.MainButton)) return;
    const possible = complet && PEUT_COMMANDER && !arrete;
    tgEssayer((tg) => {
      tg.MainButton.setParams({
        text: possible
          ? (compte.calculable ? "DEMANDER — " + eurosLocation(total) : "DEMANDER CE VÉHICULE")
          : "CHOISISSEZ VOS DATES",
        is_active: possible,
        /* Pendant le parcours du contrat, le gros bouton de Telegram
           disparaît : il dirait « DEMANDER » par-dessus un formulaire qui a
           déjà son propre bouton, et deux boutons qui ne font pas la même
           chose au même endroit, c'est une demande perdue. */
        is_visible: !parcours,
      });
      tg.MainButton.onClick(demander);
    });
    return () => tgEssayer((tg) => tg.MainButton.offClick(demander));
  }, [du, au, complet, total, arrete, parcours]);

  /* ═══════════ LE PARCOURS DU CONTRAT PREND TOUT L'ÉCRAN ═══════════
     Après tous les crochets — un retour anticipé placé plus haut les
     décalerait d'un rendu à l'autre, et React s'en plaint à juste titre. */
  if (parcours) {
    return (
      <>
        <BarreSection titre="SIGNER LE CONTRAT" onRetour={() => setParcours(false)} />
        <ParcoursDuContrat
          v={v}
          du={du}
          au={au}
          jours={jours}
          compte={compte}
          heures={(heureDepart || heureRetour) ? (heureDepart || "?") + " → " + (heureRetour || "?") : ""}
          periode={periodeEnClair(du, au)}
          reglages={REGLAGES}
          onFermer={() => setParcours(false)}
          onSigne={relirePris}
        />
      </>
    );
  }

  return (
    <>
      <BarreSection titre={(v.nom || "").toUpperCase()} onRetour={onRetour} />

      {/* les photos */}
      {/* 🚨 UN VÉHICULE À PLUSIEURS PHOTOS N'EN MONTRAIT AUCUNE — 21 OCTOBRE 2026.

          Signalé sur une boutique en service : « on ne peut pas voir deux
          photos sur le même véhicule, l'Audi en a deux et quand on clique
          dessus rien n'apparaît ».

          Ce bloc avait DEUX branches. Une photo : un bouton et <Photo>, qui
          marchait. Plusieurs : « <Carrousel images={photos} /> » — et c'est le
          carrousel des AVIS. Il attend des objets { image, legende } ; on lui
          passait une liste de chemins. « courant.image » valait donc
          « undefined » à chaque vue, et rien ne s'affichait. Ses propres
          étiquettes le disaient : « Voir cet avis en grand », « Avis
          précédent ». Personne ne les lit dans une ligne d'import.

          ⚠️ ET LE DÉFAUT GRANDISSAIT AVEC LE SOIN DU VENDEUR : un véhicule
          avec UNE photo s'affichait, un véhicule bien documenté avec DEUX
          disparaissait. C'est l'inverse de ce qu'on veut encourager.

          « GaleriePhotos » est le seul composant qui sache montrer les photos
          d'un article — une ou dix, avec les vignettes, le glissement du doigt
          et le plein écran. Le moteur de vente ne se sert que de lui. Il gère
          aussi le repli quand il n'y a aucune photo : les deux branches n'ont
          donc plus de raison d'être. */}
      <div className="px-3 mt-3">
        <GalerieVehicule v={v} onPleinEcran={onOuvrir} />
      </div>

      {/* le prix, la caution, l'état */}
      <div className="px-3 mt-3">
        <div className="rounded-2xl p-4" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p style={{ fontFamily: CORPS, fontSize: 10.5, color: texteDoux, letterSpacing: ".6px", fontWeight: 700 }}>
                {(v.famille.nom || "").toUpperCase()}
              </p>
              <p className="mt-0.5" style={{ fontFamily: TITRE, fontSize: 21, color: texte, letterSpacing: ".4px", overflowWrap: "anywhere" }}>
                {v.nom}
              </p>
            </div>
            {(() => {
              const etat = etatDuJour(v, aujourdhui());
              return (
                <span
                  className="rounded-lg px-2 py-1 flex-shrink-0"
                  style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${etat.couleur}44` }}
                >
                  <span style={{ fontFamily: CORPS, fontSize: 10.5, fontWeight: 800, color: etat.couleur }}>
                    {etat.mot}
                  </span>
                </span>
              );
            })()}
          </div>

          {v.chef && <div className="mt-2"><CoupDeCoeur /></div>}

          <div className="mt-3 flex items-end justify-between gap-3 flex-wrap">
            <PrixAffiche v={v} taille={26} />
            {v.caution > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} color={cyan} />
                <span style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux }}>
                  caution <b style={{ color: texte }}>{eurosLocation(v.caution)}</b>
                </span>
              </span>
            )}
          </div>

          <Caracteristiques v={v} />
          <Equipements v={v} />

          {(v.description || "").trim() && (
            <p className="mt-3" style={{ fontFamily: CORPS, fontSize: 13.5, color: texteDoux, lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {v.description}
            </p>
          )}
        </div>
      </div>

      {/* la vidéo, s'il y en a une */}
      {(v.video || "").trim() && (
        <div className="px-3 mt-3">
          <CadreVideo produit={v} couleur={violet} onPleinEcran={null} />
        </div>
      )}

      {/* ══════ LE CALENDRIER ET LE CHOIX DES DATES ══════ */}
      <div className="px-3 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} color={rose} />
          <p style={{ fontFamily: TITRE, fontSize: 15, color: texte, letterSpacing: ".5px" }}>
            {arrete ? "CALENDRIER" : "CHOISISSEZ VOS DATES"}
          </p>
        </div>

        {arrete ? (
          <div className="rounded-2xl p-4 flex items-start gap-2.5" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
            <AlertTriangle size={17} color={jaune} className="flex-shrink-0 mt-0.5" />
            <p style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux, lineHeight: 1.6 }}>
              Ce véhicule est <b style={{ color: texte }}>momentanément indisponible</b> — il n'est pas
              proposé à la location pour l'instant. Contactez-nous pour savoir quand il revient.
            </p>
          </div>
        ) : (
          <>
            <Calendrier periodes={PERIODES} du={du} au={au} onJour={appuyer} arrete={arrete} />

            {/* ce qu'il faut faire, ou ce qui ne va pas */}
            <div className="mt-2">
              {refus ? (
                <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: rose + "1A", border: `1px solid ${rose}55` }}>
                  <AlertTriangle size={15} color={rose} className="flex-shrink-0 mt-0.5" />
                  <p style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, lineHeight: 1.55 }}>{refus}</p>
                </div>
              ) : !du ? (
                <p className="text-center" style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}>
                  Appuyez sur le jour du <b style={{ color: texte }}>départ</b>.
                </p>
              ) : !au ? (
                <p className="text-center" style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}>
                  Départ le <b style={{ color: texte }}>{enClair(du)}</b>. Appuyez maintenant sur le jour
                  du <b style={{ color: texte }}>retour</b>.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* ══════ LE RÉCAPITULATIF ══════
          Le compte est posé en entier avant la demande : nombre de jours,
          multiplication, caution à part. Un visiteur qui découvre le total
          dans la conversation se sent pris au piège, même quand le prix est
          juste. */}
      {!arrete && complet && (
        <div className="px-3 mt-3">
          <div className="rounded-2xl p-4" style={{ background: CARTE, border: `1px solid ${vert}44` }}>
            <div className="flex items-center gap-2">
              <Check size={16} color={vert} />
              <p style={{ fontFamily: TITRE, fontSize: 15, color: texte, letterSpacing: ".5px" }}>VOTRE DEMANDE</p>
            </div>

            {/* ═══ LES OPTIONS DU LOUEUR ═══ — consigne N°24, C.5
                Le client coche, ça s'ajoute au total. Rien ne s'affiche si le
                loueur n'en propose pas : pas de cadre « aucune option ». */}
            {OPTIONS.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${bordure}` }}>
                <p className="mb-2" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, letterSpacing: ".3px" }}>
                  OPTIONS
                </p>
                <div className="flex flex-col gap-1.5">
                  {OPTIONS.map((o, i) => {
                    const prise = options.includes(i);
                    return (
                      <button
                        key={o.nom + i}
                        onClick={() => {
                          vibrer("leger");
                          setOptions((liste) => (liste.includes(i) ? liste.filter((x) => x !== i) : liste.concat([i])));
                        }}
                        aria-pressed={prise}
                        className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
                        style={{
                          /* 🚨 « VOILE » NE POSE SA TRANSPARENCE QUE SUR UNE IMAGE DE FOND.
                             Sans image, elle rend la couleur PLEINE : l option cochée
                             s affichait en cyan vif, et son prix devenait illisible.
                             Vu à l écran le 22 octobre 2026. On écrit donc la
                             transparence à la main, comme ailleurs dans ce fichier. */
                          background: prise ? vert + "1F" : VOILE(fondCarte, "D9"),
                          border: `1px solid ${prise ? vert : bordure}`,
                        }}
                      >
                        <span className="flex items-center gap-2 text-left">
                          <span style={{ fontFamily: CORPS, fontSize: 13, color: prise ? vert : texteDoux }}>
                            {prise ? "☑" : "☐"}
                          </span>
                          <span style={{ fontFamily: CORPS, fontSize: 13, color: texte }}>{o.nom}</span>
                        </span>
                        <span style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux, whiteSpace: "nowrap" }}>
                          {eurosLocation(o.prix)}{o.parJour === false ? "" : " / jour"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ LES HEURES ═══ — consigne N°24, D.1
                🚨 ON NE LES PROPOSE QUE SI LE LOUEUR A ÉCRIT SES HORAIRES.
                Ses horaires sont un texte libre — « Lun-ven 8h-19h » — qu'on
                ne cherche pas à découper : une liste d'heures déduite à la
                louche enverrait un client à 7 h devant un rideau fermé. On
                propose donc des heures ET on rappelle les siennes, écrites
                telles qu'il les a tapées. */}
            {HORAIRES && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${bordure}` }}>
                <p className="mb-2" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, letterSpacing: ".3px" }}>
                  HEURES SOUHAITÉES
                </p>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <span style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux }}>Retrait</span>
                    <select
                      value={heureDepart}
                      onChange={(e) => setHeureDepart(e.target.value)}
                      className="w-full mt-1 px-2 py-2 rounded-xl"
                      style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}`, color: texte, fontFamily: CORPS, fontSize: 13 }}
                    >
                      <option value="">—</option>
                      {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                  <label className="flex-1">
                    <span style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux }}>Retour</span>
                    <select
                      value={heureRetour}
                      onChange={(e) => setHeureRetour(e.target.value)}
                      className="w-full mt-1 px-2 py-2 rounded-xl"
                      style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}`, color: texte, fontFamily: CORPS, fontSize: 13 }}
                    >
                      <option value="">—</option>
                      {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                </div>
                <p className="mt-1.5" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                  Nos horaires : {HORAIRES}
                </p>
              </div>
            )}

            {/* 🚨 LE COMPTE SE MONTRE, LIGNE À LIGNE — DÉFAUT N°2.
                ─────────────────────────────────────────────────
                Un total nu se croit ou ne se croit pas. Un total détaillé se
                refait de tête : « 10 jours = 1 semaine + 3 jours », puis la
                semaine, puis les trois jours au prorata. C'est ce qui rend un
                prix acceptable même quand il surprend.

                Et quand l'unité est un FORFAIT — « / week-end », « / heure »,
                un texte libre — on ne met pas de total. On dit le tarif, la
                durée, et que le prix se demande. Inventer un chiffre là
                serait une promesse que le loueur n'a pas faite. */}
            <Mesures
              lignes={[
                { nom: "Période", valeur: periodeEnClair(du, au) },
                ...(heureDepart || heureRetour
                  ? [{ nom: "Heures", valeur: (heureDepart || "?") + " → " + (heureRetour || "?") }]
                  : []),
                { nom: "Durée", valeur: jours + " jour" + (jours > 1 ? "s" : "") + " (bornes comprises)" },
                { nom: "Tarif", valeur: eurosLocation(v.prix) + " " + compte.unite },
                /* Le forfait appliqué se NOMME. Un total plus bas que le tarif
                   affiché, sans explication, fait douter du reste. */
                ...(compte.forfait ? [{ nom: "Appliqué", valeur: compte.forfait }] : []),
                ...compte.lignes,
                ...(compte.options && compte.options.lignes.length
                  ? compte.options.lignes.map((o) => ({ nom: o.nom, valeur: o.valeur }))
                  : []),
              ]}
            />

            <div className="mt-3 pt-3 flex items-baseline justify-between gap-3" style={{ borderTop: `1px solid ${bordure}` }}>
              <span style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux }}>
                {compte.calculable ? "Montant de la location" : "Montant"}
              </span>
              {compte.calculable ? (
                <span
                  style={{
                    fontFamily: TITRE, fontSize: 26, letterSpacing: ".5px", whiteSpace: "nowrap",
                    backgroundImage: `linear-gradient(90deg, ${jaune}, ${vert})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}
                >
                  {eurosLocation(total)}
                </span>
              ) : (
                <span className="text-right" style={{ fontFamily: CORPS, fontSize: 12.5, color: jaune, fontWeight: 700, maxWidth: 210 }}>
                  à confirmer avec nous
                </span>
              )}
            </div>

            {compte.devis && (
              <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux, lineHeight: 1.55 }}>
                Au-delà d'un mois, nous faisons un <b style={{ color: texte }}>prix sur devis</b> :
                envoyez votre demande, nous vous répondons avec le montant exact.
              </p>
            )}

            {!compte.calculable && !compte.devis && (
              <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux, lineHeight: 1.55 }}>
                Le tarif est affiché <b style={{ color: texte }}>{compte.unite}</b> : nous vous donnons
                le prix exact pour <b style={{ color: texte }}>{jours} jour{jours > 1 ? "s" : ""}</b> dès
                votre demande.
              </p>
            )}

            {v.caution > 0 && (
              <div className="mt-2 rounded-xl p-2.5 flex items-start gap-2" style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}` }}>
                <ShieldCheck size={15} color={cyan} className="flex-shrink-0 mt-0.5" />
                <p style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux, lineHeight: 1.55 }}>
                  Caution de <b style={{ color: texte }}>{eurosLocation(v.caution)}</b> à prévoir en plus,
                  <b style={{ color: texte }}> restituée au retour</b> du véhicule.
                </p>
              </div>
            )}

            {/* Changer d'avis doit rester facile : sans ce bouton, il faut
                deviner qu'un nouvel appui sur le calendrier recommence tout. */}
            <button
              onClick={() => { vibrer("leger"); setDu(""); setAu(""); setRefus(null); }}
              className="mt-3 w-full py-2.5 rounded-xl active:scale-[0.98] transition-transform"
              style={{ background: "transparent", border: `1px solid ${bordure}` }}
            >
              <span style={{ fontFamily: CORPS, fontSize: 12.5, fontWeight: 700, color: texteDoux }}>
                Changer les dates
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ══════ DEMANDER ══════ */}
      {!arrete && (
        <div className="px-3 mt-3">
          {!PEUT_COMMANDER ? (
            /* VITRINE. Aucune conversation, aucun paiement : il n'existe aucun
               moyen de louer. Promettre un bouton serait mentir. Le calendrier
               garde tout son sens — il montre les disponibilités. */
            <div className="rounded-2xl p-4 text-center" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
              <Info size={18} color={texteDoux} className="mx-auto" />
              <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux, lineHeight: 1.6 }}>
                Cette boutique est présentée à titre d'exemple : les demandes de location
                n'y sont pas activées.
              </p>
            </div>
          ) : (
            <>
              <AApporter />

              {/* ══ LE CONTRAT EN LIGNE — consigne N°25, interrupteur 2 ══
                  Allumé, le gros bouton n'ouvre plus la messagerie : il ouvre
                  le parcours, où le client remplit ses informations, lit les
                  conditions et signe. La messagerie reste juste en dessous,
                  et elle le reste exprès : un client qui préfère écrire ne
                  doit jamais se retrouver sans porte. */}
              {CONTRAT_EN_LIGNE ? (
                <>
                  <button
                    onClick={(e) => { if (!complet) { e.preventDefault(); vibrer("leger"); return; } demander(); }}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    style={{
                      backgroundImage: complet ? DEGRADE : "none",
                      backgroundColor: complet ? "transparent" : CARTE,
                      border: `1px solid ${complet ? "transparent" : bordure}`,
                      boxShadow: complet ? `0 8px 26px ${rose}55` : "none",
                      cursor: complet ? "pointer" : "default",
                    }}
                    aria-disabled={!complet}
                  >
                    <ShieldCheck size={18} color={complet ? "#fff" : texteDoux} />
                    <span style={{ fontFamily: TITRE, fontSize: 16, color: complet ? "#fff" : texteDoux, letterSpacing: ".5px" }}>
                      {complet ? "RÉSERVER ET SIGNER" : "CHOISISSEZ VOS DATES D'ABORD"}
                    </span>
                  </button>

                  <p className="mt-2 text-center" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.55 }}>
                    {complet
                      ? "Vos informations, les conditions, votre signature : trois écrans, et vos dates sont à vous."
                      : "Appuyez sur deux jours du calendrier pour voir le prix."}
                  </p>

                  {complet && (
                    <button
                      onClick={envoyer}
                      className="w-full mt-2 py-2.5 rounded-xl flex items-center justify-center gap-2"
                      style={{ background: "transparent", border: `1px solid ${bordure}` }}
                    >
                      <MessageCircle size={15} color={texteDoux} />
                      <span style={{ fontFamily: CORPS, fontSize: 12.5, fontWeight: 700, color: texteDoux }}>
                        Ou écrire sur {MESSAGERIE.nom}
                      </span>
                    </button>
                  )}
                </>
              ) : (
              <>
              <a
                href={complet ? lienDemande(v, du, au, jours, reference, avecLeCompte) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!complet) { e.preventDefault(); vibrer("leger"); return; }
                  reserverSiAllumee();
                  if (!MESSAGERIE.prerempli) copierAvantDePartir(texteDemande(v, du, au, jours, reference, avecLeCompte));
                  clicLien(lienDemande(v, du, au, jours, reference, avecLeCompte))(e);
                }}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{
                  /* 🚨 « backgroundColor », jamais « background », à côté d'un
                     « backgroundImage ». Le raccourci efface l'image — et
                     React écrit la chaîne vide quand la valeur est
                     « undefined ». Ce bouton est resté noir pour ça. */
                  backgroundImage: complet ? DEGRADE : "none",
                  backgroundColor: complet ? "transparent" : CARTE,
                  border: `1px solid ${complet ? "transparent" : bordure}`,
                  boxShadow: complet ? `0 8px 26px ${rose}55` : "none",
                  // Un lien sans adresse reste focalisable au clavier mais ne
                  // mène nulle part : on le dit aussi aux lecteurs d'écran.
                  cursor: complet ? "pointer" : "default",
                }}
                aria-disabled={!complet}
              >
                <MessageCircle size={18} color={complet ? "#fff" : texteDoux} />
                <span style={{ fontFamily: TITRE, fontSize: 16, color: complet ? "#fff" : texteDoux, letterSpacing: ".5px" }}>
                  {complet ? "DEMANDER CE VÉHICULE" : "CHOISISSEZ VOS DATES D'ABORD"}
                </span>
              </a>

              <p className="mt-2 text-center" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.55 }}>
                {complet
                  ? (RESERVATION_EN_LIGNE
                    ? "Vos dates sont retenues dès l'envoi, et la demande part sur " + MESSAGERIE.nom + ". Nous vous confirmons ensuite."
                    : "La demande part sur " + MESSAGERIE.nom + " avec le véhicule et vos dates. Rien n'est réservé avant notre réponse.")
                  : "Appuyez sur deux jours du calendrier pour voir le prix."}
              </p>
              </>
              )}

              {complet && PAIEMENTS.length > 0 && (
                <div className="mt-3">
                  <MoyensDePaiement total={total} reference={reference} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════ LES PÉRIODES DÉJÀ PRISES, ÉCRITES ══════
          Le calendrier les montre mois par mois. Écrites à la suite, elles
          répondent d'un coup d'œil à « c'est pris quand ? » — sans avoir à
          feuilleter douze mois. */}
      {!arrete && v.periodes && v.periodes.length > 0 && (
        <div className="px-3 mt-4">
          <p className="mb-2" style={{ fontFamily: TITRE, fontSize: 14, color: texteDoux, letterSpacing: ".5px" }}>
            DÉJÀ LOUÉ
          </p>
          <div className="rounded-2xl p-3 flex flex-col gap-1.5" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
            {v.periodes
              .slice()
              .sort((a, b) => (a.du < b.du ? -1 : 1))
              .filter((p) => p.au >= aujourdhui())
              .map((p, i) => (
                <div key={p.du + p.au + i} className="flex items-baseline justify-between gap-3">
                  <span style={{ fontFamily: CORPS, fontSize: 12.5, color: texte }}>
                    {periodeEnClair(p.du, p.au)}
                  </span>
                  {p.motif && (
                    <span className="text-right" style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux, overflowWrap: "anywhere" }}>
                      {p.motif}
                    </span>
                  )}
                </div>
              ))}
            {v.periodes.filter((p) => p.au >= aujourdhui()).length === 0 && (
              <p style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}>
                Rien de prévu : le véhicule est libre sur tous les mois à venir.
              </p>
            )}
          </div>
        </div>
      )}

      <InfosPratiques />
      <ConditionsDeLocation />
    </>
  );
}

/* ═════════════════════════════ L'APPLICATION ═════════════════════════════ */
export default function Location() {
  const [onglet, setOnglet] = useState("accueil");
  /* Les jours déjà réservés, lus une fois pour toute la flotte — N°25. */
  const [joursPris, relirePris] = useLesJoursPris();
  const [vehicule, setVehicule] = useState(null);
  const [vue, setVue] = useState(null); // la visionneuse : { produit, depart }
  /* 🚨 LES NOMS DOIVENT ETRE CEUX DU MOTEUR.
     Il y avait ici « INTRO.actif » et « INTRO.titre ». Ces deux noms n ont
     jamais existe : le moteur dit « active » et « texte ». Resultat, la
     condition valait toujours faux et l ouverture d une boutique de location
     ne s est JAMAIS jouee. Aucune erreur, aucun message : juste un reglage
     qu on pouvait changer sans que rien ne bouge.

     C est la rançon d un moteur ecrit a part : rien ne verifiait que les
     deux cotes parlaient de la meme chose. Depuis, on fait comme la vente —
     une fois par visite, et toujours en apercu pour pouvoir la regler. */
  const [intro, setIntro] = useState(() => {
    if (!INTRO.active) return false;
    /* Comme la vente : en aperçu, l'ouverture suit ce qu'on venait voir. */
    if (APERCU) return VERS !== "boutique";
    try {
      return !sessionStorage.getItem("intro-vue");
    } catch (e) {
      return true;
    }
  });

  /* ═══════ UNE RÉFÉRENCE PAR VÉHICULE ET PAR DEMANDE — DÉFAUT N°8 ═══════

     Elle relie un virement à une demande : sans elle, « X vous a envoyé
     135 € » n'indique pas de quelle location il s'agit.

     🚨 IL N'Y EN AVAIT QU'UNE PAR VISITE. Un visiteur qui demande le Trafic
     puis la Classe A envoyait DEUX demandes portant la MÊME référence — et le
     loueur recevait deux virements impossibles à départager. C'est exactement
     ce que la référence existe pour empêcher.

     On en garde donc une par véhicule, et on en refait une quand les dates
     changent : deux demandes successives sur le même véhicule à des dates
     différentes sont deux demandes, pas une correction.

     ⚠️ ET ON LES GARDE EN MÉMOIRE, dans un « ref » : revenir sur un véhicule
     déjà regardé ne doit pas lui donner une nouvelle référence, sinon celle
     que le client vient d'envoyer au loueur ne correspond plus à rien. */
  const references = useRef({});
  const referencePour = (v, du, au) => {
    if (!v) return "";
    const cle = [v.cle, du, au].join("|");
    if (!references.current[cle]) references.current[cle] = referenceCommande();
    return references.current[cle];
  };

  const accueil = () => { setVehicule(null); setOnglet("accueil"); };
  const ouvrirVehicule = (v) => { setVehicule(v); window.scrollTo({ top: 0 }); };
  const retour = () => { setVehicule(null); window.scrollTo({ top: 0 }); };

  // Changer d'écran remonte en haut : sinon on arrive au milieu d'une fiche.
  useEffect(() => { window.scrollTo({ top: 0 }); }, [onglet]);

  const cleEcran = [onglet, vehicule && vehicule.cle].filter(Boolean).join("/");

  /* Le bouton « retour » de Telegram, qui n'existe que dans Telegram. On le
     montre dès qu'il y a quelque chose à quitter, et on le cache à l'accueil —
     un bouton retour sur l'écran d'accueil ferme l'application, ce que
     personne n'attend. */
  const profond = !!vehicule || onglet !== "accueil";
  useEffect(() => {
    if (!tgEssayer(() => telegram.BackButton)) return;
    const revenir = () => {
      if (vue) { setVue(null); return; }
      if (vehicule) { retour(); return; }
      if (onglet !== "accueil") { setOnglet("accueil"); return; }
    };
    tgEssayer((tg) => tg.BackButton.onClick(revenir));
    tgEssayer(() => (profond || vue ? telegram.BackButton.show() : telegram.BackButton.hide()));
    return () => tgEssayer((tg) => tg.BackButton.offClick(revenir));
  }, [profond, vue, onglet, vehicule]);

  /* Le gros bouton de Telegram n'appartient qu'à la fiche d'un véhicule : elle
     le règle elle-même. Partout ailleurs il doit disparaître, sinon il garde
     le libellé de la fiche quittée et promet une demande qui n'existe plus. */
  useEffect(() => {
    if (vehicule) return;
    if (!tgEssayer(() => telegram.MainButton)) return;
    tgEssayer((tg) => tg.MainButton.hide());
  }, [vehicule]);

  // Chaque onglet peut être masqué depuis config.js. Accueil reste toujours là.
  const onglets = [
    { id: "accueil", nom: "FLOTTE", Icone: Home, visible: true },
    { id: "info", nom: "INFOS", Icone: Info, visible: BOUTIQUE.afficherInfos !== false },
    { id: "liens", nom: "LIENS", Icone: Link2, visible: BOUTIQUE.afficherLiens !== false },
    { id: "avis", nom: "AVIS", Icone: Star, visible: BOUTIQUE.afficherAvis !== false },
  ].filter((o) => o.visible);

  return (
    <div className="min-h-screen w-full" style={FOND_PAGE}>
      <style>{FONTS}</style>
      <style>{ANIMATIONS}</style>
      {intro && <Intro onFini={() => {
        setIntro(false);
        try { sessionStorage.setItem("intro-vue", "1"); } catch (e) {}
      }} />}

      <div className="relative w-full max-w-[560px] mx-auto min-h-screen" style={{ background: COLONNE }}>

        {/* bandeau et entête */}
        <div className="sticky top-0 z-20">
          {/* ═══ LA BOUTIQUE D'ESSAI LE DIT, PARTOUT ═══ — consigne N°27
              🚨 IL DOIT ÊTRE IMPOSSIBLE DE S'Y TROMPER.
              Un loueur essaie les nouveautés sur une COPIE de sa boutique :
              rien n'y est réel, aucune réservation n'engage personne. Le
              bandeau est dans l'entête collante, donc il reste à l'écran sur
              chaque page et à chaque étape — y compris pendant la signature
              du contrat, qui est le moment où la confusion coûterait le plus
              cher. */}
          {ESSAI && (
            <div className="text-center py-1.5 px-3" style={{ background: "#7C3AED" }}>
              <p style={{ fontFamily: CORPS, fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: ".3px" }}>
                🧪 BOUTIQUE DE TEST — AUCUNE RÉSERVATION N'EST RÉELLE
              </p>
            </div>
          )}
          {APERCU && (
            <div className="text-center py-1.5 px-3" style={{ background: "#FFC93C" }}>
              <p style={{ fontFamily: CORPS, fontSize: 11, fontWeight: 800, color: "#1A1200", letterSpacing: ".3px" }}>
                {BOUTIQUE.vitrine
                  ? "EXEMPLE — une boutique de démonstration, aucun véhicule n'est à louer ici"
                  : VERS === "ouverture"
                    ? "APERÇU DE L'OUVERTURE — ce que voit un visiteur en arrivant"
                    : "APERÇU — brouillon non publié, tes clients ne voient pas ceci"}
              </p>
              {/* L'appareil refuse les animations : le dire, sinon on
                  croit l'ouverture cassée. Mesuré sur son PC. */}
              {VERS === "ouverture" && MOUVEMENT_REDUIT && (
                <p style={{ fontFamily: CORPS, fontSize: 10, fontWeight: 700, color: "#4A3800", marginTop: 3 }}>
                  CET APPAREIL EST RÉGLÉ SUR « ANIMATIONS RÉDUITES » — RIEN NE BOUGERA ICI
                </p>
              )}
              {VERS === "ouverture" && !intro && INTRO.active && (
                <button
                  onClick={() => setIntro(true)}
                  style={{
                    marginTop: 4, padding: "5px 13px", borderRadius: 999,
                    background: "#1A1200", color: "#FFC93C", border: "none",
                    fontFamily: CORPS, fontSize: 11, fontWeight: 800, letterSpacing: ".5px",
                  }}
                >
                  ↻ REVOIR L'OUVERTURE
                </button>
              )}
            </div>
          )}
          <div className="text-center py-1.5" style={{ backgroundImage: DEGRADE }}>
            <p style={{ fontFamily: CORPS, fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: ".5px" }}>
              {BOUTIQUE.bandeau}
            </p>
          </div>
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ background: FOND_IMAGE ? "#0B0B0BB3" : "#0B0B0BEE", backdropFilter: "blur(8px)", borderBottom: `1px solid ${bordure}` }}
          >
            <span className="w-11" />
            <button onClick={accueil} className="flex flex-col items-center active:scale-95 transition-transform">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundImage: DEGRADE, boxShadow: `0 0 18px ${rose}66` }}
              >
                {BOUTIQUE.logo ? (
                  <img
                    src={BOUTIQUE.logo}
                    alt={BOUTIQUE.nom}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span style={{ fontSize: 22 }}>{BOUTIQUE.emoji}</span>
                )}
              </div>
              <p style={{ fontFamily: TITRE, fontSize: 11, color: texteDoux, letterSpacing: ".5px", marginTop: 2 }}>
                {BOUTIQUE.nom}
              </p>
            </button>
            {/* Là où la vente met son panier, la location met le nombre de
                véhicules libres : c'est la question qu'on se pose en arrivant.

                🚨 « LIBRES » NE DISAIT PAS DE QUAND — DÉFAUT N°7. Le chiffre
                ne vaut que pour AUJOURD'HUI, et le mot ne le disait pas : un
                visiteur qui cherche des dates dans trois semaines lisait une
                promesse qui ne le concernait pas. « AUJOURD'HUI » tient dans
                le carré, et c'est le mot qui manquait.

                Le compte, lui, vient de « DISPONIBLES » : une seule fois par
                visite, au lieu d'une boucle sur toute la flotte à chaque
                dessin de l'entête. */}
            <div
              className="w-11 h-11 rounded-xl flex flex-col items-center justify-center"
              style={{ background: CARTE, border: `1px solid ${bordure}` }}
              title={DISPONIBLES + " véhicule" + (DISPONIBLES > 1 ? "s" : "") + " disponible"
                + (DISPONIBLES > 1 ? "s" : "") + " aujourd'hui"}
            >
              <span style={{ fontFamily: TITRE, fontSize: 15, color: vert, lineHeight: 1 }}>
                {DISPONIBLES}
              </span>
              <span style={{ fontFamily: CORPS, fontSize: 6.5, color: texteDoux, fontWeight: 700, letterSpacing: ".2px" }}>
                AUJOURD'HUI
              </span>
            </div>
          </div>
        </div>

        <div className={`pb-28 atelier-ecran`} key={cleEcran}>
          {onglet === "info" && <><OuEtQuand /><EcranInfo /></>}
          {onglet === "liens" && <EcranLiens />}
          {onglet === "avis" && <EcranAvis />}
          {onglet === "accueil" && (
            vehicule ? (
              <EcranVehicule
                v={vehicule}
                onRetour={retour}
                onOuvrir={(p, n) => setVue({ produit: p, depart: n || 0 })}
                referencePour={referencePour}
                joursPris={joursPris}
                relirePris={relirePris}
              />
            ) : (
              <EcranFlotte onVehicule={ouvrirVehicule} />
            )
          )}
        </div>

        {/* 🚨 LE PIED LÉGAL — IL N'A PAS D'INTERRUPTEUR, ET C'EST VOULU.
            Qui vend, particulier ou professionnel, que le contrat n'est pas
            avec la plateforme, et comment signaler. L'onglet INFOS pouvait
            être éteint par le vendeur : une obligation qu'on peut décocher
            n'est pas une obligation. Voir PiedLegal dans commun.jsx. */}
        <PiedLegal />
        {/* barre de navigation du bas */}
        <div
          className="fixed bottom-0 left-0 right-0 z-30 flex justify-center gap-2 px-3 py-2.5"
          style={{ background: FOND_IMAGE ? "#0B0B0BB3" : "#0B0B0BF2", backdropFilter: "blur(10px)", borderTop: `1px solid ${bordure}` }}
        >
          <div className="w-full max-w-[560px] flex justify-around gap-2">
            {onglets.map(({ id, nom, Icone }) => {
              const actif = onglet === id;
              return (
                <button
                  key={id}
                  onClick={() => (id === "accueil" ? accueil() : setOnglet(id))}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl active:scale-95 transition-transform"
                  style={{
                    background: actif ? VOILE("#1A0A14", "D9") : "transparent",
                    border: `2px solid ${actif ? rose : "#3A2130"}`,
                    boxShadow: actif ? `0 0 16px ${rose}55` : "none",
                  }}
                >
                  <Icone size={17} color={actif ? rose : texteDoux} />
                  <span style={{ fontFamily: CORPS, fontSize: 9.5, fontWeight: 700, color: actif ? rose : texteDoux, letterSpacing: ".5px" }}>
                    {nom}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {vue && (
          <Visionneuse
            produit={vue.produit}
            famille={vue.produit.famille}
            depart={vue.depart}
            onFermer={() => setVue(null)}
          />
        )}
      </div>
    </div>
  );
}
