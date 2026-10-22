// CATALOGUE — TROIS NIVEAUX
// -------------------------
// FAMILLE  →  GAMME  →  PRODUIT
// Fichier produit par l'atelier : easy-lease-test

export const FAMILLES = [
  {
    id: "utilitaires",
    nom: "UTILITAIRES",
    emoji: "🚐",
    glyphe: "utilitaire",
    image: "",
    video: "",
    type: "produits",
    dispo: true,
    couleurs: ["#4A5160", "#232833"],
    gammes: [
      {
        id: "renault",
        nom: "RENAULT",
        etiquette: "",
        sousTitre: "",
        produits: [
          { ref: "TRAFIC-9", nom: "Trafic 9 places", unite: "", prix: 80, dispo: true, annee: "2023", places: 9, portes: 5, bagages: 6, kilometrage: "Kilométrage illimité", caution: 2500, equipements: ["clim", "gps", "bluetooth", "camera", "regulateur", "radar"], forfaitWeekEnd: 300, forfaitSemaine: 600, moisSurDevis: true, dureeMin: 1, dureeMax: 30, battement: 1, image: "/produits/trafic-9-2.jpg", 
            images: ["/produits/trafic-9-2.jpg", "/produits/trafic-9.jpg", "/produits/trafic-9-3.jpg", "/produits/trafic-9-4.jpg", "/produits/trafic-9-5.jpg", "/produits/trafic-9-6.jpg", "/produits/trafic-9-7.jpg", "/produits/trafic-9-8.jpg"], 
            description: "Spacieux, confortable et polyvalent.\n\nGPS intégré · Climatisation · Bluetooth · Régulateur / limiteur · Radar de stationnement\n9 places confort · Grand espace · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 300 € · 7 jours 600 € · 1 mois sur devis.\nLe calendrier applique le forfait tout seul : choisissez vos dates, le meilleur prix s'affiche.\n\nCaution 2 500 €, restituée au retour. Kilométrage illimité." },
        ],
      },
    ],
  },
];

// Le filet de sécurité. L'atelier n'écrit jamais ici ce qui est masqué ; ces
// trois lignes servent à une seule chose : qu'un « masque: true » ajouté à la
// main dans ce fichier soit respecté, sans rien republier.
const visible = (x) => !x.masque;

// Raccourcis pratiques, calculés une fois au démarrage.
export const TOUS_PRODUITS = FAMILLES.filter(visible).flatMap((f) =>
  f.gammes.filter(visible).flatMap((g) =>
    g.produits.filter(visible).map((p) => ({ ...p, famille: f, gamme: g })))
);

export const SELECTION_CHEF = TOUS_PRODUITS.filter((p) => p.chef);
