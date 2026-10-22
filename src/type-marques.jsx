// TYPE DE BOUTIQUE N° 4 — PAR MARQUES
// ----------------------------------
// Pour ce qui se choisit à l'œil : des chaussures, du prêt-à-porter, des
// lunettes. Le client ne cherche pas dans un catalogue, il regarde.
//
// Trois écrans, et rien de plus :
//
//   1. L'ACCUEIL — une grande photo par marque, empilées, pleine largeur. Le
//      nom de la marque posé dessus. Rien d'autre : ni prix, ni compteur, ni
//      pastille. On choisit une marque comme on entre dans un rayon.
//
//   2. LE CARROUSEL — une photo par page, en grand. On tourne la page pour
//      voir le modèle suivant. C'est le geste d'un catalogue papier, et c'est
//      le seul geste à connaître.
//
//   3. LA FICHE — au doigt sur la photo : la taille, la couleur, le prix.
//      Elle est commune à toutes les boutiques et ne vit pas ici.
//
// POURQUOI SI PEU. Une paire de baskets ne se vend pas sur sa description : on
// l'aime ou non en la voyant. Tout ce qu'on ajoute autour de la photo la
// rétrécit, et rétrécir la photo est la seule erreur qu'on ne rattrape pas
// dans ce type de boutique.
//
// ★ CE FICHIER N'APPARTIENT QU'A CE TYPE.
// Le modifier ne touche ni le type 1, ni le type 2, ni le type 3.

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { visuelFamille, visuelProduit } from "./visuels.js";
import {
  FAMILLES_AFFICHEES, EST_VIDEOS, EN_RUPTURE, GALERIE, CLE, euros, PROPORTION_PHOTO, ChoixEtCommande,
  CadreVideo,
  // La galerie d'un produit : une seule pour toute la boutique.
  GaleriePhotos,
  ACCROCHE,
  // L habit de la boutique : voir « L ALLURE » dans commun.jsx.
  MAISON, ETIQUETTE, TRAIT_OR,
  TITRE, CORPS, CARTE, bordure, texte, texteDoux, jaune, fond, fondCarte, CLAIR,
  // Les deux raccourcis d etat : ecrits une fois dans le tronc commun, pour
  // que les quatre accueils disent exactement la meme chose (N°21).
  RaccourcisDEtat,
} from "./commun.jsx";

/* LA FORME DES TUILES DE MARQUE suit le réglage « forme des photos » de la
   boutique : carré, portrait, paysage. Sans cela le vendeur choisirait le
   portrait pour ses produits et retrouverait quand même un bandeau large à
   l'accueil — deux formes pour la même photo, dans la même boutique.

   « Forme d'origine » ne veut rien dire pour une tuile qui doit s'aligner avec
   ses voisines : dans ce cas seulement, on retombe sur le portrait. */
const PROPORTION_MARQUE = PROPORTION_PHOTO || "3 / 4";

// Les marques : les familles de produits, les galeries de vidéos mises à part.
export const MARQUES = FAMILLES_AFFICHEES.filter((f) => !EST_VIDEOS(f));

// Tous les modèles d'une marque, dans l'ordre du catalogue. Les gammes ne sont
// pas montrées au client — ici, elles ne servent qu'à ranger côté atelier.
/* Combien d'articles en tout — pour le bouton « tous les articles ». */
const TOTAL_ARTICLES = MARQUES.reduce((n, f) =>
  n + (f.gammes || []).reduce((s, g) => s + (g.produits || []).length, 0), 0);

export const MODELES = (famille) =>
  (famille.gammes || []).flatMap((g) =>
    (g.produits || []).map((p, i) => ({ produit: p, gamme: g, cle: CLE(famille, g, i, p) })));

/* ═════════ 1. L'ACCUEIL : UNE GRANDE PHOTO PAR MARQUE ═════════ */

