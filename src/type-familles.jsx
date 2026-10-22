// TYPE DE BOUTIQUE N° 1 — LA VITRINE PAR FAMILLES
// -----------------------------------------------
// On entre par une grande image de famille, puis on descend :
//   famille → gamme → produit.
// Chaque famille a sa couleur et son affiche ; le catalogue se decouvre par
// etapes, comme les rayons d'une boutique.
//
// ★ CE FICHIER N'APPARTIENT QU'A CE TYPE.
// Le modifier ne touche AUCUNE boutique de type 2. A l'inverse, tout ce qui
// doit valoir pour les deux types se corrige dans commun.jsx.

import React from "react";
import { Star, PlayCircle } from "lucide-react";
import { visuelFamille } from "./visuels.js";
import {
  BOUTIQUE, FAMILLES_AFFICHEES, SELECTION_CHEF, CASCADE, EST_VIDEOS, EN_RUPTURE, Vedettes, Prix,
  VOILE, CARTE, TITRE, CORPS, bordure, texte, texteDoux, jaune, cyan, CLAIR, fondCarte,
  OR, ETIQUETTE, TRAIT_ACCENT, ENCRE, REMISE_MAXIMALE, PRODUITS_EN_PROMOTION, rose, violet,
  // Les deux raccourcis et le badge dore : ecrits une fois, pour les quatre
  // accueils. Voir « RaccourcisDEtat » dans commun.jsx.
  RaccourcisDEtat, BadgeNouveautes, FAMILLE_PROMOTIONS,
} from "./commun.jsx";

/* Combien d'articles dans un rayon. En allure « or », il est annoncé
   au-dessus du nom : « 83 PIÈCES » dit tout de suite si le rayon vaut le
   détour, là où une tuile muette oblige à entrer pour le découvrir. */
const COMBIEN = (f) =>
  (f.gammes || []).reduce((n, g) => n + (g.produits || []).length, 0);

/* L'encre posée sur l'aplat d'or : mesurée, jamais devinée. Une boutique
   argentée ou cuivrée obtient du noir ou du blanc selon ce qui se lit. */
const ENCRE_PROMO = ENCRE(rose);

/* Ce que dit la petite ligne sous le nom du rayon, accordée pour de bon.
   « 1 ARTICLE QUI REVIENT » · « 3 ARTICLES QUI REVIENNENT »
   « 1 ARTICLE ANNONCÉ »     · « 3 ARTICLES ANNONCÉS » */
const PHRASE_DU_RAYON = (quoi, n) => (quoi === "retour"
  ? n > 1 ? n + " ARTICLES QUI REVIENNENT" : "1 ARTICLE QUI REVIENT"
  : n > 1 ? n + " ARTICLES ANNONCÉS" : "1 ARTICLE ANNONCÉ");

