/* Le CSS de la boutique, fabrique a la construction et servi par elle.
   Avant, il etait fabrique dans le telephone de chaque visiteur par un
   programme telecharge chez un tiers. Voir tailwind.config.js. */
import './tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppLocation from './App-location.jsx'
import Fermee from './ferme.jsx'
import { BOUTIQUE } from './config.js'
import { EST_LOCATION, APERCU } from './commun.jsx'
import { compterLaVisite, compterLesInstallations } from './visites.js'
import { installerLeJournal } from './journal.js'

/* 🚨 LA BOUTIQUE FERMÉE NE SE CONSTRUIT PAS.
   ─────────────────────────────────────────
   La décision est prise ICI, avant tout le reste. Un bandeau « fermé »
   posé par-dessus la boutique laisserait le catalogue, le panier et le
   bouton de commande vivre dessous : il suffirait d'une ligne de style
   retirée dans le navigateur pour commander comme avant.

   Ici, App n'est jamais appelé. Il n'y a rien derrière la page fermée —
   ni panier, ni prix, ni chemin vers la messagerie du vendeur.

   « active » est absent des boutiques faites avant cette version : elles
   sont donc ouvertes, et c'est la bonne réponse. Seul un « false » écrit
   exprès par l'atelier ferme une boutique. */
/* 🚨 LE JOURNAL DES ERREURS SE POSE EN PREMIER.
   Une erreur survenue avant la pose n est entendue par personne — et c est
   au demarrage que les pires arrivent : un ecran blanc chez la cliente
   d une vendeuse, et aucune trace nulle part. */
installerLeJournal()

const OUVERTE = BOUTIQUE.active !== false

/* DEUX MOTEURS, ET LE CHOIX SE FAIT ICI.
   ─────────────────────────────────────
   Une boutique de location et une boutique de vente n'ont presque rien en
   commun : des dates et une caution d'un côté, un panier et des tailles de
   l'autre. Elles ont donc chacune leur moteur, et c'est cette ligne — une
   seule — qui décide lequel se construit.

   Pourquoi ici, et pas à l'intérieur de App.jsx : parce qu'un aiguillage
   intérieur voudrait dire que le code de la vente est chargé, lu et exécuté
   pour une boutique de location, et l'inverse. Les deux se mélangeraient
   lentement, par petites commodités, jusqu'à ne plus pouvoir être séparés.

   « EST_LOCATION » vient du socle et non de config.js directement : le socle
   tient compte de l'aperçu de l'atelier, ce qui permet de voir un brouillon
   de boutique de location avant de la publier. */
/* LE COMPTEUR DE VISITES, AVANT L AFFICHAGE ET SANS LE RETARDER.
   L appel part et on l oublie : aucun await, aucune attente. Si le reseau
   est coupe ou si la base ne repond pas, la boutique s ouvre exactement
   pareil et le compteur se tait. Un apercu n est jamais compte. */
compterLaVisite(APERCU)

/* L installation se signale quand elle arrive, pas au chargement : on s abonne
   ici une fois pour toutes. Jamais en apercu — un essai du vendeur ne doit pas
   gonfler le compteur de sa propre boutique. */
if (!APERCU) compterLesInstallations()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {!OUVERTE ? <Fermee /> : EST_LOCATION ? <AppLocation /> : <App />}
  </React.StrictMode>,
)
