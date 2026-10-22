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
          { ref: "TRAFIC-9", nom: "Trafic 9 places", unite: "", prix: 80, dispo: true, annee: "2023", places: 9, portes: 5, bagages: 6, kilometrage: "Kilométrage illimité", caution: 2500, equipements: ["clim", "bluetooth", "camera", "regulateur", "radar"], forfaitWeekEnd: 150, forfaitSemaine: 450, dureeMin: 1, dureeMax: 30, battement: 1, optionsRetirees: ["Siège bébé"], image: "/produits/trafic-9-2.jpg", 
            images: ["/produits/trafic-9-2.jpg", "/produits/trafic-9.jpg", "/produits/trafic-9-3.jpg", "/produits/trafic-9-4.jpg", "/produits/trafic-9-5.jpg", "/produits/trafic-9-6.jpg", "/produits/trafic-9-7.jpg", "/produits/trafic-9-8.jpg"], 
            description: "Spacieux, confortable et polyvalent.\n\nGPS intégré · Climatisation · Bluetooth · Régulateur / limiteur · Radar de stationnement\n9 places confort · Grand espace · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 300 € · 7 jours 600 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 80 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 2 500 €, restituée au retour. Kilométrage illimité." },
        ],
      },
    ],
  },
  {
    id: "citadines",
    nom: "CITADINES",
    emoji: "🚗",
    glyphe: "citadine",
    image: "",
    video: "",
    type: "produits",
    dispo: true,
    couleurs: ["#2F6B8F", "#16303F"],
    gammes: [
      {
        id: "volkswagen",
        nom: "VOLKSWAGEN",
        etiquette: "",
        sousTitre: "",
        produits: [
          { ref: "POLO-AUTO", nom: "Polo — boîte automatique", unite: "", prix: 80, dispo: true, annee: "2025", places: 5, portes: 5, boite: "automatique", kilometrage: "300 km inclus par jour · illimité dès le week-end", caution: 2500, image: "/produits/polo-auto.jpg", 
            description: "Compacte, économique et ultra confortable. Véhicule récent.\n\nGPS intégré · Climatisation · Bluetooth · Régulateur / limiteur · Radar de stationnement · Boîte automatique\n5 places confort · Coffre spacieux · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nKILOMÉTRAGE : 300 km inclus pour une location de 24 h. Kilométrage illimité à partir du forfait week-end.\n\nFORFAITS : week-end 250 € · 7 jours 500 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 80 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 2 500 €, restituée au retour." },
        ],
      },
      {
        id: "audi",
        nom: "AUDI",
        etiquette: "",
        sousTitre: "",
        produits: [
          { ref: "A1-SPORTBACK", nom: "A1 Sportback", unite: "", prix: 90, dispo: true, annee: "2022", places: 5, portes: 5, carburant: "essence", caution: 2500, image: "/produits/a1-sportback-2.jpg", 
            images: ["/produits/a1-sportback-2.jpg", "/produits/a1-sportback.jpg"], 
            description: "Citadine compacte, finition sportive. Coffre de 335 L.\n5 places · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 350 € · 7 jours 500 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 90 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 2 500 €, restituée au retour." },
        ],
      },
    ],
  },
  {
    id: "premium",
    nom: "PREMIUM",
    emoji: "✨",
    glyphe: "berline",
    image: "",
    video: "",
    type: "produits",
    dispo: true,
    couleurs: ["#C8A041", "#6E5516"],
    gammes: [
      {
        id: "mercedes",
        nom: "MERCEDES",
        etiquette: "",
        sousTitre: "",
        produits: [
          { ref: "CLASSE-A-AMG", nom: "Classe A — AMG Line", unite: "", prix: 130, dispo: true, annee: "2025", places: 5, portes: 5, boite: "automatique", kilometrage: "300 km inclus par jour · illimité dès le week-end", caution: 3000, equipements: ["clim", "gps", "carplay", "camera", "siege"], forfaitWeekEnd: 240, remiseSemaine: 15, dureeMin: 2, cadragePos: "50% 66%", image: "/produits/classe-a-amg.jpg", 
            description: "Élégance, performance et confort. Véhicule récent, finition AMG Line.\n\nSièges confort · Climatisation automatique · GPS intégré · Régulateur de vitesse · Aide au stationnement · Connectivité smartphone\nBoîte automatique · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nKILOMÉTRAGE : 300 km inclus pour une location de 24 h. Kilométrage illimité à partir du forfait week-end.\n\nFORFAITS : week-end 370 € · 7 jours 630 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 130 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 3 000 €, restituée au retour." },
        ],
      },
      {
        id: "tesla",
        nom: "TESLA",
        etiquette: "",
        sousTitre: "",
        produits: [
          { ref: "MODEL-S", nom: "Model S", unite: "", prix: 150, dispo: true, annee: "2020", places: 5, portes: 5, boite: "automatique", carburant: "électrique", caution: 3500, image: "/produits/model-s.jpg", 
            description: "100 % électrique. Coffre arrière et coffre avant.\nBoîte automatique · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 450 € · 7 jours 750 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 150 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 3 500 €, restituée au retour." },
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
