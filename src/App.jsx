// LE MOTEUR — ASSEMBLAGE
// ----------------------
// Ce fichier ne contient plus que les ecrans communs aux trois types (gammes,
// produits, fiche, infos, liens, avis, intro, visionneuse, videos) et
// l'aiguillage : selon le type de la boutique, l'accueil est celui du
// type 1 ou celui du type 2.
//
// Quatre fichiers, quatre roles :
//   commun.jsx        ce que TOUTES les boutiques partagent
//   type-familles.jsx le type 1, et lui seul
//   type-liste.jsx    le type 2, et lui seul
//   type-luxe.jsx     le type 3, et lui seul

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Search, ShoppingCart, Plus, Minus, X,
  Home, Info, Link2, Star, MessageCircle, Maximize2, PlayCircle,
} from "lucide-react";
import { visuelFamille, visuelProduit } from "./visuels.js";
import {
  FONTS, APERCU, VERS, MOUVEMENT_REDUIT, BOUTIQUE, COULEURS, FAMILLES, EST_VIDEOS, GALERIE,
  TOUS_PRODUITS, SELECTION_CHEF, VEDETTES, SECOURS, PRESENTATION, AJUSTEMENT,
  CLE, PROPORTION_PHOTO, STYLE_PHOTO, FOND_IMAGE, COLONNE, CARTE, VOILE, FOND_PAGE, CASCADE,
  DEGRADE, TITRE, CORPS, INTRO, ANIMATIONS, euros, MESSAGERIES,
  telegram, tgEssayer, ouvrirDehors, clicLien, vibrer,
  MESSAGERIE, CONTACT, PAIEMENTS, Photo, Video, Etiquette, Prix, BarreSection, Vedettes, RemonterEnHaut, MoyensDePaiement, BlocLivraison, referenceCommande, PEUT_COMMANDER,
  AVIS, Carrousel, CHOIX, ChoixEtCommande, CadreVideo,
  // Les deux etats reserves : tout ce qui les montre vient du tronc commun,
  // pour que les quatre types d accueil disent exactement la meme chose.
  ETAT_LU, BadgeEtat, DateSurLaPhoto, BlocEtatFiche, direLaDate,
  // 🚨 UN SEUL ENDROIT DECIDE CE QU EST UNE NOUVEAUTE, et il reconnait les
  // catalogues publies avant le 22 octobre 2026. Voir commun.jsx.
  EST_UNE_NOUVEAUTE, BandeauEtat,
  FAMILLE_RETOUR, FAMILLE_ARRIVAGE, OR_ETAT, ARGENT_ETAT,
  cartTotal, totalAPayer, fraisLivraison, resteAvantEnvoiOffert, LIVRAISON_PRIX,
  texteCommande, lienCommande, copierAvantDePartir,
  ChoixReception, MODE_PAR_DEFAUT,
  fond, fondCarte, bordure, texte, texteDoux, rose, violet, vert, jaune, cyan,
  // De quoi ne plus supposer un fond noir : voir « CLAIR OU SOMBRE » dans commun.
  ENCRE, ENCRE_DEGRADE, BARRE, BARRE_BASSE, CLAIR,
  OR, METAL, TRAIT_ACCENT, InviterAInstaller,
  // L habit de la boutique : voir « L ALLURE » dans commun.jsx.
  MAISON, ETIQUETTE, TRAIT_OR, ENSEIGNE,
  // La galerie d un produit : une seule pour toute la boutique.
  GaleriePhotos,
  // Les ecrans du socle : ils ne vendent rien, ils montrent la boutique.
  // Le moteur de location lit exactement les memes, depuis le meme endroit.
  Mesures, EcranInfo, EcranLiens, EcranAvis, Intro, Visionneuse,
  PiedLegal,
} from "./commun.jsx";
import { EcranFamilles } from "./type-familles.jsx";
import { EcranListe } from "./type-liste.jsx";
import { EcranLuxe } from "./type-luxe.jsx";
import { EcranMarques, EcranCatalogueMarque, EcranCarrousel, EcranTousLesProduits } from "./type-marques.jsx";
/* Une famille sans aucune gamme ouvrait un ecran entierement vide : le titre,
   puis rien. Vu du visiteur — et de qui tient la boutique — le bouton semble
   simplement ne pas marcher, alors qu'il a parfaitement fonctionne. On ne
   laisse plus jamais un ecran muet : il dit ce qu'il en est, et propose de
   revenir. */
function RayonVide({ famille, onRetour }) {
  return (
    <div className="mx-3 mt-6 rounded-2xl px-4 py-6 text-center"
      style={{ background: CARTE, border: `1px solid ${bordure}` }}>
      <p style={{ fontFamily: TITRE, fontSize: 19, color: texte, letterSpacing: ".5px" }}>
        {famille.emoji} Bientôt garni
      </p>
      <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 13, color: texteDoux }}>
        Cette famille n'a pas encore d'articles. Reviens la voir bientôt.
      </p>
      <button
        onClick={onRetour}
        className="mt-4 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
        style={{ backgroundImage: DEGRADE, color: ENCRE_DEGRADE, fontFamily: CORPS, fontSize: 13, fontWeight: 700 }}
      >
        Revenir aux familles
      </button>
    </div>
  );
}

/* Cliquer une famille amène ICI, directement sur ses articles.
   Avant, on tombait sur une liste de gammes : un menu de plus à traverser
   avant de voir la moindre image, alors que c'est l'image qu'on vient
   chercher. Les gammes n'ont pas disparu — elles sont devenues le filtre en
   haut de cet écran, et on n'y voit jamais que les articles de la famille
   choisie. */
/* 🚨 « etatDepart » : LE RAYON PEUT S'OUVRIR DÉJÀ FILTRÉ — N°21.
   C'est le second bouton d'une fiche, « Drapeaux GTA disponibles › », qui
   s'en sert : il renvoie dans le rayon SANS les articles en pause. Sa
   raison, écrite dans la consigne : « pour ne pas perdre la vente ». */
