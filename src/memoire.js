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
            "description": "Spacieux, confortable et polyvalent.\n\nGPS intégré · Climatisation · Bluetooth · Régulateur / limiteur · Radar de stationnement\n9 places confort · Grand espace · Véhicule entretenu · Service client 7j/7\n\nDisponible sur le bassin grenoblois.\n\nFORFAITS : week-end 300 € · 7 jours 600 € · 1 mois sur devis.\nLe calendrier applique le forfait tout seul : choisissez vos dates, le meilleur prix s'affiche.\n\nCaution 2 500 €, restituée au retour. Kilométrage illimité.",
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
              "gps",
              "bluetooth",
              "camera",
              "regulateur",
              "radar"
            ],
            "equipementsAutre": "",
            "forfaitWeekEnd": 300,
            "forfaitSemaine": 600,
            "remiseSemaine": 0,
            "forfaitMois": 0,
            "moisSurDevis": true,
            "kmSupp": 0,
            "dureeMin": 1,
            "dureeMax": 30,
            "battement": 1,
            "optionsRetirees": [],
            "options": [],
            "controleTechnique": "",
            "finAssurance": ""
          }
        ]
      }
    ]
  }
]