function Marque({ famille, onFamille, premiere = false }) {
  const modeles = MODELES(famille);
  const [videoRatee, setVideoRatee] = useState(false);

  /* La photo de la marque si elle en a une, sinon celle de son premier modèle,
     sinon le dessin de secours. Une case vide serait la seule chose à ne pas
     montrer sur un écran qui n'est fait que d'images. */
  const affiche =
    (famille.image || "").trim() ||
    (modeles.length ? (GALERIE(modeles[0].produit)[0] || "") : "") ||
    visuelFamille(famille);

  return (
    <button
      onClick={() => onFamille(famille)}
      className="relative block w-full overflow-hidden active:scale-[.99] transition-transform"
      /* UNE MARQUE = UN ÉCRAN ENTIER.

         La tuile ne se contente plus d'une proportion : elle prend TOUTE la
         hauteur du téléphone. On ne voit donc qu'une marque à la fois, en
         grand, et on fait défiler pour passer à la suivante.

         « dvh » et non « vh » : sur un téléphone, la barre d'adresse du
         navigateur apparaît et disparaît au défilement. « vh » se fige sur la
         plus grande hauteur et laisse un bout de l'image coupé sous la barre ;
         « dvh » suit la hauteur réellement visible. Le « vh » reste écrit
         juste avant, pour les navigateurs qui ignorent encore « dvh ».

         On retranche la barre du bas — accueil, infos, liens, avis — pour que
         le nom de la marque ne se retrouve pas caché dessous. */
      /* « 100dvh MOINS l'entête » : la tuile commence sous lui, donc sans
         cette soustraction elle dépasse l'écran d'exactement sa hauteur, et
         le nom de la maison finit derrière la barre du bas. La variable est
         mesurée par App.jsx ; le repli à 0 px ne fait que retrouver l'ancien
         comportement si elle manquait. */
      style={{
        /* La première retranche AUSSI le chapeau — la bande d'accroche qui
           la précède et qui, elle, défile. */
        height: premiere ? "calc(100vh - var(--entete, 0px) - var(--chapeau, 0px))" : "calc(100vh - var(--entete, 0px))",
        minHeight: premiere ? "calc(100dvh - var(--entete, 0px) - var(--chapeau, 0px))" : "calc(100dvh - var(--entete, 0px))",
        maxHeight: premiere ? "calc(100dvh - var(--entete, 0px) - var(--chapeau, 0px))" : "calc(100dvh - var(--entete, 0px))",
        background: CLAIR ? fond : "#0A0A0C",
      }}
    >
      {/* UNE VIDÉO QUI TOURNE, SI LA MARQUE EN A UNE.

          Quatre attributs, et chacun est indispensable :
            muted     — sans le silence, AUCUN téléphone ne démarre une vidéo
                        tout seul. C'est la règle de tous les navigateurs, et
                        c'est elle qu'on oublie en premier.
            playsInline — sans lui, l'iPhone passe en plein écran dès la
                        lecture : la boutique disparaît derrière un lecteur.
            loop      — une tuile qui s'arrête au bout de six secondes et reste
                        figée est pire qu'une photo.
            preload="metadata" — on ne télécharge pas les trois vidéos en
                        entier avant d'avoir montré la page.

          Et si la vidéo manque ou refuse de se lire, on retombe sur l'image :
          une tuile noire ne dit rien à personne. */}
      {(famille.video || "").trim() && !videoRatee ? (
        <video
          src={famille.video}
          poster={affiche}
          autoPlay muted loop playsInline
          preload="metadata"
          /* La vidéo REMPLIT l'écran, la photo non — et ce n'est pas une
             inconséquence. Une vidéo de marque est un décor : on la filme pour
             qu'elle occupe le cadre, et des bandes noires autour la ruineraient.
             Une photo de produit, elle, montre une paire de chaussures : la
             remplir couperait la semelle ou le talon. */
          className="w-full h-full object-cover"
          onError={() => setVideoRatee(true)}
        />
      ) : (
        /* L'IMAGE ENTIÈRE, JAMAIS ROGNÉE.
           Ces tuiles montrent des photos de PRODUIT — une paire de chaussures,
           pas un décor. « object-cover » remplirait mieux le cadre, mais en
           coupant les bords : la semelle ou le talon disparaîtraient. Une
           chaussure amputée ne donne envie d'entrer dans aucun rayon. */
        <img
          src={affiche}
          alt={famille.nom}
          className="w-full h-full object-contain"
          onError={(e) => { e.currentTarget.src = visuelFamille(famille); }}
        />
      )}
      {/* Le voile : sans lui, le nom de la marque devient illisible dès que la
          photo part dans la même teinte que les lettres — et une photo de
          produit est claire plus souvent qu'autre chose.

          Il prend le sens de la boutique. Sur fond noir, il fonce vers le bas
          et le nom s'écrit en blanc ; sur une boutique claire, il éclaircit et
          le nom s'écrit en noir. Posé toujours sombre, il étalait un gris sale
          sur une vitrine blanche, et le nom de la maison y disparaissait. */}
      <div
        className="absolute inset-0 flex flex-col items-start justify-end px-5 pb-28"
        style={{
          background: CLAIR
            ? "linear-gradient(to top, rgba(255,255,255,.92) 0%, rgba(255,255,255,.35) 45%, rgba(255,255,255,0) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.25) 45%, rgba(0,0,0,0) 100%)",
        }}
      >
        <p style={MAISON
          ? { fontFamily: TITRE, fontWeight: 400, fontSize: "clamp(30px, 9vw, 46px)", color: CLAIR ? texte : "#fff", lineHeight: 1, letterSpacing: ".04em" }
          : { fontFamily: TITRE, fontSize: "clamp(26px, 8vw, 40px)", color: CLAIR ? texte : "#fff", lineHeight: 1, letterSpacing: ".5px" }}>
          {MAISON ? (famille.nom || "") : (famille.nom || "").toUpperCase()}
        </p>
        <p className="mt-1.5" style={MAISON
          ? { ...ETIQUETTE, fontSize: 9, color: CLAIR ? texteDoux : "#D8D8D8" }
          : { fontSize: 12, color: CLAIR ? texteDoux : "#D8D8D8", fontFamily: CORPS, letterSpacing: ".08em" }}>
          {EN_RUPTURE(famille)
            ? "Rayon épuisé — à revoir bientôt"
            : `${modeles.length} modèle${modeles.length > 1 ? "s" : ""} — voir la collection`}
        </p>
      </div>
    </button>
  );
}