export function EcranFamilles({ onFamille, onProduit }) {
  // Le bloc « mis en avant » disparait completement si son titre est vide dans
  // config.js, ou si aucun produit n'est marque en avant.
  const montrerEnAvant = !!(BOUTIQUE.enAvant || "").trim() && SELECTION_CHEF.length > 0;

  return (
    <>
      <Vedettes onProduit={onProduit} />
            {montrerEnAvant && (
              <div className="mx-3 mt-3">
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  /* 🚨 UN PANNEAU NE PEUT PAS ÊTRE NOIR EN DUR.
                     Mesuré le 16 octobre 2026 sur la première boutique CLAIRE :
                     fond du bandeau rgb(14,14,14), texte rgb(38,48,42) posé
                     dessus — lisibilité 1,4 là où il en faut 4,5. Le bandeau
                     d'annonce, celui qu'on met EN HAUT de l'accueil, était
                     illisible. Le motif juste existait déjà vingt lignes plus
                     loin dans App.jsx ; celui-ci avait été oublié. */
                  style={{ background: VOILE(CLAIR ? fondCarte : "#0E0E0E", "D9"), border: `1px solid ${bordure}` }}
                >
                  <Star size={18} color={jaune} />
                  <p className="flex-1 text-center" style={{ fontFamily: TITRE, fontSize: 15, color: texte, letterSpacing: "1px" }}>
                    {BOUTIQUE.enAvant}
                  </p>
                  <span style={{ color: texteDoux, fontSize: 12 }}>▾</span>
                </div>

                <div className="flex gap-2 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {SELECTION_CHEF.map((p) => (
                    <button
                      key={p.cle || p.ref}
                      onClick={() => onProduit(p.famille, p.gamme, p)}
                      className="flex-shrink-0 rounded-xl px-3 py-2 text-left active:scale-95 transition-transform"
                      style={{ background: CARTE, border: `1px solid ${bordure}`, minWidth: 148 }}
                    >
                      <p className="text-[12px] font-bold truncate" style={{ color: texte, fontFamily: CORPS }}>{p.nom}</p>
                      <Prix valeur={p.prix} avant={p.prixInitial} remise={p.remise} taille={15} />
                    </button>
                  ))}
                </div>
              </div>
            )}

      {/* 🚨 LES DEUX RACCOURCIS — N°21.

          Ils étaient deux GRANDES cartes dans la liste des familles, comme
          celle des promotions. Sa demande du 22 octobre 2026, après avoir
          revu le dessin : « je n'en veux plus ». Elles poussaient les vrais
          rayons du vendeur sous le pli, et une nouveauté se découvre en
          parcourant les produits, pas dans une carte à part.

          🚨 ICI, C'EST LE CAS « PAS DE PROMOTION AUJOURD'HUI ». Sa consigne
          dit « JUSTE EN DESSOUS de la carte des promotions » : quand elle
          existe, les raccourcis se posent DANS la colonne, juste après elle
          (voir le « map » ci-dessous). Quand elle n'existe pas, ils viennent
          ici, en tête.

          ⚠️ J'avais tout mis au-dessus, en écrivant que « l'ordre est le même
          à l'œil ». C'était faux, et ça s'est vu sur sa boutique EN LIGNE :
          la boutique d'essai n'a aucune promotion en cours, donc il n'y avait
          rien au-dessus de quoi se tromper. */}
      {!FAMILLE_PROMOTIONS && <RaccourcisDEtat onFamille={onFamille} />}

      <div className="flex flex-col gap-4 px-3 mt-4">
        {FAMILLES_AFFICHEES.map((f, rang) => (
          /* 🚨 LE FRAGMENT S'OUVRE APRÈS CE COMMENTAIRE, ET C'EST OBLIGATOIRE.
             Ouvert avant, le commentaire ci-dessous devient un ENFANT JSX :
             il s'affiche en toutes lettres sur l'accueil, et le ternaire qui
             suit n'est plus évalué. Vu à l'écran, dans la seconde. */
          <React.Fragment key={f.id}>
            {/* ═══ LE RAYON DES PROMOTIONS, EN ALLURE « OR » ═══
                Un aplat d'or sur un écran noir : l'inverse de tout le reste
                de la page, donc l'objet qu'on voit en premier. Les chiffres
                sont recalculés à chaque chargement. */}
            {f.promotions && OR ? (
              <button
                key={f.id}
                onClick={() => onFamille(f)}
                className="text-left active:scale-[0.98] transition-transform"
                style={{
                  backgroundImage: `linear-gradient(168deg, ${jaune} 0%, ${rose} 46%, ${violet} 100%)`,
                  padding: 3, ...CASCADE(rang),
                }}
              >
                <span className="flex items-center gap-4 px-4 py-3" style={{ border: `1px solid ${ENCRE_PROMO}44` }}>
                  <span className="flex flex-col items-center" style={{ lineHeight: .85 }}>
                    <span style={{ ...ETIQUETTE, fontSize: 8.5, color: ENCRE_PROMO, opacity: .72 }}>JUSQU'À</span>
                    <span style={{ fontFamily: TITRE, fontSize: 44, fontWeight: 700, color: ENCRE_PROMO, letterSpacing: "-.02em" }}>
                      −{REMISE_MAXIMALE}<span style={{ fontSize: 23 }}>%</span>
                    </span>
                  </span>
                  <span style={{ width: 1, alignSelf: "stretch", background: ENCRE_PROMO, opacity: .32 }} />
                  <span className="flex-1 flex flex-col gap-1.5">
                    <span style={{ fontFamily: TITRE, fontSize: 17, fontWeight: 600, color: ENCRE_PROMO, letterSpacing: ".06em", lineHeight: 1.05 }}>
                      TOUTES LES PROMOTIONS
                    </span>
                    <span style={{ ...ETIQUETTE, fontSize: 8.5, color: ENCRE_PROMO, opacity: .8 }}>
                      {PRODUITS_EN_PROMOTION.length} articles en baisse
                    </span>
                    <span style={{
                      fontFamily: TITRE, fontSize: 9.5, fontWeight: 500, letterSpacing: ".2em",
                      color: ENCRE_PROMO, borderTop: `1px solid ${ENCRE_PROMO}55`, paddingTop: 6, marginTop: 2,
                    }}>
                      VOIR LE RAYON ›
                    </span>
                  </span>
                </span>
              </button>
          ) : (
              <button
                key={f.id}
                onClick={() => onFamille(f)}
                className={`relative overflow-hidden active:scale-[0.98] transition-transform atelier-carte${OR ? "" : " rounded-2xl"}`}
                style={OR
                  /* Plus de cadre de couleur ni de halo : un liseré d'or
                     translucide, et c'est la photo qui parle. */
                  ? { border: `1px solid ${rose}61`, ...CASCADE(rang) }
                  : { border: `2px solid ${f.couleurs[0]}`, boxShadow: `0 0 24px ${f.couleurs[0]}33`, ...CASCADE(rang) }}
              >
                <img src={visuelFamille(f)} alt={f.nom} className="w-full aspect-[760/340] object-cover block" />
                <span className="absolute top-2 right-2 text-[22px]">{f.emoji}</span>
                {/* ⚠️ LE BADGE COMPTE DANS LA FAMILLE, pas dans le rayon des
                    nouveautés : c'est la tuile « DRAPEAUX » qui doit dire
                    qu'il y a du neuf dedans. Voir « BadgeNouveautes ». */}
                <BadgeNouveautes famille={f} />
                {EST_VIDEOS(f) && (
                  <span
                    className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: "#000000A8", border: `1px solid ${OR ? rose : cyan}` }}
                  >
                    <PlayCircle size={13} color={OR ? jaune : cyan} />
                    <span style={{ fontFamily: CORPS, fontSize: 9.5, fontWeight: 800, color: OR ? jaune : cyan, letterSpacing: ".1em" }}>
                      VIDÉOS
                    </span>
                  </span>
                )}
                {/* Rayon fermé : on le dit sur la porte, pas seulement une fois
                    entré. Le rayon s'ouvre quand même — on vient souvent voir
                    ce qui reviendra. */}
                {EN_RUPTURE(f) && (
                  <span
                    className="absolute top-2 left-2 px-2 py-1 rounded-lg"
                    style={{ background: "#000000C8", border: `1px solid #8A8A8A` }}
                  >
                    <span style={{ fontFamily: CORPS, fontSize: 9.5, fontWeight: 800, color: "#D8D8D8", letterSpacing: ".1em" }}>
                      ÉPUISÉ
                    </span>
                  </span>
                )}
                {/* Le titre est écrit ici, pas dans l'image : il reste lisible même
                    si la photo change. */}
                {/* 🚨 LE CONTOUR ÉPAIS EST CE QUI FAIT LE PLUS « AUTOCOLLANT ».
                    Un nom cerné de 3 px se lit, oui — comme un prix sur une
                    vitre de supermarché. En allure « or », le voile fait le
                    travail à sa place : plus sombre, plus haut, et le nom
                    reste net sans être cerné. */}
                <span
                  className={`absolute inset-x-0 bottom-0 flex ${OR
                    ? "pb-3.5 pt-12 px-4 items-end justify-start"
                    : "pb-4 pt-10 px-3 items-end justify-center"}`}
                  style={{ backgroundImage: OR
                    ? "linear-gradient(0deg, #030303F7 2%, #03030394 44%, transparent 100%)"
                    : "linear-gradient(0deg, #000000B0 15%, transparent 100%)" }}
                >
                  {OR ? (
                    <span className="flex flex-col gap-1.5 min-w-0">
                      <span style={{ ...ETIQUETTE, fontSize: 8, color: rose }}>
                        {COMBIEN(f)} {EST_VIDEOS(f) ? "vidéos" : "pièces"}
                      </span>
                      <span style={{
                        fontFamily: TITRE, fontWeight: 600, color: texte, letterSpacing: ".1em", lineHeight: .95,
                        fontSize: f.nom.length > 15 ? 21 : f.nom.length > 10 ? 25 : 29,
                      }}>
                        {f.nom}
                      </span>
                      {/* Le trait. Trois pixels, court, dégradé : c'est lui
                          qui donne la prestance, pas la taille du nom. */}
                      <span style={{ width: 46, height: 3, backgroundImage: TRAIT_ACCENT, marginTop: 1 }} />
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: TITRE, color: jaune, letterSpacing: "1px", lineHeight: 1,
                        fontSize: f.nom.length > 13 ? 26 : f.nom.length > 9 ? 32 : 38,
                        WebkitTextStroke: "3px #160B22", paintOrder: "stroke",
                      }}
                    >
                      {f.nom}
                    </span>
                  )}
                </span>
              </button>
            )}
            {/* ⚠️ « JUSTE EN DESSOUS », au sens propre : dans la colonne,
                collé sous la carte dorée. Le « mx-3 » n'a plus lieu d'être —
                la colonne porte déjà son « px-3 ». */}
            {f.promotions && <RaccourcisDEtat onFamille={onFamille} className="flex gap-2" />}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
