// LA MÉMOIRE DE LA BOUTIQUE
// -------------------------
// Tout ce que l'atelier sait d'elle, y compris ce qu'elle ne montre pas :
// les pièces masquées, et les champs retirés avec leur contenu.
//
// 🚨 CE FICHIER N'EST LU QU'À LA FABRICATION, par vite.config.js, pour écrire
// donnees.json. Aucun fichier du navigateur ne l'importe : il n'est donc pas
// envoyé aux visiteurs. C'est ce qui permet à l'atelier de rouvrir la boutique
// exactement comme il l'a laissée, sans rien montrer de plus au client.
//
// Fichier produit par l'atelier : easy-lease-test

export const FAMILLES = [
  {
    "id": "utilitaires",
    "nom": "UTILITAIRES",
    "emoji": "🚐",
    "glyphe": "utilitaire",
    "image": "",
    "video": "",
    "type": "produits",
    "dispo": true,
    "masque": false,
    "remise": 0,
    "couleurs": [
      "#4A5160",
      "#232833"
    ],
    "gammes": [
      {
        "id": "renault",
        "nom": "RENAULT",
        "etiquette": "",
        "sousTitre": "",
        "masque": false,
        "remise": 0,
        "produits": [
          {
            "ref": "TRAFIC-9",
            "nom": "Trafic 9 places",
            "unite": "",
            "prix": 80,
            "remise": 0,
            "prixPromo": 0,
            "tailles": "",
            "couleurs": "",
            "taillesEpuisees": "",
            "dispo": true,
            "chef": false,
            "vedette": false,
            "nouveaute": false,
            "etat": "",
            "dateEtat": "",
            "masque": false,
            "sansTailles": false,
            "sansCouleurs": false,
            "sansPromo": false,
            "cadrage": "",
            "cadragePos": "50% 50%",
            "cadrageZoom": 1,
            "image": "/produits/trafic-9-2.jpg",
            "images": [
              "/produits/trafic-9-2.jpg",
              "/produits/trafic-9.jpg",
              "/produits/trafic-9-3.jpg",
              "/produits/trafic-9-4.jpg",
              "/produits/trafic-9-5.jpg",
              "/produits/trafic-9-6.jpg",
              "/produits/trafic-9-7.jpg",
              "/produits/trafic-9-8.jpg"
            ],
            "video": "",
            "description": "Spacieux, confortable et polyvalent.\n\nGPS intégré · Climatisation · Bluetooth · Régulateur / limiteur · Radar de stationnement\n9 places confort · Grand espace · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 300 € · 7 jours 600 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 80 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 2 500 €, restituée au retour. Kilométrage illimité.",
            "annee": "2023",
            "places": 9,
            "portes": 5,
            "bagages": 6,
            "boite": "",
            "carburant": "",
            "kilometrage": "Kilométrage illimité",
            "caution": 2500,
            "periodes": [],
            "marque": "",
            "modele": "",
            "immatriculation": "",
            "couleur": "",
            "equipements": [
              "clim",
              "bluetooth",
              "camera",
              "regulateur",
              "radar"
            ],
            "equipementsAutre": "",
            "forfaitWeekEnd": 150,
            "forfaitSemaine": 450,
            "remiseSemaine": 0,
            "forfaitMois": 0,
            "moisSurDevis": false,
            "kmSupp": 0,
            "dureeMin": 1,
            "dureeMax": 30,
            "battement": 1,
            "optionsRetirees": [
              "Siège bébé"
            ],
            "options": [],
            "controleTechnique": "",
            "finAssurance": ""
          }
        ]
      }
    ]
  },
  {
    "id": "citadines",
    "nom": "CITADINES",
    "emoji": "🚗",
    "glyphe": "citadine",
    "image": "",
    "video": "",
    "type": "produits",
    "dispo": true,
    "masque": false,
    "remise": 0,
    "couleurs": [
      "#2F6B8F",
      "#16303F"
    ],
    "gammes": [
      {
        "id": "volkswagen",
        "nom": "VOLKSWAGEN",
        "etiquette": "",
        "sousTitre": "",
        "masque": false,
        "remise": 0,
        "produits": [
          {
            "ref": "POLO-AUTO",
            "nom": "Polo — boîte automatique",
            "unite": "",
            "prix": 80,
            "remise": 0,
            "prixPromo": 0,
            "tailles": "",
            "couleurs": "",
            "taillesEpuisees": "",
            "dispo": true,
            "chef": false,
            "vedette": false,
            "nouveaute": false,
            "etat": "",
            "dateEtat": "",
            "masque": false,
            "sansTailles": false,
            "sansCouleurs": false,
            "sansPromo": false,
            "cadrage": "",
            "cadragePos": "50% 50%",
            "cadrageZoom": 1,
            "image": "/produits/polo-auto.jpg",
            "images": [
              "/produits/polo-auto.jpg"
            ],
            "video": "",
            "description": "Compacte, économique et ultra confortable. Véhicule récent.\n\nGPS intégré · Climatisation · Bluetooth · Régulateur / limiteur · Radar de stationnement · Boîte automatique\n5 places confort · Coffre spacieux · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nKILOMÉTRAGE : 300 km inclus pour une location de 24 h. Kilométrage illimité à partir du forfait week-end.\n\nFORFAITS : week-end 250 € · 7 jours 500 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 80 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 2 500 €, restituée au retour.",
            "annee": "2025",
            "places": 5,
            "portes": 5,
            "bagages": 0,
            "boite": "automatique",
            "carburant": "",
            "kilometrage": "300 km inclus par jour · illimité dès le week-end",
            "caution": 2500,
            "periodes": []
          }
        ]
      },
      {
        "id": "audi",
        "nom": "AUDI",
        "etiquette": "",
        "sousTitre": "",
        "masque": false,
        "remise": 0,
        "produits": [
          {
            "ref": "A1-SPORTBACK",
            "nom": "A1 Sportback",
            "unite": "",
            "prix": 90,
            "remise": 0,
            "prixPromo": 0,
            "tailles": "",
            "couleurs": "",
            "taillesEpuisees": "",
            "dispo": true,
            "chef": false,
            "vedette": false,
            "nouveaute": false,
            "etat": "",
            "dateEtat": "",
            "masque": false,
            "sansTailles": false,
            "sansCouleurs": false,
            "sansPromo": false,
            "cadrage": "",
            "cadragePos": "50% 50%",
            "cadrageZoom": 1,
            "image": "/produits/a1-sportback-2.jpg",
            "images": [
              "/produits/a1-sportback-2.jpg",
              "/produits/a1-sportback.jpg"
            ],
            "video": "",
            "description": "Citadine compacte, finition sportive. Coffre de 335 L.\n5 places · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 350 € · 7 jours 500 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 90 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 2 500 €, restituée au retour.",
            "annee": "2022",
            "places": 5,
            "portes": 5,
            "bagages": 0,
            "boite": "",
            "carburant": "essence",
            "kilometrage": "",
            "caution": 2500,
            "periodes": []
          }
        ]
      }
    ]
  },
  {
    "id": "premium",
    "nom": "PREMIUM",
    "emoji": "✨",
    "glyphe": "berline",
    "image": "",
    "video": "",
    "type": "produits",
    "dispo": true,
    "masque": false,
    "remise": 0,
    "couleurs": [
      "#C8A041",
      "#6E5516"
    ],
    "gammes": [
      {
        "id": "mercedes",
        "nom": "MERCEDES",
        "etiquette": "",
        "sousTitre": "",
        "masque": false,
        "remise": 0,
        "produits": [
          {
            "ref": "CLASSE-A-AMG",
            "nom": "Classe A — AMG Line",
            "unite": "",
            "prix": 130,
            "remise": 0,
            "prixPromo": 0,
            "tailles": "",
            "couleurs": "",
            "taillesEpuisees": "",
            "dispo": true,
            "chef": false,
            "vedette": false,
            "nouveaute": false,
            "etat": "",
            "dateEtat": "",
            "masque": false,
            "sansTailles": false,
            "sansCouleurs": false,
            "sansPromo": false,
            "cadrage": "",
            "cadragePos": "50% 66%",
            "cadrageZoom": 1,
            "image": "/produits/classe-a-amg.jpg",
            "images": [
              "/produits/classe-a-amg.jpg"
            ],
            "video": "",
            "description": "Élégance, performance et confort. Véhicule récent, finition AMG Line.\n\nSièges confort · Climatisation automatique · GPS intégré · Régulateur de vitesse · Aide au stationnement · Connectivité smartphone\nBoîte automatique · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nKILOMÉTRAGE : 300 km inclus pour une location de 24 h. Kilométrage illimité à partir du forfait week-end.\n\nFORFAITS : week-end 370 € · 7 jours 630 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 130 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 3 000 €, restituée au retour.",
            "annee": "2025",
            "places": 5,
            "portes": 5,
            "bagages": 0,
            "boite": "automatique",
            "carburant": "",
            "kilometrage": "300 km inclus par jour · illimité dès le week-end",
            "caution": 3000,
            "periodes": [],
            "marque": "",
            "modele": "",
            "immatriculation": "",
            "couleur": "",
            "equipements": [
              "clim",
              "gps",
              "carplay",
              "camera",
              "siege"
            ],
            "equipementsAutre": "",
            "forfaitWeekEnd": 240,
            "forfaitSemaine": 0,
            "remiseSemaine": 15,
            "forfaitMois": 0,
            "moisSurDevis": false,
            "kmSupp": 0,
            "dureeMin": 2,
            "dureeMax": 0,
            "battement": 0,
            "optionsRetirees": [],
            "options": [],
            "controleTechnique": "",
            "finAssurance": ""
          }
        ]
      },
      {
        "id": "tesla",
        "nom": "TESLA",
        "etiquette": "",
        "sousTitre": "",
        "masque": false,
        "remise": 0,
        "produits": [
          {
            "ref": "MODEL-S",
            "nom": "Model S",
            "unite": "",
            "prix": 150,
            "remise": 0,
            "prixPromo": 0,
            "tailles": "",
            "couleurs": "",
            "taillesEpuisees": "",
            "dispo": true,
            "chef": false,
            "vedette": false,
            "nouveaute": false,
            "etat": "",
            "dateEtat": "",
            "masque": false,
            "sansTailles": false,
            "sansCouleurs": false,
            "sansPromo": false,
            "cadrage": "",
            "cadragePos": "50% 50%",
            "cadrageZoom": 1,
            "image": "/produits/model-s.jpg",
            "images": [
              "/produits/model-s.jpg"
            ],
            "video": "",
            "description": "100 % électrique. Coffre arrière et coffre avant.\nBoîte automatique · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 450 € · 7 jours 750 € · 1 mois sur devis.\nLe calendrier calcule au tarif journalier de 150 €. Pour un forfait, indique-le dans ton message — il remplace le calcul à la journée.\n\nCaution 3 500 €, restituée au retour.",
            "annee": "2020",
            "places": 5,
            "portes": 5,
            "bagages": 0,
            "boite": "automatique",
            "carburant": "électrique",
            "kilometrage": "",
            "caution": 3500,
            "periodes": []
          }
        ]
      }
    ]
  }
]
