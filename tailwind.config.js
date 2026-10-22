/* CE QUE TAILWIND DOIT LIRE POUR FABRIQUER LE CSS DE LA BOUTIQUE
   ═════════════════════════════════════════════════════════════

   Jusqu'au 14 octobre 2026, la boutique n'avait pas son CSS : elle le DEMANDAIT
   à chaque visite, à cdn.tailwindcss.com, qui envoyait un programme chargé de
   le fabriquer dans le téléphone du client.

   🚨 CE QUE ÇA DONNAIT QUAND LE CDN NE RÉPONDAIT PAS, MESURÉ SUR UNE COPIE :

       hauteur de la page      1 961 px  →  6 390 px
       largeur du contenu        375 px  →    416 px (ça débordait)
       les blocs en ligne         flex   →    block  (tout s'empilait)

   Plus de mise en page du tout : le logo en énorme, les photos les unes sous
   les autres, et la page qui dépasse sur le côté. Pour TOUTES les boutiques en
   même temps, sans que personne puisse rien y faire — ce service n'est ni chez
   nous, ni sur GitHub, ni sur Vercel.

   Le CSS est donc fabriqué ICI, une fois, au moment de construire la boutique.
   Elle sert ensuite son propre fichier, comme elle sert ses photos.

   ⚠️ TAILWIND 3, ET PAS 4. Le CDN servait du Tailwind 3 : c'est lui qui a
   produit l'apparence actuelle de toutes les boutiques. La version 4 a changé
   sa façon de nommer et de calculer — elle rendrait un résultat légèrement
   différent, sur sept boutiques en service, pour aucun gain.

   🚨 ET VOICI LE SEUL VRAI PIÈGE DE CETTE OPÉRATION.
   ─────────────────────────────────────────────────
   Tailwind ne devine pas les classes : il LIT les fichiers listés dans
   « content » et ne garde que les classes qu'il y trouve, écrites en toutes
   lettres. Une classe fabriquée à la volée — `px-${n}` — serait introuvable, et
   disparaîtrait de la boutique sans aucune erreur, nulle part.

   Vérifié avant de toucher à quoi que ce soit : le moteur n'en fabrique aucune.
   Les trois endroits qui assemblent un nom de classe le font à partir de textes
   écrits en clair (« rounded-2xl », « px-4 », « pb-3.5 »), et les deux classes
   vraiment dynamiques — atelier-glisse-* et atelier-carte — sont les nôtres,
   définies dans le style du moteur, pas dans Tailwind.

   Si un jour quelqu'un écrit `text-${couleur}-500`, ça ne marchera pas, et rien
   ne le dira. La règle tient en une phrase : une classe Tailwind s'écrit en
   entier dans le code, toujours.
*/
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