function EcranProduits({ famille, gamme, onProduit, onRetour, etatDepart = "tout" }) {
  const [recherche, setRecherche] = useState("");

  /* ⚠️ LE FILTRE D'ÉTAT S'AJOUTE AU FILTRE DE GAMME, IL NE LE REMPLACE PAS.
     C'est écrit en toutes lettres dans la consigne, et c'est juste : on peut
     vouloir « les nouveautés DE la collection GTA ». Les deux travaillent
     donc l'un après l'autre, dans cet ordre. */
  const [filtreEtat, setFiltreEtat] = useState(etatDepart);
  useEffect(() => { setFiltreEtat(etatDepart); }, [etatDepart, famille.id]);
  // « toutes » par défaut : on arrive d'une famille, on veut la voir entière.
  // La gamme n'est imposée que si l'on vient d'un produit précis.
  const [gammeFiltre, setGammeFiltre] = useState(gamme ? gamme.id : "toutes");

  // Le filtre peut désigner une gamme d'une AUTRE famille — après un retour,
  // ou si le catalogue a changé. On le vérifie plutôt que de faire confiance :
  // sans ça, la recherche échouait et l'écran se vidait sans rien expliquer.
  const gammeChoisie = famille.gammes.find((g) => g.id === gammeFiltre) || null;
  const filtreValide = gammeFiltre === "toutes" || !!gammeChoisie;

  const produits = useMemo(() => {
    // Chaque produit emporte sa clé — voir CLE dans commun.jsx : une référence
    // peut resservir d'une collection à l'autre, sa place non.
    const source = !filtreValide || gammeFiltre === "toutes"
      ? famille.gammes.flatMap((g) => (g.produits || []).map((p, i) => ({ ...p, gamme: g, cle: CLE(famille, g, i, p) })))
      : (gammeChoisie.produits || []).map((p, i) => ({ ...p, gamme: gammeChoisie, cle: CLE(famille, gammeChoisie, i, p) }));
    const q = recherche.trim().toLowerCase();
    const trouves = q ? source.filter((p) => p.nom.toLowerCase().includes(q)) : source;
    /* ⚠️ « Disponibles » VEUT DIRE ACHETABLES, et non « sans état » : un
       article simplement épuisé n'a pas d'état et n'est pas disponible. */
    if (filtreEtat === "dispo") return trouves.filter((p) => p.dispo !== false);
    if (filtreEtat === "arrivage") return trouves.filter(EST_UNE_NOUVEAUTE);
    if (filtreEtat === "retour") return trouves.filter((p) => p.etat === "retour");
    return trouves;
  }, [famille, gammeFiltre, recherche, filtreValide, gammeChoisie, filtreEtat]);

  /* 🚨 ON NE PROPOSE QUE LES FILTRES QUI ONT DES PRODUITS, et aucun filtre du
     tout si le rayon n'a ni nouveauté ni retour. Un filtre qui rend une
     grille vide est un bouton mort, et il y en a déjà eu assez ici.

     ⚠️ ON COMPTE SUR LE RAYON ENTIER, pas sur ce que la recherche a laissé :
     sinon les filtres apparaîtraient et disparaîtraient en tapant. */
  const tousDuRayon = useMemo(
    () => famille.gammes.flatMap((g) => g.produits || []),
    [famille],
  );
  const filtres = useMemo(() => {
    const n = (f) => tousDuRayon.filter(f).length;
    const arrivages = n(EST_UNE_NOUVEAUTE);
    const retours = n((p) => p.etat === "retour");
    if (!arrivages && !retours) return [];
    const dispos = n((p) => p.dispo !== false);
    return [
      { cle: "tout", nom: "Tout", couleur: texte },
      dispos && { cle: "dispo", nom: "Disponibles", couleur: texte },
      arrivages && { cle: "arrivage", nom: "✨ Nouveautés", couleur: OR_ETAT },
      retours && { cle: "retour", nom: "🔔 Retours", couleur: ARGENT_ETAT },
    ].filter(Boolean);
  }, [tousDuRayon]);

  return (
    <>
      <BarreSection titre={filtreValide && gammeChoisie ? gammeChoisie.nom : famille.nom} onRetour={onRetour} />

      <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: "#1C1C1C", border: `1px solid ${bordure}` }}>
        <Search size={16} color={texteDoux} />
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un produit..."
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: texte, fontFamily: CORPS }}
        />
        {recherche && (
          <button onClick={() => setRecherche("")} aria-label="Effacer">
            <X size={14} color={texteDoux} />
          </button>
        )}
      </div>

      {/* ⚠️ ELLE DÉFILE DE CÔTÉ : quatre filtres ne tiennent pas sur 375 px.
          Le premier est visible en entier, les autres dépassent — c'est ce
          qui dit qu'il y en a d'autres, mieux qu'une flèche. */}
      {filtres.length > 1 && (
        <div className="flex gap-2 px-3 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {filtres.map((f) => {
            const actif = filtreEtat === f.cle;
            return (
              <button
                key={f.cle}
                onClick={() => setFiltreEtat(f.cle)}
                className="flex-shrink-0 rounded-full px-3.5 active:scale-95 transition-transform"
                style={{
                  minHeight: 36,
                  background: actif ? f.couleur : CARTE,
                  color: actif ? ENCRE(f.couleur) : texteDoux,
                  border: `1px solid ${actif ? f.couleur : bordure}`,
                  fontFamily: CORPS, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
                }}
                aria-pressed={actif ? "true" : "false"}
              >
                {f.nom}
              </button>
            );
          })}
        </div>
      )}

      {famille.gammes.length > 1 && (
        <div className="mx-3 mt-2">
          <select
            value={filtreValide ? gammeFiltre : "toutes"}
            onChange={(e) => setGammeFiltre(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none appearance-none"
            style={{ background: VOILE(CLAIR ? fondCarte : "#1C1C1C", "D9"), border: `1px solid ${bordure}`, color: texte, fontFamily: CORPS }}
          >
            <option value="toutes">Tout {famille.nom} — {famille.gammes.reduce((s, g) => s + (g.produits || []).length, 0)} articles</option>
            {famille.gammes.map((g) => (
              <option key={g.id} value={g.id}>{g.nom} — {(g.produits || []).length}</option>
            ))}
          </select>
        </div>
      )}

      {produits.length === 0 && <RayonVide famille={famille} onRetour={onRetour} />}

      <RemonterEnHaut articles={produits.length} />

      <div className="grid grid-cols-2 gap-3 px-3 mt-4">
        {produits.map((p, rang) => (
          <button
            key={p.cle || p.ref}
            onClick={() => onProduit(famille, p.gamme, p)}
            /* 🚨 LA VIGNETTE DIT L'ÉTAT SANS UN MOT : contour doré pour une
               nouveauté, argent pour ce qui revient. LA PHOTO, ELLE, GARDE
               SES COULEURS — voir ETAT_LU dans commun.jsx pour pourquoi le
               noir et blanc est parti. */
            className="relative rounded-xl overflow-hidden text-left active:scale-[0.97] transition-transform atelier-carte"
            style={{
              background: CARTE,
              border: `2px solid ${EST_UNE_NOUVEAUTE(p) ? OR_ETAT
                : p.etat === "retour" ? ARGENT_ETAT : violet}`,
              boxShadow: EST_UNE_NOUVEAUTE(p) ? `0 0 18px ${OR_ETAT}38` : undefined,
              ...CASCADE(rang),
            }}
          >
            <div className="relative">
              <Photo
                produit={p}
                secours={SECOURS(p, famille)}
                source={visuelProduit(p, famille.couleurs, famille.glyphe)}
                alt={p.nom}
                /* ⚠️ UNE PHOTO N'EST PLUS DÉLAVÉE DU TOUT quand un état la
                   couvre : c'est le badge qui parle. Reste le vieux 40 % pour
                   un article simplement épuisé, sans rien à annoncer. */
                className="w-full block"
                style={{
                  ...STYLE_PHOTO(p),
                  opacity: p.dispo || p.etat || EST_UNE_NOUVEAUTE(p) ? 1 : 0.4,
                }}
              />
              <BadgeEtat produit={p} petit />
              <DateSurLaPhoto produit={p} />
              {/* 🚨 LE BANDEAU, EN PLEINE LARGEUR. Dans une grille à deux
                  colonnes, c'est lui qu'on lit — pas la pastille de coin. */}
              <BandeauEtat produit={p} petit />
              <span className="absolute top-1.5 right-1.5">
                {/* 🚨 « ÉPUISÉ » SOUS UN TITRE QUI DIT « BIENTÔT DE RETOUR » :
                    les deux étaient vrais, et ensemble ils se contredisaient.
                    C'est « BadgeEtat » qui parle maintenant, en haut à
                    gauche. Ici on garde l'étiquette de la gamme pour ce qui
                    est en vente, et « Épuisé » pour ce qui n'a pas d'état. */}
                {EST_UNE_NOUVEAUTE(p) ? null
                  : p.dispo
                  ? <Etiquette couleur={cyan}>{p.gamme.etiquette}</Etiquette>
                  : p.etat ? null
                  : <Etiquette couleur="#888">Épuisé</Etiquette>}
              </span>
            </div>
            <div className="p-2.5">
              <p className="text-[12.5px] font-bold leading-tight" style={{ color: texte, fontFamily: CORPS }}>{p.nom}</p>
              <p className="text-[10px] mt-0.5" style={{ color: texteDoux, fontFamily: CORPS }}>{p.unite}</p>
              <div className="mt-1"><Prix valeur={p.prix} avant={p.prixInitial} remise={p.remise} taille={16} /></div>
            </div>
          </button>
        ))}
      </div>

      {produits.length === 0 && (
        <p className="text-center text-[13px] mt-8 px-6" style={{ color: texteDoux }}>
          Aucun produit ne correspond à ta recherche.
        </p>
      )}
    </>
  );
}

