// LA GALERIE PHOTOS D'UN VÉHICULE
// ===============================
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CETTE GALERIE N'EST LUE QUE PAR App-location.jsx.                    │
// │ « GaleriePhotos » du socle ne change pas d'un pixel pour les boutiques  │
// │ de vente : elle garde sa colonne de vignettes à droite. Règle n°1 des   │
// │ consignes N°23 à N°26.                                                  │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 🚨 LE DÉFAUT QU'IL A VU, SUR LE TRAFIC D'EASY LEASE (7 PHOTOS).
// Les vignettes étaient rangées en COLONNE à droite de la grande photo. Plus
// il y a de photos, plus la colonne est haute — et comme la grande photo, elle,
// garde sa taille, le cadre s'étirait : une grande case noire vide sous la
// photo, avec les flèches perdues au milieu.
//
// ⚠️ LA RÈGLE QUI RÈGLE TOUT : LE CADRE A TOUJOURS LA MÊME HAUTEUR.
// La grande photo est en 4:3, pleine largeur. Les vignettes passent en bande
// HORIZONTALE dessous, sur une seule ligne qui défile. Qu'il y ait 1, 3, 7 ou
// 15 photos, la fiche fait la même hauteur — et il n'y a plus jamais de vide.
//
// ⚠️ UNE SEULE PHOTO : PAS DE BANDE, PAS DE FLÈCHES, PAS DE COMPTEUR.
// Une vignette unique qui montre exactement ce qu'on a sous les yeux ne sert
// qu'à occuper de la place, et « 1 / 1 » n'apprend rien à personne.

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import {
  Photo, GALERIE, SECOURS, AJUSTEMENT, CLAIR, fondCarte, bordure, jaune, CORPS,
} from "./commun.jsx";

export function GalerieVehicule({ v, onPleinEcran }) {
  const [j, setJ] = useState(0);
  const doigtX = useRef(null);
  const bande = useRef(null);

  const secours = SECOURS(v, v.famille);
  const vraies = GALERIE(v);
  /* Sans photo déposée, le dessin de secours en tient lieu : la galerie n'est
     jamais un cadre vide, et les flèches n'ont jamais à tourner dans du vide. */
  const galerie = vraies.length ? vraies : [secours];
  const np = galerie.length;

  /* Changer de véhicule sans remettre la galerie à zéro afficherait la 4ᵉ photo
     d'une voiture qui n'en a que deux. */
  useEffect(() => { setJ(0); }, [v.ref, v.nom]);

  /* 🚨 LA BANDE SUIT LA PHOTO AFFICHÉE.
     Avec quinze photos, la vignette active sort de l'écran dès la sixième : on
     change de photo avec la flèche, et la bande en dessous montre toujours le
     début. Elle se recentre donc toute seule. */
  useEffect(() => {
    if (!bande.current || np < 2) return;
    const active = bande.current.querySelector('[aria-current="true"]');
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }
      catch (e) { /* un navigateur ancien ignore les options : tant pis */ }
    }
  }, [j, np]);

  const photo = galerie[Math.min(j, np - 1)];
  const suivant = () => setJ((k) => (k + 1) % np);
  const precedent = () => setJ((k) => (k - 1 + np) % np);

  return (
    <div>
      {/* ═══ LA GRANDE PHOTO, PLEINE LARGEUR, EN 4:3 ═══ */}
      <div
        className={"relative w-full rounded-2xl overflow-hidden" + (onPleinEcran ? " cursor-pointer" : "")}
        style={{
          aspectRatio: "4 / 3",
          background: CLAIR ? fondCarte : "#08080A",
          border: `1px solid ${bordure}`,
        }}
        onClick={onPleinEcran ? () => onPleinEcran(v, j) : undefined}
        /* Le glissement du doigt : le geste que tout le monde essaie d'abord
           sur une photo, bien avant de chercher une flèche. */
        onTouchStart={(e) => { doigtX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (doigtX.current === null || np < 2) return;
          const d = e.changedTouches[0].clientX - doigtX.current;
          if (Math.abs(d) > 40) (d < 0 ? suivant : precedent)();
          doigtX.current = null;
        }}
      >
        <Photo
          produit={v}
          secours={secours}
          source={photo}
          alt={v.nom}
          className="w-full h-full"
          style={{ width: "100%", height: "100%", objectFit: AJUSTEMENT(v) }}
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
      </div>

      {/* ═══ LA BANDE DE VIGNETTES, HORIZONTALE ═══
          Une seule ligne qui défile. « flex-shrink-0 » sur chaque vignette :
          sans lui, elles se tassent à six par écran au lieu de défiler, et on
          ne reconnaît plus rien. */}
      {np > 1 && (
        <div
          ref={bande}
          className="mt-2 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {galerie.map((g, k) => (
            <button
              key={g + k}
              onClick={() => setJ(k)}
              aria-label={"Photo " + (k + 1) + " sur " + np}
              aria-current={k === j}
              className="rounded-xl overflow-hidden flex-shrink-0 active:scale-95 transition-transform"
              style={{
                width: 62, height: 62,
                background: CLAIR ? fondCarte : "#08080A",
                border: k === j ? `2px solid ${jaune}` : `1px solid ${bordure}`,
                opacity: k === j ? 1 : 0.6,
              }}
            >
              {/* Les vignettes se chargent au fur et à mesure : quinze photos
                  en taille normale au chargement de la fiche, c'est plusieurs
                  secondes d'attente pour des images de 62 pixels. */}
              <img
                src={g}
                alt=""
                loading="lazy"
                decoding="async"
                width={62}
                height={62}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = 0.15; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