export function EcranMarques({ onFamille, onTout }) {
  /* On mesure la bande plutôt que de deviner sa hauteur : elle fait une ou
     deux lignes selon la phrase et selon la largeur du téléphone. */
  const aChapeau = !!(ACCROCHE || MARQUES.length > 1 || TOTAL_ARTICLES > 1);
  const chapeau = useRef(null);
  useEffect(() => {
    const el = chapeau.current;
    const poser = () => {
      document.documentElement.style.setProperty(
        "--chapeau", (el ? el.offsetHeight : 0) + "px");
    };
    poser();
    if (!el || typeof ResizeObserver === "undefined") return;
    const oeil = new ResizeObserver(poser);
    oeil.observe(el);
    return () => oeil.disconnect();
  });
  if (!MARQUES.length) {
    return (
      <div className="mx-3 mt-6 rounded-2xl px-4 py-8 text-center"
        style={{ background: CARTE, border: `1px solid ${bordure}` }}>
        <p style={{ fontFamily: TITRE, fontSize: 19, color: texte }}>AUCUNE MARQUE</p>
        <p className="text-[13px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
          Ajoute une famille par marque dans l'atelier, avec sa photo.
        </p>
      </div>
    );
  }

  /* Aucun espace entre les marques : chacune occupe son écran, et le passage
     de l'une à l'autre doit être franc, sans liseré de fond au milieu. */
  return (
    <div className="flex flex-col">
      {/* Les mêmes raccourcis que les trois autres accueils — N°21. Ici ils
          sont AVANT la première maison : chaque marque prend tout l'écran,
          et posés plus bas personne ne les verrait jamais. */}
      <RaccourcisDEtat onFamille={onFamille} className="flex gap-2 mx-3 mt-3 mb-1" />
      {/* LA PHRASE DE LA BOUTIQUE, ET LE COMPTE DE CE QU'ELLE A.

          Elle était écrite dans les réglages et ne s'affichait nulle part dans
          cette présentation : une phrase qu'on a prise la peine d'écrire et que
          personne ne lit. Elle tient ici en une ligne fine, au-dessus de la
          première maison — assez pour dire ce qu'est la boutique, trop peu pour
          retarder la photo, qui est ce qu'on vient voir.

          Le compte à côté répond à la question qu'on se pose devant une
          devanture : est-ce qu'il y a de quoi regarder ? */}
      {/* 🚨 EMPILÉS, ET NON CÔTE À CÔTE. Mis sur la même ligne, le compte
          serrait la phrase contre lui : « Chaque pièce photographiée telle
          qu'elle / est. » À 375 px, deux textes de longueurs inconnues ne
          partagent pas une ligne. */}
      {(ACCROCHE || MARQUES.length > 1) && (
        <div ref={chapeau} className="px-4 pt-3 pb-3" style={{ borderBottom: `1px solid ${bordure}` }}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] uppercase"
              style={{ fontFamily: CORPS, color: texteDoux, letterSpacing: ".14em" }}>
              {MARQUES.length} {MARQUES.length > 1 ? "maisons" : "maison"}
            </p>
            {/* 🚨 LA DEUXIÈME PORTE. Les tuiles sont la porte principale — une
                maison par écran, c'est ce qui fait l'effet. Mais un visiteur
                qui ne cherche rien de précis doit pouvoir tout voir d'un coup,
                sinon il repart à la première tuile. */}
            {onTout && TOTAL_ARTICLES > 1 && (
              <button onClick={onTout}
                className="flex-shrink-0 active:scale-95 transition-transform"
                style={MAISON
                  ? { ...ETIQUETTE, fontSize: 9, color: texte, borderBottom: TRAIT_OR, paddingBottom: 3 }
                  : { fontFamily: CORPS, fontSize: 11, fontWeight: 700, color: jaune, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Tous les articles ({TOTAL_ARTICLES})
              </button>
            )}
          </div>
          {ACCROCHE && (
            <p className="mt-1.5" style={{ fontFamily: CORPS, fontSize: 13, color: texte, letterSpacing: ".01em", lineHeight: 1.45 }}>
              {ACCROCHE}
            </p>
          )}
        </div>
      )}
      {MARQUES.map((f, k) => <Marque key={f.id} famille={f} onFamille={onFamille} premiere={k === 0 && aChapeau} />)}
    </div>
  );
}

/* ═════════ 2. LE CARROUSEL : UNE PHOTO PAR PAGE ═════════ */

/* ═════════ TOUS LES ARTICLES, TOUTES MAISONS CONFONDUES ═════════

   La même carte que la vitrine d'une maison — même photo, même nom, même prix
   — avec le nom de la maison ajouté au-dessus. C'est ce nom qui manque quand on
   mélange : sans lui, on ne sait plus de qui est la pièce qu'on regarde. */
export function EcranTousLesProduits({ onProduit, onRetour }) {
  const tout = MARQUES.flatMap((f) =>
    (f.gammes || []).flatMap((g) =>
      (g.produits || []).map((p) => ({ famille: f, gamme: g, produit: p }))));

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={onRetour} aria-label="Revenir aux maisons"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
          style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <ChevronLeft size={18} color={texte} />
        </button>
        <p className="flex-1 truncate" style={MAISON
          ? { fontFamily: TITRE, fontWeight: 400, fontSize: 22, color: texte, letterSpacing: ".05em" }
          : { fontFamily: TITRE, fontSize: 17, color: texte, letterSpacing: ".5px" }}>
          {MAISON ? "Tous les articles" : "TOUS LES ARTICLES"}
        </p>
        <span className={MAISON ? "flex-shrink-0" : "px-2.5 py-1 rounded-lg text-[11px] font-bold flex-shrink-0"}
          style={MAISON
            ? { ...ETIQUETTE, fontSize: 9, color: texteDoux }
            : { background: CARTE, border: `1px solid ${bordure}`, color: texteDoux, fontFamily: CORPS }}>
          {tout.length}
        </span>
      </div>

      {!tout.length ? (
        <div className="mx-3 mt-6 rounded-2xl px-4 py-8 text-center"
          style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <p style={{ fontFamily: TITRE, fontSize: 19, color: texte }}>AUCUN ARTICLE</p>
        </div>
      ) : (
        <div className="px-3 mt-1 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {tout.map(({ famille, gamme, produit }, k) => {
              const vue = GALERIE(produit)[0] || visuelProduit(produit, famille.couleurs, famille.glyphe);
              return (
                <button
                  key={CLE(famille, gamme, k, produit)}
                  onClick={() => onProduit(famille, gamme, produit)}
                  className={"text-left overflow-hidden active:scale-[.98] transition-transform"
                    + (MAISON ? "" : " rounded-2xl")}
                  style={MAISON
                    ? { background: "transparent" }
                    : { background: CARTE, border: `1px solid ${bordure}` }}
                >
                  <div className="relative w-full"
                    style={{ aspectRatio: PROPORTION_MARQUE, background: CLAIR ? fondCarte : "#08080A" }}>
                    <img src={vue} alt={produit.nom} className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = visuelProduit(produit, famille.couleurs, famille.glyphe); }} />
                    {!produit.dispo && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                        style={{ background: "#0C0C10E6", border: `1px solid ${bordure}`, color: "#D8D8D8", fontFamily: CORPS }}>
                        ÉPUISÉ
                      </span>
                    )}
                  </div>
                  <div className={MAISON ? "py-2" : "px-2.5 py-2"}>
                    <p style={MAISON
                      ? { ...ETIQUETTE, fontSize: 8, color: texteDoux }
                      : { fontSize: 10, color: texteDoux, fontFamily: CORPS, letterSpacing: ".08em", textTransform: "uppercase" }}>
                      {famille.nom}
                    </p>
                    <p className="leading-snug mt-1" style={MAISON
                      ? { fontFamily: CORPS, fontWeight: 300, fontSize: 12, color: texte }
                      : { fontSize: 12.5, color: texte, fontFamily: CORPS }}>
                      {produit.nom}
                    </p>
                    <p className="mt-1" style={MAISON
                      ? { fontFamily: TITRE, fontWeight: 400, fontSize: 16, color: texte }
                      : { fontSize: 13, color: jaune, fontFamily: CORPS, fontWeight: 700 }}>
                      {euros(produit.prix)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/* ═════════ 2. LA PAGE D'UNE MARQUE : TOUT CE QU'ELLE VEND ═════════


       « quand on clique sur la famille Louis Vuitton par exemple, on doit
         avoir accès aux autres produits aussi, et pas juste simplement à ce
         pull. »

   🚨 IL MANQUAIT UN NIVEAU, ET C'ÉTAIT UNE FAUTE DE CONSTRUCTION.

   Toucher une marque ouvrait DIRECTEMENT un produit — le premier — avec les
   autres réduits à des vignettes de 64 px sous la photo. Pour une boutique de
   baskets, où une marque vend trois fois le même modèle en trois couleurs,
   ça se tenait : les vignettes SONT le choix. Pour une maison qui vend un
   pull, un pantalon et une veste, c'est une devanture qui ne montre qu'un
   article et cache le reste dans un tiroir.

   Cette page est donc la vitrine de la maison : tout ce qu'elle vend, rangé
   PAR GAMME, en grand assez pour se décider. On touche un article, et on
   arrive sur sa page — ses photos, ses tailles, son prix.

   Deux colonnes, et pas trois : sur un téléphone de 375 px, trois colonnes
   donnent des photos de 110 px, où un vêtement n'est plus qu'une tache. */
export function EcranCatalogueMarque({ famille, onProduit, onRetour }) {
  const gammes = (famille.gammes || []).filter((g) => (g.produits || []).length);
  const total = gammes.reduce((n, g) => n + g.produits.length, 0);

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={onRetour} aria-label="Revenir aux marques"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
          style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <ChevronLeft size={18} color={texte} />
        </button>
        <p className="flex-1 truncate" style={MAISON
          ? { fontFamily: TITRE, fontWeight: 400, fontSize: 22, color: texte, letterSpacing: ".05em" }
          : { fontFamily: TITRE, fontSize: 17, color: texte, letterSpacing: ".5px" }}>
          {MAISON ? (famille.nom || "") : (famille.nom || "").toUpperCase()}
        </p>
        {/* Une pastille cerclée est un élément d'interface ; une étiquette
            espacée est une mention. Sur une maison, la seconde. */}
        <span className={MAISON ? "flex-shrink-0" : "px-2.5 py-1 rounded-lg text-[11px] font-bold flex-shrink-0"}
          style={MAISON
            ? { ...ETIQUETTE, fontSize: 9, color: texteDoux }
            : { background: CARTE, border: `1px solid ${bordure}`, color: texteDoux, fontFamily: CORPS }}>
          {total} {total > 1 ? "pièces" : "pièce"}
        </span>
      </div>

      {EN_RUPTURE(famille) && (
        <p className="mx-3 mb-2 text-[12px] rounded-xl px-3 py-2"
          style={{ background: CARTE, border: `1px solid ${bordure}`, color: texteDoux, fontFamily: CORPS }}>
          Rayon épuisé — à revoir bientôt.
        </p>
      )}

      {gammes.map((g, ig) => (
        <div key={(g.nom || "") + ig} className="px-3 mt-1 mb-4">
          {/* Le nom de la gamme ne s'affiche que s'il y en a plusieurs : une
              maison qui ne vend qu'une sorte de pièce n'a pas à l'annoncer. */}
          {gammes.length > 1 && (
            <p className="mb-2 mt-2" style={MAISON
              ? { ...ETIQUETTE, fontSize: 9, color: texteDoux, paddingBottom: 7, borderBottom: TRAIT_OR }
              : { fontSize: 11, color: texteDoux, fontFamily: CORPS, letterSpacing: ".12em", textTransform: "uppercase" }}>
              {(g.nom || "").toUpperCase()}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {g.produits.map((p, ip) => {
              const vue = GALERIE(p)[0] || visuelProduit(p, famille.couleurs, famille.glyphe);
              return (
                <button
                  key={CLE(famille, g, ip, p)}
                  onClick={() => onProduit(famille, g, p)}
                  className={"text-left overflow-hidden active:scale-[.98] transition-transform"
                    + (MAISON ? "" : " rounded-2xl")}
                  style={MAISON
                    ? { background: "transparent" }
                    : { background: CARTE, border: `1px solid ${bordure}` }}
                >
                  <div className="relative w-full"
                    style={{ aspectRatio: PROPORTION_MARQUE, background: CLAIR ? fondCarte : "#08080A" }}>
                    <img src={vue} alt={p.nom} className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = visuelProduit(p, famille.couleurs, famille.glyphe); }} />
                    {!p.dispo && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                        style={{ background: "#0C0C10E6", border: `1px solid ${bordure}`, color: "#D8D8D8", fontFamily: CORPS }}>
                        ÉPUISÉ
                      </span>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="leading-snug" style={MAISON
                      ? { fontFamily: CORPS, fontWeight: 300, fontSize: 12, color: texte, letterSpacing: ".01em" }
                      : { fontSize: 12.5, color: texte, fontFamily: CORPS }}>
                      {p.nom}
                    </p>
                    {/* Un prix en gras est un argument ; un prix en serif léger
                        est un fait. Sur du luxe, le second se tient mieux. */}
                    <p className="mt-1" style={MAISON
                      ? { fontFamily: TITRE, fontWeight: 400, fontSize: 16, color: texte }
                      : { fontSize: 13, color: jaune, fontFamily: CORPS, fontWeight: 700 }}>
                      {euros(p.prix)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

/* ═════════ 3. LA PAGE D'UN ARTICLE ═════════ */
export function EcranCarrousel({ famille, gamme: gammeChoisie, produit: produitChoisi, onAjouter, onRetour }) {
  /* ═══ UNE RANGÉE PAR GAMME, ET NON UNE RANGÉE POUR TOUT ═══

         « tu as mis des produits similaires côte à côte et je trouve ça très
           bien. Mais si on rajoute un pantalon ou un autre produit tout à fait
           différent, il ne pourrait pas se trouver juste à côté — ça ne serait
           pas une bonne manière. »

     Et c'est juste. La rangée « touche pour changer » dit au client : voici le
     MÊME vêtement, autrement. Deux hauts en maille côte à côte, ça se compare.
     Un pull et un pantalon côte à côte, c'est un rayon mal rangé, et le client
     en conclut qu'on ne s'est pas relu.

     Le niveau existait déjà — les GAMMES, que l'atelier sait créer depuis
     toujours avec « + Ajouter une gamme ». Mais cet écran les APLATISSAIT :
     « MODELES(famille) » recollait toutes les gammes en une seule liste, et le
     pantalon serait venu se ranger contre le pull.

     Désormais : une gamme à la fois. Les gammes deviennent des onglets — LES
     HAUTS · LES PANTALONS — et la rangée de vignettes ne montre que ce qui se
     compare. Avec une seule gamme, rien ne change et aucun onglet n'apparaît. */
  const gammes = (famille.gammes || []).filter((g) => (g.produits || []).length);

  /* On ouvre SUR L'ARTICLE TOUCHÉ, et non sur le premier de la maison. Sans
     ça, choisir le pantalon dans la vitrine ramènerait au pull. */
  const depart = Math.max(0, gammes.indexOf(gammeChoisie));
  const [ig, setIg] = useState(depart);
  const gamme = gammes[Math.min(ig, Math.max(0, gammes.length - 1))] || null;

  const modeles = gamme
    ? (gamme.produits || []).map((p, k) => ({ produit: p, gamme, cle: CLE(famille, gamme, k, p) }))
    : [];

  /* DEUX REPÈRES, ET NON UN SEUL.

     « i » est le MODÈLE — c'est-à-dire la COULEUR. On en change en touchant
     une vignette, sous la grande photo.

     « j » est la PHOTO du modèle choisi. On en change avec les flèches posées
     sur l'image, ou en la faisant glisser du doigt.

     Les deux étaient confondus, et c'était une faute : les flèches sautaient
     d'une couleur à l'autre, si bien que la deuxième vue d'une paire — celle
     qui la montre sur sa boîte, de trois quarts — n'apparaissait nulle part.
     Un client qui voulait voir l'autre photo de la TN noire tombait sur la
     blanche.

     Un geste, une seule chose : les vignettes changent la couleur, les flèches
     tournent les photos de cette couleur. */
  const [i, setI] = useState(() => {
    if (!produitChoisi || !gammes[depart]) return 0;
    const k = (gammes[depart].produits || []).indexOf(produitChoisi);
    return k > 0 ? k : 0;
  });
  const n = modeles.length;
  const courant = n ? modeles[Math.min(i, n - 1)] : null;

  /* 🚨 CES REMISES À ZÉRO ÉCRASAIENT LE CHOIX DU VISITEUR.

     Changer de gamme doit ramener au premier modèle de cette gamme : on passe
     des hauts aux pantalons, on ne tombe pas sur le troisième pantalon. Écrit
     sans précaution, l'effet s'exécute AUSSI au premier affichage — et il
     effaçait aussitôt le modèle qu'on venait de toucher dans la vitrine.

     Résultat : on touchait le pull rose, et la page du haut écru s'ouvrait.
     Rien dans la console, aucune erreur : juste le mauvais vêtement.

     L'effet ne travaille donc qu'aux changements SUIVANTS. Changer de marque
     n'a besoin de rien : l'écran est remonté par App.jsx, qui met l'identifiant
     de la marque dans sa clé. */
  const premierAffichage = useRef(true);
  useEffect(() => {
    if (premierAffichage.current) { premierAffichage.current = false; return; }
    setI(0);
  }, [ig]);

  /* Les PHOTOS du modèle affiché sont l'affaire de la galerie commune :
     flèches, glissement du doigt, clavier, vignettes à côté. Cet écran n'a
     plus à les connaître — il ne choisit que la COULEUR. */

  if (!n) {
    return (
      <div className="mx-3 mt-6 rounded-2xl px-4 py-8 text-center"
        style={{ background: CARTE, border: `1px solid ${bordure}` }}>
        <p style={{ fontFamily: TITRE, fontSize: 19, color: texte }}>
          {(famille.nom || "").toUpperCase()} — RIEN À MONTRER
        </p>
        <p className="text-[13px] mt-2" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6 }}>
          Cette marque n'a pas encore de modèle.
        </p>
        <button onClick={onRetour} className="mt-5 px-5 py-2.5 rounded-xl"
          style={{ background: CARTE, border: `1px solid ${bordure}`, color: texte, fontFamily: TITRE, fontSize: 14 }}>
          ← LES MARQUES
        </button>
      </div>
    );
  }

  const { produit } = courant;
  const aVideo = !!(produit.video || "").trim();
  const aPhoto = GALERIE(produit).length > 0;

  /* LA PAGE D'UN MODÈLE — UNE COLONNE, DE HAUT EN BAS.

     Version précédente : une couche plein écran, avec le nom, le prix et le
     bouton posés SUR la photo. Sur un téléphone cela passait ; sur un écran
     large la photo restait une colonne étroite au milieu, et le texte partait
     se coller dans les coins noirs, très loin d'elle.

     Le défaut n'était pas la largeur, c'était le principe : poser les
     informations SUR l'image oblige à les entasser dans le peu de place qui
     reste, et interdit d'en mettre plus. Elles sont donc maintenant SOUS elle,
     dans le fil de la page. On voit la photo en grand, on descend, on trouve
     les tailles, le prix et le bouton — chacun avec la place qu'il lui faut.

     La colonne, elle, est celle de toute la boutique : la photo garde la forme
     choisie dans les réglages, et rien ne s'étale sur un grand écran. */
  return (
    /* Le glissement du doigt n'est plus écouté ici : il appartient à la
       galerie, qui est la seule à savoir quelle photo vient après. */
    <div className="select-none pb-4">

      {/* La barre de la marque : on sait où on est, et comment sortir. */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={onRetour} aria-label="Revenir aux marques"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
          style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <ChevronLeft size={18} color={texte} />
        </button>
        <p className="flex-1 truncate" style={{ fontFamily: TITRE, fontSize: 17, color: texte, letterSpacing: ".5px" }}>
          {(famille.nom || "").toUpperCase()}
        </p>
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex-shrink-0"
          style={{ background: CARTE, border: `1px solid ${bordure}`, color: texteDoux, fontFamily: CORPS }}>
          {i + 1} / {n}
        </span>
      </div>

      {/* Pas de photo, mais un film : le film prend simplement sa place. */}
      {aVideo && !aPhoto ? (
        <div className="mx-3">
          <CadreVideo produit={produit} couleur={(famille.couleurs || [])[0]} />
        </div>
      ) : (
      <>
      {/* LA GALERIE EST CELLE DU TRONC COMMUN — voir « GaleriePhotos » dans
          commun.jsx. Elle était écrite ici, et une autre, différente, sur la
          fiche produit : le même article se regardait de deux façons selon la
          porte par laquelle on était entré. */}
      <div className="mx-3">
        <GaleriePhotos produit={produit} famille={famille} aspect={PROPORTION_MARQUE} />
      </div>
      </>
      )}

      {/* Des photos ET un film : le film se déroule juste dessous, déjà lancé,
          au lieu d'attendre derrière un bouton. */}
      {aVideo && aPhoto && (
        <div className="mx-3 mt-3">
          <CadreVideo produit={produit} couleur={(famille.couleurs || [])[0]} />
        </div>
      )}

      {/* LES AUTRES MODÈLES, EN VIGNETTES.

          Des pastilles disaient seulement « il y en a trois, tu es sur la
          deuxième ». Elles ne montraient rien. Or ce qui distingue trois TN,
          c'est justement leur COULEUR : il faut la voir pour la choisir.

          Les vignettes portent donc la photo de chaque modèle, et un doigt
          dessus amène directement à sa page — ses photos, ses tailles, son
          prix. C'est ce que fait la page d'une marque, et c'est ce que le
          client connaît déjà.

          La rangée défile de côté si les modèles sont nombreux ; on ne les
          entasse pas sur plusieurs lignes, ce qui repousserait les tailles
          hors de l'écran. */}
      {/* LES GAMMES, EN ONGLETS. Elles ne paraissent qu'à partir de deux : une
          boutique qui ne vend qu'une sorte de vêtement n'a pas à expliquer
          qu'elle n'en vend qu'une. */}
      {gammes.length > 1 && (
        <div className="mt-3 px-3">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {gammes.map((g, k) => {
              const ici = k === ig;
              return (
                <button
                  key={(g.nom || "") + k}
                  onClick={() => setIg(k)}
                  aria-current={ici}
                  className="flex-shrink-0 px-3.5 py-2 rounded-xl text-[12px] active:scale-95 transition-transform"
                  style={{
                    background: ici ? texte : CARTE,
                    color: ici ? fond : texte,
                    border: `1px solid ${ici ? texte : bordure}`,
                    fontFamily: CORPS, fontWeight: ici ? 700 : 500,
                    letterSpacing: ".04em",
                  }}
                >
                  {(g.nom || "SANS NOM").toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {n > 1 && (
        <div className="mt-3 px-3">
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: texteDoux, fontFamily: CORPS }}>
            {n} modèles — touche pour changer
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {modeles.map((m, k) => {
              const vignette = GALERIE(m.produit)[0] || visuelProduit(m.produit, famille.couleurs, famille.glyphe);
              const choisi = k === i;
              return (
                <button
                  key={m.cle}
                  onClick={() => setI(k)}
                  aria-label={m.produit.nom}
                  className="flex-shrink-0 rounded-xl overflow-hidden transition-transform active:scale-95"
                  style={{
                    width: 64, height: 85,
                    /* Le fond d une vignette suit la boutique : un carre noir
                       derriere une photo gardee entiere se voyait sur une
                       vitrine blanche. */
                    background: CLAIR ? fondCarte : "#08080A",
                    border: `2px solid ${choisi ? texte : bordure}`,
                    opacity: choisi ? 1 : 0.72,
                  }}
                >
                  <img src={vignette} alt={m.produit.nom} className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = visuelProduit(m.produit, famille.couleurs, famille.glyphe); }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🚨 L'ORDRE DE LA PAGE : ON DÉCIDE D'ABORD, ON LIT ENSUITE.

              « les tailles et les prix se trouvent tout en bas de la page. Je
                préfère qu'ils se trouvent juste en dessous des images, et qu'en
                dessous du prix et des tailles soient les informations et le
                descriptif des produits »

          Et c'est juste. La description fait maintenant dix lignes — état,
          matière, coupe, finitions, étiquette, taille, entretien, prix. Elle
          repoussait le prix et les tailles sous le pli : le visiteur voyait la
          photo, puis un mur de texte, et devait descendre sans savoir combien
          ça coûte. Beaucoup ne descendent pas.

          L'ordre devient donc : la photo, le nom, CE QU'IL FAUT POUR DÉCIDER —
          la taille, le prix, le bouton — puis tout ce qu'on lit quand on est
          déjà intéressé. Plus la fiche est fournie, plus cet ordre compte. */}
      <div className="px-3 mt-5">
        <p style={MAISON
          ? { fontFamily: TITRE, fontWeight: 400, fontSize: "clamp(25px, 8vw, 34px)", color: texte, lineHeight: 1.12, letterSpacing: ".02em" }
          : { fontFamily: TITRE, fontSize: "clamp(22px, 7vw, 30px)", color: texte, lineHeight: 1.1 }}>
          {(produit.nom || "").toUpperCase()}
        </p>

        <div className="mt-3">
          <ChoixEtCommande produit={produit} onAjouter={onAjouter} compact />
        </div>

        {(produit.description || "").trim() && (
          <>
            {/* Un filet et une étiquette : le texte n'est plus la suite du nom,
                c'est une section à part, où l'on descend si l'on veut. */}
            <p className="mt-6 pb-2" style={MAISON
              ? { ...ETIQUETTE, fontSize: 9, color: texteDoux, borderBottom: TRAIT_OR }
              : { fontSize: 11, color: texteDoux, fontFamily: CORPS, letterSpacing: ".12em", textTransform: "uppercase" }}>
              La pièce en détail
            </p>
            <p className="text-[14px] mt-3" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {produit.description}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