/* Dans une galerie de vidéos, la vignette EST la vidéo : sa première image
   s'affiche au lieu du dessin de remplacement. Elle ne se lance pas — dix
   vidéos qui démarreraient ensemble videraient le forfait du visiteur. Elle se
   charge juste assez pour se montrer, et l'appui ouvre le plein écran. */
function VignetteVideo({ produit, famille, source, className }) {
  return (
    <Video
      source={produit.video}
      nom={produit.nom}
      muet
      auto={false}
      controles={false}
      className={className}
      style={STYLE_PHOTO(produit)}
      secours={
        <Photo produit={produit} secours={SECOURS(produit, famille)} source={source} alt={produit.nom} className={className} />
      }
    />
  );
}

function EcranFiche({ famille, gamme, produit, onRetour, onAjouter, onOuvrir, onVideo, onRayonDEtat, onDisponibles }) {
  /* La galerie se charge elle-même des photos, du dessin de secours et du
     passage de l'une à l'autre. Cet écran n'a plus besoin de savoir qu'il y en
     a trois ou dix — seulement s'il y en a, pour décider où va le film. */
  const aVideo = !!(produit.video || "").trim();
  const aPhoto = GALERIE(produit).length > 0;

  return (
    <>
      <BarreSection titre={produit.nom} onRetour={onRetour} />

      <div className="px-3 mt-3">
        {/* Pas de photo, mais un film : le film prend simplement sa place. */}
        {aVideo && !aPhoto ? (
          <CadreVideo produit={produit} couleur={famille.couleurs[0]} onPleinEcran={onVideo} />
        ) : (
          /* LA MÊME GALERIE QUE PARTOUT AILLEURS — voir « GaleriePhotos » dans
             commun.jsx.

             Celle qui était écrite ici ne ressemblait pas à celle du carrousel
             par marques : ses vignettes étaient DESSOUS, en rangée, et rognées
             au carré. Sur un vêtement photographié en hauteur, une vignette
             carrée montre un bout d'épaule, et on ne sait pas ce qu'on choisit.
             Le même article se regardait donc de deux façons selon la porte par
             laquelle on était entré. */
          /* 🚨 LA GRANDE PHOTO DIT L'ÉTAT AVANT TOUT TEXTE, MAIS ELLE GARDE
             SES COULEURS — 22 octobre 2026. Un retour portait un noir et
             blanc : il refroidissait celui qui découvrait le produit, et lui
             faisait croire que c'était sa vraie couleur. La pastille, la date
             et l'absence de panier suffisent à dire « en pause ». */
          <GaleriePhotos
            produit={produit}
            famille={famille}
            cadre={produit.etat || EST_UNE_NOUVEAUTE(produit)
              ? ETAT_LU(produit).couleur : famille.couleurs[0]}
            pastille={produit.etat || EST_UNE_NOUVEAUTE(produit)
              ? { texte: ETAT_LU(produit).pastille, couleur: ETAT_LU(produit).couleur }
              : null}
            onPleinEcran={onOuvrir}
          />
        )}

        {/* Des photos ET un film : le film se déroule juste dessous, déjà
            lancé, au lieu d'attendre derrière un bouton. */}
        {aVideo && aPhoto && (
          <div className="mt-3">
            <CadreVideo produit={produit} couleur={famille.couleurs[0]} onPleinEcran={onVideo} />
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        <p style={{ fontFamily: TITRE, fontSize: 28, color: texte, lineHeight: 1.1 }}>{produit.nom}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Etiquette couleur={vert}>{famille.nom}</Etiquette>
          <Etiquette couleur={cyan}>{gamme.nom}</Etiquette>
        </div>

        {/* 🚨 ON DECIDE D ABORD, ON LIT ENSUITE — le meme ordre que sur la
            page d un article par marques. Une description fournie repoussait
            le prix et les tailles sous le pli : le visiteur voyait la photo,
            puis un mur de texte, et devait descendre sans savoir combien ca
            coute. Beaucoup ne descendent pas.

            LA TAILLE, LA COULEUR, LE PRIX ET LE PANIER.
            Ce sont les deux questions qu'on pose en magasin avant toute autre,
            et les deux qui font renoncer quand la réponse manque. Elles vivent
            ici, sur la fiche commune : une boutique de chaussures en a besoin,
            mais une boutique de vêtements ou de vaisselle aussi.

            Rien ne s'affiche si le vendeur n'a rien écrit — pas de ligne vide,
            pas de « non renseigné ». Une boutique d'épicerie ne verra jamais
            ces deux lignes. */}
        <ChoixEtCommande produit={produit} onAjouter={onAjouter} />

        {/* ⚠️ LES DEUX PORTES D'UN ARTICLE EN PAUSE. Voir « BlocEtatFiche »
            dans commun.jsx : rien ne s'affiche pour un article ordinaire. */}
        {/* 🚨 « gamme.origine » QUAND ON ARRIVE D'UN RAYON D'ÉTAT : le second
            bouton doit renvoyer vers le rayon DU VENDEUR, jamais vers le rayon
            d'état lui-même — dont tous les articles sont en pause. */}
        <BlocEtatFiche
          produit={produit}
          famille={(gamme && gamme.origine) || famille}
          onRayonDEtat={onRayonDEtat}
          onDisponibles={onDisponibles}
        />

        {(produit.description || "").trim() && (
          <>
            <p className="mt-6 pb-2 text-[11px] uppercase"
              style={{ color: texteDoux, fontFamily: CORPS, letterSpacing: ".12em", borderBottom: `1px solid ${bordure}` }}>
              Le produit en détail
            </p>
            <p className="text-[14px] mt-3" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {produit.description}
            </p>
          </>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────── application ─────────────────────────── */

// ══════════ FAMILLE DE VIDÉOS ══════════
// Une galerie, pas un rayon : aucun prix, aucun panier. Un appui ouvre la
// vidéo en plein écran, exactement comme depuis une fiche produit.
function EcranVideos({ famille, onRetour, onVideo }) {
  return (
    <>
      <BarreSection titre={`${famille.emoji} ${famille.nom}`} onRetour={onRetour} />
      <div className="flex flex-col gap-5 px-3 mt-4">
        {famille.gammes.map((g) => (
          <div key={g.id}>
            {famille.gammes.length > 1 && (
              <p className="mb-2 px-1" style={{ fontFamily: TITRE, fontSize: 19, color: jaune, letterSpacing: ".5px" }}>
                {g.nom} {g.etiquette && <span style={{ fontSize: 12, color: cyan }}>{g.etiquette}</span>}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {g.produits.map((p) => {
                const affiche = visuelProduit(p, famille.couleurs, famille.glyphe);
                const jouable = !!(p.video || "").trim();
                return (
                  <button
                    key={p.cle || p.ref}
                    onClick={() => jouable && onVideo(p)}
                    className="relative rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
                    style={{
                      border: `2px solid ${jouable ? famille.couleurs[0] : bordure}`,
                      boxShadow: jouable ? `0 0 18px ${famille.couleurs[0]}33` : "none",
                      opacity: jouable ? 1 : 0.55,
                    }}
                  >
                    {jouable ? (
                      <VignetteVideo produit={p} famille={famille} source={affiche} className="w-full block" />
                    ) : (
                      <Photo produit={p} secours={SECOURS(p, famille)} source={affiche} alt={p.nom} className="w-full block" />
                    )}
                    {jouable && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: "#000000A8", border: `2px solid ${cyan}`, boxShadow: `0 0 18px ${cyan}66` }}
                        >
                          <PlayCircle size={28} color={cyan} />
                        </span>
                      </span>
                    )}
                    <span
                      className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-8"
                      style={{ backgroundImage: "linear-gradient(0deg, #000000C8 20%, transparent 100%)" }}
                    >
                      <span className="block text-[12px] font-bold leading-tight" style={{ color: texte, fontFamily: CORPS }}>
                        {p.nom}
                      </span>
                      {!jouable && (
                        <span className="block text-[10px] mt-0.5" style={{ color: texteDoux, fontFamily: CORPS }}>
                          vidéo à venir
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Boutique() {
  const [onglet, setOnglet] = useState("accueil");

  /* 🚨 LA HAUTEUR DE L'ENTÊTE, MESURÉE ET PARTAGÉE.

     La tuile d'une marque fait « 100dvh » — un écran de téléphone, une marque.
     Mais elle est posée SOUS l'entête collant, qui occupe quand même sa place
     dans le fil : la tuile commençait à 108 px et finissait donc 108 px plus
     bas que l'écran. Le nom de la maison, calé en bas de la tuile, tombait
     exactement derrière la barre ACCUEIL / INFOS.

     Mesuré sur une boutique en ligne : nom de 754 à 784, barre du bas à 738.
     Invisible. Le visiteur voyait une photo plein écran sans savoir de quelle
     maison il s'agit — sur Maison Mapuche comme sur la vitrine des baskets.

     L'entête n'a pas de hauteur fixe : il porte le bandeau (une ou deux
     lignes selon le texte), le logo, le nom. On la mesure donc, et on la pose
     en variable CSS pour que n'importe quel écran puisse s'y caler. */
  const entete = useRef(null);
  useEffect(() => {
    const el = entete.current;
    if (!el) return;
    const poser = () => {
      document.documentElement.style.setProperty("--entete", el.offsetHeight + "px");
    };
    poser();
    /* Le bandeau se replie sur deux lignes quand on tourne le téléphone, et
       l'aperçu ajoute une ligne de plus. Sans observateur, la mesure du
       premier affichage resterait fausse pour toute la visite. */
    if (typeof ResizeObserver === "undefined") return;
    const oeil = new ResizeObserver(poser);
    oeil.observe(el);
    return () => oeil.disconnect();
  }, []);
  const [famille, setFamille] = useState(null);
  /* 🚨 SUR QUEL FILTRE LE RAYON S'OUVRE. « tout » presque toujours ; « dispo »
     quand on y arrive par « Drapeaux GTA disponibles › », depuis la fiche
     d'un article en pause. C'est le bouton qui ne perd pas la vente. */
  const [departEtat, setDepartEtat] = useState("tout");
  const [gamme, setGamme] = useState(null);
  const [produit, setProduit] = useState(null);
  /* La deuxième porte de la présentation par marques : tous les articles,
     toutes maisons confondues. */
  const [tousArticles, setTousArticles] = useState(false);
  const [panier, setPanier] = useState([]);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [vue, setVue] = useState(null);   // { produit, depart } : la visionneuse
  // Une seule reference par visite : elle doit rester la meme entre le panier,
  // le message envoye et le virement, sinon elle ne relie rien.
  const [reference] = useState(referenceCommande);

  /* 🚨 COMMENT CET ACHETEUR-LÀ VEUT RECEVOIR SA COMMANDE.
     ──────────────────────────────────────────────────────
     Demandé le 15 octobre 2026 : « optimiser une façon de choisir pour un
     éventuel acheteur si l'option est activée ».

     Le vendeur décide ce qu'il PROPOSE — envoi, main à main, ou les deux.
     Quand il propose les deux, c'est l'acheteur qui tranche : lui seul sait
     s'il habite à deux rues. Le choix tient ici, dans le panier, parce
     qu'il change le total, les frais et les lignes à remplir — et qu'il ne
     doit survivre ni à la fermeture du panier ni à la commande suivante.

     MODE_PAR_DEFAUT vaut « envoi » dès que l'envoi est proposé : un total
     qui MONTE en changeant d'avis fait annuler une commande, l'inverse
     non. Voir « LE MODE PAR DÉFAUT » dans commun.jsx. */
  const [reception, setReception] = useState(MODE_PAR_DEFAUT);
  const [video, setVideo] = useState(null);

  /* L'intro ne se rejoue pas à chaque page, seulement à chaque visite.

     EN APERÇU, ELLE SUIT CE QU'ON VENAIT VOIR. Régler une couleur ou un
     prix et devoir regarder quatre secondes d'animation avant d'atteindre
     le catalogue, dix fois de suite, c'est une minute perdue par séance —
     et l'envie de ne plus prévisualiser du tout. L'ouverture garde son
     propre bouton, qui la joue seule et sait la rejouer. */
  const [intro, setIntro] = useState(() => {
    if (!INTRO.active) return false;
    if (APERCU) return VERS !== "boutique";
    try {
      return !sessionStorage.getItem("intro-vue");
    } catch (e) {
      return true;
    }
  });

  const finirIntro = () => {
    setIntro(false);
    try { sessionStorage.setItem("intro-vue", "1"); } catch (e) {}
  };

  const nbArticles = panier.reduce((s, i) => s + i.qty, 0);

  /* DANS QUEL SENS VA-T-ON ?
     ────────────────────────
     Un écran qui arrive depuis la droite veut dire « je descends d'un cran » ;
     depuis la gauche, « je reviens ». Encore faut-il savoir lequel des deux,
     et React ne le dit pas : il ne connaît que l'état d'arrivée.

     On mesure donc la PROFONDEUR — accueil 0, rayon 1, fiche produit 2 — et on
     la compare à celle du rendu précédent. Le changement d'onglet du bas, lui,
     n'est pas une descente : il entre toujours par la droite. */
  const profondeur = produit ? 2 : famille ? 1 : 0;
  const profondeurAvant = useRef(profondeur);
  const sens = profondeur < profondeurAvant.current ? "arriere" : "avant";
  useEffect(() => { profondeurAvant.current = profondeur; }, [profondeur]);

  /* La clé change quand l'écran change : c'est ce qui fait rejouer l'animation
     — sans elle, React garderait le même bloc et rien ne bougerait. */
  const cleEcran = [onglet, tousArticles ? "tout" : "", famille && famille.id, gamme && gamme.id, produit && produit.ref]
    .filter(Boolean).join("/");

/* Deux pointures du même modèle sont DEUX lignes de commande, pas une.
     C'est pourquoi l'article est reconnu par sa référence ET par la taille et
     la couleur choisies : sans cela, commander un 42 après un 40 remplacerait
     silencieusement le premier, et le vendeur enverrait deux fois la même
     paire. Un client qui ne choisit rien retombe sur l'ancien comportement. */
  const ajouter = (p, qte, taille = "", couleur = "") => {
    /* LA VIGNETTE PART AVEC L'ARTICLE DANS LE PANIER.
       Elle est calculée ICI, au moment de l'ajout, et non retrouvée plus tard
       d'après la référence : une même référence peut resservir d'une
       collection à l'autre, et le panier aurait affiché la photo du voisin.
       Faute de photo, on emporte le dessin de secours — jamais un carré vide. */
    const rayon = famille || p.famille || { couleurs: ["#FF1B8D", "#7B2FF7"], glyphe: "boite" };
    const vignette = GALERIE(p)[0] || "";
    const secours = SECOURS(p, rayon);

    const meme = (i) => i.ref === p.ref && (i.taille || "") === taille && (i.couleur || "") === couleur;
    setPanier((actuel) => {
      if (actuel.find(meme)) return actuel.map((i) => (meme(i) ? { ...i, qty: i.qty + qte } : i));
      return [...actuel, { ref: p.ref, nom: p.nom, unite: p.unite, prix: p.prix, qty: qte, taille, couleur, vignette, secours }];
    });
    setPanierOuvert(true);
    // La petite secousse qui confirme l'ajout, sans avoir à lire quoi que ce soit.
    vibrer("succes");
  };

  const changerQte = (ref, delta) => {
    setPanier((actuel) =>
      actuel.map((i) => (i.ref === ref ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );
  };

  const allerProduit = (f, g, p) => {
    setOnglet("accueil"); setTousArticles(false); setFamille(f); setGamme(g); setProduit(p);
  };

  /* Choisir une famille remet les niveaux du dessous à zéro.
     Sans ça, un produit ou une gamme d'une visite précédente restait en
     mémoire : on cliquait sur une famille et c'est l'ancien écran qui
     revenait. Le bouton semblait alors « ne pas marcher », et seulement de
     temps en temps — selon ce qu'on avait consulté avant. */
  const choisirFamille = (f) => {
    setOnglet("accueil"); setTousArticles(false); setProduit(null); setGamme(null);
    setDepartEtat("tout"); setFamille(f);
  };

  /* ⚠️ LA MÊME PORTE, MAIS DÉJÀ FILTRÉE. On ne duplique pas « choisirFamille »
     — on pose le départ avant, et on la laisse faire le reste. */
  const allerAuxDisponibles = (f) => {
    setOnglet("accueil"); setTousArticles(false); setProduit(null); setGamme(null);
    setDepartEtat("dispo"); setFamille(f);
  };

  // Depuis un article on revient a la famille ; depuis la famille, a l accueil.
  // Il n y a plus de niveau intermediaire a traverser.
  const retour = () => {
    if (produit) { setProduit(null); return; }
    if (tousArticles) { setTousArticles(false); return; }
    setGamme(null); setFamille(null);
  };

  const accueil = () => {
    setOnglet("accueil"); setTousArticles(false); setProduit(null); setGamme(null); setFamille(null);
  };

  /* ═══════ LES BOUTONS QUE TELEGRAM PRÊTE ═══════

     Ils vivent HORS de la page — le grand en bas de l'écran, la flèche en haut
     — et c'est précisément ce qui fait « application » plutôt que « site dans
     une fenêtre ». Mais ils appartiennent à Telegram : ils gardent ce qu'on
     leur a dit la dernière fois. Chaque effet doit donc aussi savoir se
     DÉFAIRE, sinon la flèche retour survit à l'écran qui l'avait demandée et
     renvoie dans le vide.

     ⚠️ Les boutons de la page restent tous en place. Ceux-ci s'ajoutent, ils ne
     remplacent rien : si Telegram refuse l'un d'eux — vieille version, cas non
     prévu — on ne perd aucune façon de commander. */
  const profond = !!(famille || produit) || onglet !== "accueil";

  useEffect(() => {
    if (!telegram || !telegram.BackButton) return undefined;
    const revenir = () => {
      vibrer("leger");
      if (panierOuvert) { setPanierOuvert(false); return; }
      if (onglet !== "accueil") { setOnglet("accueil"); return; }
      retour();
    };
    tgEssayer(() => telegram.BackButton.onClick(revenir));
    tgEssayer(() => (profond || panierOuvert ? telegram.BackButton.show() : telegram.BackButton.hide()));
    return () => { tgEssayer(() => telegram.BackButton.offClick(revenir)); };
  }, [profond, panierOuvert, onglet, famille, produit]);

  /* LE GRAND BOUTON DU BAS, qui dit toujours la prochaine chose à faire :
     voir le panier tant qu'il est fermé, envoyer la commande une fois ouvert.
     Panier vide, il disparaît — un bouton géant qui ne sert à rien encombre. */
  useEffect(() => {
    if (!telegram || !telegram.MainButton) return undefined;
    const b = telegram.MainButton;
    const total = totalAPayer(panier, reception);
    const peutEnvoyer = BOUTIQUE.commandeActive !== false && CONTACT;

    if (!panier.length) {
      tgEssayer(() => b.hide());
      return undefined;
    }

    const envoyer = () => {
      vibrer("succes");
      if (!MESSAGERIE.prerempli) copierAvantDePartir(texteCommande(panier, reference, reception));
      ouvrirDehors(lienCommande(panier, reference, reception));
    };
    const geste = panierOuvert && peutEnvoyer ? envoyer : () => { vibrer("leger"); setPanierOuvert(true); };

    tgEssayer(() => b.setText(
      panierOuvert && peutEnvoyer
        ? `ENVOYER SUR ${MESSAGERIE.nom.toUpperCase()}`
        : `MON PANIER · ${euros(total)}`,
    ));
    tgEssayer(() => b.onClick(geste));
    tgEssayer(() => b.show());

    return () => { tgEssayer(() => b.offClick(geste)); };
    /* « reception » est dans la liste : sans elle, le gros bouton garderait le
       total de l'envoi après un passage en main à main. */
  }, [panier, panierOuvert, reference, reception]);

  /* Quitter la mini-application avec un panier rempli efface la commande sans
     prévenir. Telegram sait poser la question — à condition qu'on la lui
     demande, et qu'on la retire dès que le panier est vide. */
  useEffect(() => {
    if (!tgEssayer(() => telegram.enableClosingConfirmation)) return;
    tgEssayer((tg) => (panier.length ? tg.enableClosingConfirmation() : tg.disableClosingConfirmation()));
  }, [panier.length]);

  // Chaque onglet peut être masqué depuis config.js. Accueil reste toujours là.
  const onglets = [
    { id: "accueil", nom: "ACCUEIL", Icone: Home, visible: true },
    { id: "info", nom: "INFOS", Icone: Info, visible: BOUTIQUE.afficherInfos !== false },
    { id: "liens", nom: "LIENS", Icone: Link2, visible: BOUTIQUE.afficherLiens !== false },
    { id: "avis", nom: "AVIS", Icone: Star, visible: BOUTIQUE.afficherAvis !== false },
  ].filter((o) => o.visible);

  return (
    <div className="min-h-screen w-full" style={FOND_PAGE}>
      <style>{FONTS}</style>
      <style>{ANIMATIONS}</style>
      {intro && <Intro onFini={finirIntro} />}

      <div
        className="relative w-full max-w-[560px] mx-auto min-h-screen"
        style={{ background: COLONNE }}
      >

        {/* bandeau et entête */}
        <div className="sticky top-0 z-20" ref={entete}>
          {/* Deux aperçus, deux publics. Le vendeur regarde SON brouillon et
              doit savoir que rien n'est publié. Un visiteur qui découvre une
              boutique d'exemple, lui, n'a pas de brouillon : lui parler de
              publication ne ferait que l'inquiéter. */}
          {APERCU && (
            <div className="text-center py-1.5 px-3" style={{ background: "#FFC93C" }}>
              <p style={{ fontFamily: CORPS, fontSize: 11, fontWeight: 800, color: "#1A1200", letterSpacing: ".3px" }}>
                {BOUTIQUE.vitrine
                  ? "EXEMPLE — une boutique de démonstration, rien n'est à vendre ici"
                  : VERS === "ouverture"
                    ? "APERÇU DE L'OUVERTURE — ce que voit un visiteur en arrivant"
                    : "APERÇU — brouillon non publié, tes clients ne voient pas ceci"}
              </p>
              {/* REVOIR, SANS RECHARGER.
                  Une durée se règle en comparant : trois secondes, puis
                  quatre. Recharger la page pour chaque essai, c'est repasser
                  par l'atelier à chaque fois. */}
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
          {/* Un bandeau vide en allure « or » n'est pas une bande creuse :
              c'est un filet de 3 px. On enlève le mobilier, on garde l'or. */}
          {OR && !(BOUTIQUE.bandeau || "").trim() ? (
            <div style={{ height: 3, backgroundImage: DEGRADE }} />
          ) : (
            <div className="text-center py-1.5" style={{ backgroundImage: DEGRADE }}>
              <p style={{
                fontFamily: CORPS, fontSize: 11, color: ENCRE_DEGRADE,
                ...(OR ? { fontWeight: 400, letterSpacing: ".3em", textTransform: "uppercase", fontSize: 9.5 }
                       : { fontWeight: 700, letterSpacing: ".5px" }),
              }}>
                {BOUTIQUE.bandeau}
              </p>
            </div>
          )}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ background: FOND_IMAGE ? "#0B0B0BB3" : BARRE, backdropFilter: "blur(8px)", borderBottom: `1px solid ${bordure}` }}
          >
            {/* 🚨 L'ESPACEUR QUI CREUSAIT UN TROU DE 80 PX.

                Il est là pour CONTREBALANCER le panier : 44 px à gauche, le
                panier à droite, et le logo reste au milieu. Juste — tant qu'il
                y a un panier.

                Sur une vitrine, il n'y en a pas. « justify-between » se
                retrouvait donc avec deux enfants seulement, l'espaceur et le
                logo, et les envoyait aux deux bouts : le logo collé à droite,
                et une bande vide sur les deux tiers de la largeur.

                    « la partie en haut de la boutique est beaucoup trop
                      vide, il faut la remplir »

                Il ne paraît donc plus que s'il a quelque chose à équilibrer.
                Les boutiques qui ont un panier ne changent pas d'un pixel. */}
            {PEUT_COMMANDER && <span className="w-11" />}

            <button
              onClick={accueil}
              className={PEUT_COMMANDER
                ? "flex flex-col items-center active:scale-95 transition-transform"
                : "flex items-center gap-3 min-w-0 active:scale-95 transition-transform"}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
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

              {/* AVEC UN PANIER : le nom sous le logo, en petit, comme avant.
                  SANS PANIER : la place est libre, alors le nom s'écrit en
                  grand à côté, avec le sous-titre dessous. C'est ce que fait
                  l'enseigne d'une maison — et c'est ce qui remplit la bande au
                  lieu de la décorer. */}
              {PEUT_COMMANDER && !ENSEIGNE.grandNom ? (
                <p style={{ fontFamily: TITRE, fontSize: 11, color: texteDoux, letterSpacing: ".5px", marginTop: 2 }}>
                  {BOUTIQUE.nom}
                </p>
              ) : (
                /* EN ALLURE « MAISON », L'ENSEIGNE REMPLACE LE TITRE.
                   Le nom passe en serif, plus grand et plus léger, et un filet
                   d'or d'un pixel le sépare du sous-titre — c'est ce trait qui
                   fait l'enseigne, pas le fond doré. */
                /* 🚨 « max-w-full » N'EST PAS UNE FINITION, C'EST LE SEUL
                   CHOSE QUI EMPÊCHE LE NOM DE POUSSER LA PAGE.
                   ──────────────────────────────────────────────────────
                   « truncate » coupe avec « … », mais seulement si la boîte
                   a une largeur. Dans une colonne alignée à gauche, un
                   paragraphe prend la largeur de son TEXTE et déborde
                   tranquillement de son parent : la page entière s'élargit,
                   et le visiteur se retrouve à devoir pousser son écran de
                   côté pour lire.

                   Mesuré le 16 octobre 2026 sur un nom de 38 caractères :
                   en allure « maison », le nom sortait de son cadre de
                   142 px. En « atelier » ça ne se voyait pas — Anton est
                   une condensée très étroite. Les polices larges ajoutées
                   ce jour-là l'ont rendu visible, elles ne l'ont pas créé.

                   ⚠️ Et « min-w-0 » sur le parent ne suffisait pas : il
                   autorise le PARENT à rétrécir, pas l'enfant à se taire. */
                <span className="flex flex-col items-start min-w-0 text-left">
                  <p
                    className="truncate max-w-full"
                    /* ⚠️ L'ORDRE COMPTE : « METAL » pose sa propre couleur,
                       et il doit donc passer APRÈS « color ». Mis avant, le
                       texte redeviendrait plat. */
                    style={{
                      fontFamily: TITRE,
                      fontSize: ENSEIGNE.taille,
                      fontWeight: ENSEIGNE.poids,
                      letterSpacing: ENSEIGNE.ecart,
                      lineHeight: 1.05,
                      color: texte,
                      ...(ENSEIGNE.capitales ? { textTransform: "uppercase" } : null),
                      ...(ENSEIGNE.metal ? METAL : null),
                    }}
                  >
                    {BOUTIQUE.nom}
                  </p>
                  {(BOUTIQUE.sousTitre || "").trim() && (
                    <p
                      className="truncate max-w-full"
                      /* Le filet sous le nom, c'est lui qui fait l'enseigne —
                         pas un fond doré. Un trait d'un pixel suffit. */
                      style={ENSEIGNE.etiquette
                        ? {
                          ...ETIQUETTE, fontSize: ENSEIGNE.sousTaille, color: texteDoux,
                          marginTop: ENSEIGNE.filet ? 5 : 4,
                          ...(ENSEIGNE.filet ? { paddingTop: 5, borderTop: TRAIT_OR } : null),
                        }
                        : { fontFamily: CORPS, fontSize: ENSEIGNE.sousTaille, color: texteDoux, letterSpacing: ".06em", marginTop: 2 }}
                    >
                      {BOUTIQUE.sousTitre}
                    </p>
                  )}
                </span>
              )}
            </button>
            {PEUT_COMMANDER && (
              <button
                onClick={() => setPanierOuvert(true)}
                className="relative w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: CARTE, border: `1px solid ${bordure}` }}
                aria-label="Ouvrir le panier"
              >
                <ShoppingCart size={19} color={texte} />
                {nbArticles > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
                    style={{ background: vert, color: ENCRE(vert), border: `2px solid ${fond}` }}
                  >
                    {nbArticles}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className={`pb-28 atelier-ecran atelier-glisse-${sens}`} key={cleEcran}>
          {onglet === "info" && <EcranInfo />}
          {onglet === "liens" && <EcranLiens />}
          {onglet === "avis" && <EcranAvis />}
          {onglet === "accueil" && (
            famille && EST_VIDEOS(famille) ? (
              <EcranVideos famille={famille} onRetour={retour} onVideo={setVideo} />
            ) : famille && PRESENTATION === "marques" ? (
              /* 🚨 TROIS NIVEAUX, ET NON DEUX. Toucher une marque ouvrait
                 directement un article, les autres réduits à des vignettes de
                 64 px. Une maison qui vend un pull, un pantalon et une veste
                 montrait donc une devanture d'un seul article. On passe
                 maintenant par sa vitrine, puis on entre dans la pièce. */
              produit ? (
                <EcranCarrousel famille={famille} gamme={gamme} produit={produit} onAjouter={ajouter} onRetour={retour} />
              ) : (
                <EcranCatalogueMarque famille={famille} onProduit={allerProduit} onRetour={retour} />
              )
            ) : produit ? (
              <EcranFiche famille={famille} gamme={gamme} produit={produit} onRetour={retour} onAjouter={ajouter} onOuvrir={(p, n) => setVue({ produit: p, depart: n || 0 })} onVideo={setVideo} onRayonDEtat={choisirFamille} onDisponibles={allerAuxDisponibles} />
            ) : famille ? (
              <EcranProduits famille={famille} gamme={gamme} onProduit={allerProduit} onRetour={retour} etatDepart={departEtat} />
            ) : PRESENTATION === "liste" ? (
              <EcranListe onProduit={allerProduit} onFamille={choisirFamille} />
            ) : PRESENTATION === "marques" ? (
              tousArticles
                ? <EcranTousLesProduits onProduit={allerProduit} onRetour={retour} />
                : <EcranMarques onFamille={choisirFamille} onTout={() => setTousArticles(true)} />
            ) : PRESENTATION === "luxe" ? (
              <EcranLuxe onFamille={choisirFamille} onProduit={allerProduit} />
            ) : (
              <EcranFamilles onFamille={choisirFamille} onProduit={allerProduit} />
            )
          )}
        </div>

        {/* 🚨 LE PIED LÉGAL — IL N'A PAS D'INTERRUPTEUR, ET C'EST VOULU.
            Qui vend, particulier ou professionnel, que le contrat n'est pas
            avec la plateforme, et comment signaler. L'onglet INFOS pouvait
            être éteint par le vendeur : une obligation qu'on peut décocher
            n'est pas une obligation. Voir PiedLegal dans commun.jsx. */}
        <PiedLegal />
        {/* Garder la boutique sur son telephone. Pose avant la barre du bas
            pour se glisser au-dessus d elle, et jamais dans Telegram. */}
        <InviterAInstaller />

        {/* barre de navigation du bas */}
        <div
          className="fixed bottom-0 left-0 right-0 z-30 flex justify-center gap-2 px-3 py-2.5"
          style={{ background: FOND_IMAGE ? "#0B0B0BB3" : BARRE_BASSE, backdropFilter: "blur(10px)", borderTop: `1px solid ${bordure}` }}
        >
          <div className="w-full max-w-[560px] flex justify-around gap-2">
            {onglets.map(({ id, nom, Icone }) => {
              const actif = onglet === id;
              return (
                <button
                  key={id}
                  onClick={() => (id === "accueil" ? accueil() : setOnglet(id))}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl active:scale-95 transition-transform"
                  style={OR
                    /* Plus de cadre, plus de halo : c'est le trait sous le
                       mot qui dit où l'on est. */
                    ? { background: "transparent", border: "none", position: "relative" }
                    : {
                      /* L'onglet choisi se pose sur un fond légèrement teinté de
                         la couleur de la boutique. Il était violet foncé en dur :
                         une tache sombre au bas d'une vitrine blanche. */
                      background: actif ? VOILE(CLAIR ? COULEURS.halo : "#1A0A14", "D9") : "transparent",
                      border: `2px solid ${actif ? rose : CLAIR ? bordure : "#3A2130"}`,
                      boxShadow: actif ? `0 0 16px ${rose}55` : "none",
                    }}
                >
                  <Icone size={17} color={actif ? (OR ? jaune : rose) : texteDoux} />
                  <span style={{
                    fontFamily: OR ? TITRE : CORPS, fontSize: 9.5,
                    color: actif ? (OR ? jaune : rose) : texteDoux,
                    ...(OR ? { fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase" }
                           : { fontWeight: 700, letterSpacing: ".5px" }),
                  }}>
                    {nom}
                  </span>
                  {OR && actif && (
                    <span style={{ position: "absolute", bottom: -2, left: "50%", marginLeft: -13, width: 26, height: 2, backgroundImage: TRAIT_ACCENT }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* panier */}
        {panierOuvert && PEUT_COMMANDER && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,.8)" }}
            onClick={() => setPanierOuvert(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[560px] rounded-t-3xl p-5 max-h-[92vh] overflow-y-auto"
              /* ⚠️ LE PANIER EST LE PIRE ENDROIT OÙ RATER ÇA : c'est l'écran
                 où le visiteur relit son total avant de commander. */
              style={{ background: VOILE(CLAIR ? fondCarte : "#101010", "F2"), border: `1px solid ${bordure}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontFamily: TITRE, fontSize: 22, color: texte }}>MON PANIER</p>
                <button onClick={() => setPanierOuvert(false)} aria-label="Fermer"><X size={18} color={texteDoux} /></button>
              </div>

              {panier.length === 0 ? (
                <p className="text-center text-[13px] py-8" style={{ color: texteDoux, fontFamily: CORPS }}>
                  Ton panier est vide.
                </p>
              ) : (
                <>
                  <p className="text-[11px] mb-1" style={{ color: texteDoux, fontFamily: CORPS }}>
                    {nbArticles} article{nbArticles > 1 ? "s" : ""}
                  </p>
                  {panier.map((i) => (
                    <div key={i.ref} className="flex items-center gap-3 py-3" style={{ borderTop: `1px solid #232323` }}>
                      {/* LA PHOTO DANS LE PANIER.
                          Une liste de noms et de références ne se relit pas :
                          « REF-001 » ne dit rien, la photo dit tout. Le client
                          vérifie d'un regard qu'il commande le bon drapeau,
                          avant de payer — et non en recevant le colis. */}
                      <img
                        src={i.vignette || i.secours}
                        onError={(e) => { if (i.secours && e.target.src !== i.secours) e.target.src = i.secours; }}
                        alt={i.nom}
                        className="rounded-lg flex-shrink-0"
                        style={{ width: 52, height: 52, objectFit: "cover", background: "#000", border: `1px solid ${bordure}` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold leading-tight" style={{ color: texte, fontFamily: CORPS }}>{i.nom}</p>
                        <p className="text-[11px]" style={{ color: texteDoux, fontFamily: CORPS }}>
                          {i.unite} · réf. {i.ref}
                          {[i.taille, i.couleur].filter(Boolean).length ? ` · ${[i.taille, i.couleur].filter(Boolean).join(", ")}` : ""}
                        </p>
                        <div className="mt-0.5"><Prix valeur={i.prix * i.qty} taille={16} /></div>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl p-1 flex-shrink-0" style={{ background: VOILE(fond, "CC"), border: `1px solid ${bordure}` }}>
                        <button onClick={() => changerQte(i.ref, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90" aria-label="Retirer">
                          <Minus size={13} color={texte} />
                        </button>
                        <span className="w-6 text-center text-[13px] font-bold" style={{ color: texte }}>{i.qty}</span>
                        <button onClick={() => changerQte(i.ref, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90" aria-label="Ajouter">
                          <Plus size={13} color={texte} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* ⚠️ LE CHOIX AVANT LES CHIFFRES. Il décide des frais et du
                      total : posé plus bas, il les ferait changer sous les yeux
                      du client après qu'il les a lus. */}
                  <ChoixReception mode={reception} choisir={setReception} sousTotal={cartTotal(panier)} />

                  {/* ⚠️ LES FRAIS D'ENVOI SE LISENT ICI, PAS APRÈS LA COMMANDE.
                      Un client qui croit payer 48 € et à qui on en réclame 60
                      annule — et il a raison. La ligne est donc écrite avant le
                      total, et le total la comprend déjà.

                      🚨 ET AUCUNE LIGNE DE PORT EN MAIN À MAIN. « Frais d'envoi :
                      offerts » sur une commande qu'on vient chercher à pied
                      parle d'un envoi qui n'existe pas. */}
                  {LIVRAISON_PRIX > 0 && reception !== "main" && (
                    <>
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[12px]" style={{ color: texteDoux, fontFamily: CORPS }}>Articles</span>
                        <span className="text-[13px]" style={{ color: texte, fontFamily: CORPS }}>{euros(cartTotal(panier))}</span>
                      </div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[12px]" style={{ color: texteDoux, fontFamily: CORPS }}>Frais d'envoi</span>
                        {fraisLivraison(cartTotal(panier), reception) > 0 ? (
                          <span className="text-[13px]" style={{ color: texte, fontFamily: CORPS }}>
                            {euros(fraisLivraison(cartTotal(panier), reception))}
                          </span>
                        ) : (
                          <span className="text-[13px] font-bold" style={{ color: vert, fontFamily: CORPS }}>OFFERTS</span>
                        )}
                      </div>
                      {/* La phrase qui fait ajouter un article de plus. */}
                      {resteAvantEnvoiOffert(cartTotal(panier), reception) > 0 && (
                        <p className="text-[11.5px] pb-1" style={{ color: jaune, fontFamily: CORPS, lineHeight: 1.5 }}>
                          Plus que <b>{euros(resteAvantEnvoiOffert(cartTotal(panier), reception))}</b> d'articles
                          et l'envoi est <b>offert</b>.
                        </p>
                      )}
                    </>
                  )}

                  <div
                    className="flex items-center justify-between py-4"
                    style={{ borderTop: LIVRAISON_PRIX > 0 ? "1px solid #232323" : "1px solid #232323" }}
                  >
                    <span className="text-[12px] uppercase tracking-wider" style={{ color: texteDoux, fontFamily: CORPS }}>Total</span>
                    <Prix valeur={totalAPayer(panier, reception)} taille={30} />
                  </div>

                  {/* Les moyens de paiement se lisent AVANT d'envoyer la
                      commande : découvrir qu'on ne peut payer qu'en espèces
                      après coup, c'est une commande annulée. */}
                  <div className="mb-3">
                    <MoyensDePaiement total={totalAPayer(panier, reception)} reference={reference} />
                  </div>

                  {/* Ce qu'il faut donner pour être livré, juste au-dessus du
                      bouton d'envoi : le dernier endroit où le client regarde
                      encore avant de partir dans sa messagerie. */}
                  <BlocLivraison mode={reception} />

                  {/* Le bouton d'envoi peut être éteint depuis l'atelier : une
                      boutique qui n'encaisse qu'en ligne n'a pas de commande à
                      recevoir dans une conversation. */}
                  {/* Sans contact renseigné, le lien mènerait dans le vide :
                      wa.me sans numéro, t.me sans pseudo. Un bouton qui ne mène
                      nulle part est pire que pas de bouton. */}
                  {BOUTIQUE.commandeActive !== false && CONTACT ? (
                    <>
                      {/* Le second geste, nommé comme tel : sans lui, le
                          vendeur reçoit un virement sans savoir quoi envoyer
                          ni où. Le numéro n'apparaît que si l'on a aussi
                          proposé de régler — seul, il n'aurait aucun sens. */}
                      {PAIEMENTS.length > 0 && (
                        <p className="text-[11px] uppercase tracking-wider mb-2 font-bold" style={{ color: jaune, fontFamily: CORPS }}>
                          2 — Envoie-nous ta commande
                        </p>
                      )}
                      <a
                        href={lienCommande(panier, reference, reception)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          /* La copie part d'abord : le clic lui-même autorise
                             le presse-papiers, un appel différé ne le ferait
                             plus. Ensuite seulement on quitte la boutique. */
                          if (!MESSAGERIE.prerempli) copierAvantDePartir(texteCommande(panier, reference, reception));
                          vibrer("succes");
                          clicLien(lienCommande(panier, reference, reception))(e);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl active:scale-95 transition-transform"
                        style={{ background: MESSAGERIE.couleur, color: MESSAGERIE.encre, fontFamily: TITRE, fontSize: 16 }}
                      >
                        <MessageCircle size={18} /> ENVOYER SUR {MESSAGERIE.nom.toUpperCase()}
                      </a>
                      {!MESSAGERIE.prerempli && (
                        <p className="text-[11.5px] text-center mt-2.5" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.5 }}>
                          {MESSAGERIE.nom} ne permet pas d'écrire le message à l'avance.
                          <br /><b style={{ color: texte }}>Ta commande est copiée</b> — colle-la dans la conversation.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[11.5px] text-center" style={{ color: texteDoux, fontFamily: CORPS, lineHeight: 1.5 }}>
                      Règle ta commande par un des moyens ci-dessus,
                      <br />en indiquant la référence <b style={{ color: jaune }}>{reference}</b>.
                    </p>
                  )}
                  <button onClick={() => setPanier([])} className="w-full text-[11px] mt-3 py-1" style={{ color: "#6B6B6B", fontFamily: CORPS }}>
                    Vider le panier
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* vidéo du produit */}
        {video && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.96)" }} onClick={() => setVideo(null)}>
            <Video source={video.video} nom={video.nom} className="max-w-full max-h-full rounded-xl" />
            <button
              onClick={() => setVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "#1A1A1ACC", border: `1px solid ${bordure}` }}
              aria-label="Fermer la vidéo"
            >
              <X size={18} color={texte} />
            </button>
            <p className="absolute bottom-5 left-0 right-0 text-center text-[12px] px-6" style={{ color: texteDoux, fontFamily: CORPS }}>
              {video.nom} — tape à côté pour fermer
            </p>
          </div>
        )}

        {/* photos, descriptif et vidéo du produit */}
        {vue && famille && (
          <Visionneuse
            produit={vue.produit}
            famille={famille}
            depart={vue.depart}
            onFermer={() => setVue(null)}
          />
        )}
      </div>
    </div>
  );
}
