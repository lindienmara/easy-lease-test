// LA BOUTIQUE FERMÉE
// ------------------
// Ce qui s'affiche à la place de TOUT le reste quand la boutique est
// désactivée. Pas un bandeau par-dessus le catalogue : le catalogue n'est
// jamais construit, le panier n'existe pas, et aucun chemin ne mène à la
// messagerie du vendeur.
//
// ⚠️ CE FICHIER NE DÉPEND DE RIEN D'AUTRE QUE DE config.js. C'est voulu : il
// doit pouvoir s'afficher même le jour où une autre partie du moteur est
// cassée. Il n'importe ni commun.jsx, ni les icônes, ni le catalogue.
//
// La décision, elle, est prise dans main.jsx — avant même que l'application
// soit construite.

import React from "react";
import { BOUTIQUE, COULEURS } from "./config.js";

export default function Fermee() {
  const fond = COULEURS.fond || "#0B0B0F";
  const carte = COULEURS.fondCarte || "#17161E";
  const bordure = COULEURS.bordure || "#2C2A38";
  const texte = COULEURS.texte || "#FFFFFF";
  const doux = COULEURS.texteDoux || "#A9A4B8";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: fond,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: carte,
          border: `1px solid ${bordure}`,
          borderRadius: 18,
          padding: "30px 22px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, lineHeight: 1 }}>🔒</div>

        <h1
          style={{
            margin: "16px 0 0",
            fontSize: 20,
            fontWeight: 800,
            color: texte,
            letterSpacing: ".5px",
          }}
        >
          Boutique fermée
        </h1>

        {BOUTIQUE.nom ? (
          <p style={{ margin: "6px 0 0", fontSize: 14, color: doux }}>{BOUTIQUE.nom}</p>
        ) : null}

        <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.6, color: doux }}>
          Cette boutique est momentanément désactivée. Les commandes ne sont pas
          possibles pour l'instant.
        </p>

        <p style={{ margin: "14px 0 0", fontSize: 12.5, lineHeight: 1.6, color: doux, opacity: 0.75 }}>
          Si tu es le propriétaire de cette boutique, contacte l'administrateur
          pour la remettre en service.
        </p>
      </div>
    </div>
  );
}
