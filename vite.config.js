import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BOUTIQUE, COULEURS } from './src/config.js'
import { FAMILLES as AFFICHEES } from './src/catalogue.js'
import { MOTEUR } from './src/moteur.js'
import fs from 'node:fs'
import path from 'node:path'

/* 🚨 LE SOUVENIR, PAS CE QUE LA BOUTIQUE AFFICHE.

   donnees.json est le seul souvenir de la boutique : c'est lui que l'atelier
   relit pour la rouvrir. Le tirer de « catalogue.js » revenait à perdre, à
   chaque publication, les pièces masquées et les champs retirés — avec leur
   contenu. « memoire.js » porte tout, et n'est lu qu'ICI, à la fabrication :
   il n'entre jamais dans ce que le visiteur télécharge.

   ⚠️ ET IL PEUT NE PAS EXISTER. Une boutique mise en service avant lui n'en a
   pas encore ; un import ordinaire ferait échouer sa construction, et il y en a
   sept en ligne. On le demande donc en souplesse : s'il manque, on retombe sur
   le catalogue affiché — donnees.json est alors ce qu'il était hier, ni plus ni
   moins, et la première republication apporte la mémoire. */
async function souvenirDeLaBoutique() {
  try {
    const m = await import('./src/memoire.js')
    return m.FAMILLES
  } catch (e) {
    return AFFICHEES
  }
}

// Publie, à côté de la boutique, un fichier donnees.json qui contient trois
// choses : la version du moteur, l'identité, et le catalogue. L'atelier le lit
// au démarrage au lieu d'embarquer une copie figée. Il affiche donc toujours ce
// qui est réellement en ligne, et sait aussi si le moteur de cette boutique est
// en retard sur le sien.
function donneesPourAtelier() {
  return {
    name: 'donnees-pour-atelier',
    async generateBundle() {
      const FAMILLES = await souvenirDeLaBoutique()
      /* 🚨 LE TAMPON DE VERSION — 22 octobre 2026.

         L'atelier savait qu'une boutique était à jour en RECOMPARANT TOUT son
         catalogue. Ça marche (mesuré sur les huit boutiques en ligne), mais
         c'est long à écrire, fragile au premier champ ajouté, et ça ne dit
         pas DE QUEL ENVOI vient ce qu'on lit.

         Vercel pose le commit qu'il construit dans l'air ambiant. On l'écrit
         ici : la vérification n'a plus qu'à le comparer au commit qu'on vient
         d'envoyer. Un seul mot, sans ambiguïté.

         ⚠️ IL PEUT ÊTRE VIDE, et ce n'est pas une panne : une construction à
         la main sur le PC n'a pas de commit. L'atelier retombe alors sur la
         comparaison du contenu — elle n'a pas disparu, elle est devenue le
         filet. C'est elle qui couvre les boutiques encore sur l'ancien
         moteur, et elles sont sept. */
      const PUBLIE = {
        commit: String(process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 40),
        le: new Date().toISOString(),
      }
      this.emitFile({
        type: 'asset',
        fileName: 'donnees.json',
        source: JSON.stringify({ MOTEUR, PUBLIE, BOUTIQUE, COULEURS, FAMILLES }, null, 2),
      })
    },
  }
}

/* ═══════ LA BOUTIQUE S'INSTALLE SUR LE TÉLÉPHONE DU CLIENT ═══════

   Demandé ainsi : « fais en sorte que les boutiques soient téléchargeables
   comme des applications pour rester sur le téléphone du client ».

   Ce n'est pas une application à télécharger dans un magasin : c'est la page
   elle-même que le téléphone accepte de poser sur l'écran d'accueil, avec le
   logo de la boutique, et qui s'ouvre ensuite EN PLEIN ÉCRAN — sans barre
   d'adresse, sans onglets. Gratuit, sans compte développeur, sans validation.

   🚨 TOUT EST CONSTRUIT ICI, À LA FABRICATION, ET NON ÉCRIT DANS index.html.

   index.html est un fichier du MOTEUR : il n'est réécrit que lorsqu'on met à
   jour une boutique. Le nom, les couleurs et le logo, eux, vivent dans
   config.js et changent quand le vendeur le décide. Les poser dans index.html
   voudrait dire qu'une boutique renommée garde l'ancien nom sur l'écran
   d'accueil de ses clients jusqu'à la prochaine mise à jour du moteur — sans
   que personne comprenne pourquoi.

   Lus ici, ils sont justes à chaque fabrication, et une simple republication
   suffit à les corriger. */
function installationSurLeTelephone() {
  const nom = String(BOUTIQUE.nom || 'Boutique').trim() || 'Boutique'
  const fond = COULEURS.fond || '#0B0B0F'
  const logo = String(BOUTIQUE.logo || '').trim()

  /* La boutique est-elle claire ? La même mesure que dans commun.jsx : on
     pèse la couleur de fond. Une boutique claire doit annoncer « light »,
     sinon on remplacerait un éclair blanc par un éclair noir. */
  const clarte = (hex) => {
    const h = String(hex || '').replace('#', '')
    if (h.length < 6) return 0
    const r = parseInt(h.slice(0, 2), 16) / 255
    const v = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
    return 0.299 * r + 0.587 * v + 0.114 * b
  }
  const clair = clarte(fond) > 0.5

  /* Le type se déduit de l'extension. Se tromper ne fait pas d'erreur visible :
     le téléphone ignore simplement l'icône et pose une lettre à la place. */
  const type = /\.png$/i.test(logo)
    ? 'image/png'
    : /\.webp$/i.test(logo)
      ? 'image/webp'
      : 'image/jpeg'

  /* 🚨 UNE BOUTIQUE SANS LOGO N'ETAIT PAS INSTALLABLE DU TOUT.

     Sans fichier de logo, la liste d'icones du manifeste restait vide — et
     sans icone, le telephone REFUSE d'installer. Constate sur Amira Luxury :
     manifeste correct, balises correctes, et aucune proposition d'installation
     nulle part, sans le moindre message d'erreur.

     On dessine donc une icone de secours : le fond de la boutique, et son
     emoji — ou l'initiale de son nom. Un SVG, parce qu'il se fabrique avec du
     texte, sans bibliotheque d'images, et qu'il reste net a toutes les
     tailles.

     Le vrai logo reste meilleur, et il gagne des qu'il existe. */
  /* La première lettre du nom, sans expression régulière : les échappements
     Unicode (\p{L}) traversent mal les outils qui écrivent ce fichier, et un
     « \ » perdu en route donne une expression invalide qui ne casse rien ici
     mais fait échouer la CONSTRUCTION de la boutique. C'est arrivé. */
  const initiale = ((nom.trim()[0] || '?')).toUpperCase()
  const dessus = COULEURS.texte || '#FFFFFF'
  const signe = String(BOUTIQUE.emoji || '').trim() || initiale
  const iconeDeSecours = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
    `<rect width="512" height="512" fill="${fond}"/>`,
    `<text x="256" y="256" fill="${dessus}" font-size="250" text-anchor="middle"`,
    ' dominant-baseline="central"',
    ' font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">',
    signe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    '</text></svg>',
  ].join('')

  /* L'ICÔNE RONDE, FABRIQUÉE À PARTIR DU LOGO.

     Rend le SVG, ou null si le fichier n'est pas lisible — auquel cas on
     garde le comportement d'avant : le logo brut dans le manifeste. On ne
     casse pas une installation qui marche pour une icône plus jolie. */
  const iconeRonde = () => {
    if (!logo) return null
    /* Le chemin déclaré est celui du site (« /produits/logo.jpg ») ; sur le
       disque, ces fichiers vivent dans « public ». */
    const chemin = path.join(process.cwd(), 'public', logo.replace(/^\/+/, ''))
    let octets
    try {
      octets = fs.readFileSync(chemin)
    } catch (e) {
      return null
    }
    /* 🚨 UN PLAFOND, ET IL EST VOULU. L'icône part sur le téléphone à
       l'installation. Au-delà de 400 Ko de logo, le base64 en ferait plus de
       530 Ko : on garde alors le fichier brut, carré mais léger. */
    if (octets.length > 400 * 1024) return null
    const dedans = `data:${type};base64,${octets.toString('base64')}`
    /* 12 px de marge : sans elle, le bord du logo touche le bord du rond et
       le découpage se voit comme une coupure plutôt qu'une forme. */
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
      '<defs><clipPath id="rond"><circle cx="256" cy="256" r="244"/></clipPath></defs>',
      `<rect width="512" height="512" fill="${fond}"/>`,
      `<image href="${dedans}" x="12" y="12" width="488" height="488"`,
      ' preserveAspectRatio="xMidYMid slice" clip-path="url(#rond)"/>',
      /* 🚨 PAS D'ANNEAU ICI, ET C'EST UNE DÉCISION.

         Il y en a eu un, le temps d'une heure : il imitait le médaillon du
         sceau pour que l'écran de lancement d'Android se confonde avec la
         première image de l'animation.

         « Tu ne vas pas t'amuser à superposer l'image sur d'autres
         ouvertures. » C'est juste : ça ne marchait que pour le sceau. Les
         ouvertures suivantes ne commencent pas par un logo rond, et il
         faudrait refaire coïncider l'image à chaque fois.

         L'icône reste donc NEUTRE : le logo, rond, sur le fond de la
         boutique. Elle va avec n'importe quelle ouverture, et elle règle ce
         qui était vraiment en cause — un JPEG carré à fond gris #202020
         posé sur un écran de lancement noir. */
      '</svg>',
    ].join('')
  }

  const ronde = iconeRonde()

  return {
    name: 'installation-sur-le-telephone',

    generateBundle() {
      if (!logo) {
        this.emitFile({ type: 'asset', fileName: 'icone-boutique.svg', source: iconeDeSecours })
      } else if (ronde) {
        this.emitFile({ type: 'asset', fileName: 'icone-boutique.svg', source: ronde })
      }
      this.emitFile({
        type: 'asset',
        fileName: 'manifeste.webmanifest',
        source: JSON.stringify(
          {
            name: nom,
            /* Le nom sous l'icône, sur l'écran d'accueil. Au-delà d'une
               douzaine de caractères le téléphone le coupe lui-même, et il le
               coupe moins bien que nous. */
            short_name: nom.length > 12 ? nom.slice(0, 12).trim() : nom,
            description: String(BOUTIQUE.sousTitre || '').trim(),
            lang: 'fr',
            start_url: './',
            scope: './',
            display: 'standalone',
            orientation: 'portrait',
            /* La couleur vue pendant la demi-seconde de lancement, avant que la
               page s'affiche. Celle du fond de la boutique : sinon un éclair
               blanc à chaque ouverture. */
            background_color: fond,
            theme_color: fond,
            /* « any » plutôt qu'une taille écrite : le logo d'une boutique est
               carré et fait au plus 400 px, mais une image plus petite déposée
               telle quelle donnerait un carré plus petit. Annoncer « 400x400 »
               sur une image de 180 px la ferait rejeter en silence. */
            /* 🚨 L'ICÔNE RONDE PASSE DEVANT LE LOGO BRUT, et c'est l'écran de
               lancement qui l'exige. Android pose l'icône déclarée sur
               « background_color » avant que notre code ne tourne : un JPEG
               carré au fond gris posé sur du noir donne un carré gris, vu et
               mesuré sur Mapuche Arts (#202020 sur #030303).

               « maskable » en plus de « any » : le téléphone peut alors la
               rogner à sa guise — ronde, en goutte, en écusson selon la
               marque — sans manger le logo, puisqu'il est déjà au centre
               avec de la marge autour. */
            icons: ronde
              ? [{ src: 'icone-boutique.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
              : logo
                ? [{ src: logo, sizes: 'any', type, purpose: 'any' }]
                : [{ src: 'icone-boutique.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
          },
          null,
          2,
        ),
      })
    },

    /* Les balises que le manifeste ne porte pas : iPhone n'en lit aucune et
       veut les siennes, et « theme-color » teinte la barre du système. */
    transformIndexHtml() {
      const balises = [
        { tag: 'link', attrs: { rel: 'manifest', href: 'manifeste.webmanifest' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'theme-color', content: fond }, injectTo: 'head' },
        /* 🚨 L'ÉCLAIR BLANC DU PREMIER INSTANT.

           « Il y a une micro-seconde au début du lancement de la boutique
           d'un écran blanc, pour les deux ouvertures créées. »

           Le navigateur peint SA TOILE en blanc avant d'avoir lu la moindre
           règle de style. Le fond de la boutique, lui, vit dans un fichier
           CSS qui arrive un instant plus tard. « color-scheme » est la seule
           chose qui agit AVANT : elle dit au navigateur de quelle couleur
           peindre en attendant.

           Le style en clair juste après pose le fond pour de bon, sans
           attendre le fichier — deux lignes, et aucune requête de plus. */
        { tag: 'meta', attrs: { name: 'color-scheme', content: clair ? 'light' : 'dark' }, injectTo: 'head' },
        {
          tag: 'style',
          children: `html,body{background:${fond};margin:0}`,
          injectTo: 'head',
        },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' }, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
          injectTo: 'head',
        },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: nom }, injectTo: 'head' },
      ]
      /* 🚨 SANS LOGO, AUCUNE BALISE D'ICÔNE. Un href vide ne vaut pas « pas
         d'icône » : il désigne la PAGE elle-même, que le téléphone essaie
         alors de lire comme une image. */
      if (logo) {
        balises.push({ tag: 'link', attrs: { rel: 'apple-touch-icon', href: logo }, injectTo: 'head' })
        /* 🚨 L ICONE DE LA PAGE : LA RONDE, PAS LE FICHIER BRUT.

           Telegram, et les applications qui ouvrent un lien dans leur propre
           fenetre, affichent cette icone sur fond sombre PENDANT QU ILS
           CHARGENT la page — avant que notre code ne tourne. Avec le fichier
           brut, un logo JPEG carre a fond gris, ca donne un carre gris sur du
           noir : signale trois fois, capture a l appui, depuis l ecran d
           accueil comme depuis un lien Telegram.

           La ronde est posee sur le fond de la boutique : il n y a plus de
           carre a voir, quel que soit celui qui l affiche.

           ⚠️ « apple-touch-icon » garde le fichier brut juste en dessous :
           Safari refuse le SVG pour l ecran d accueil, et une icone refusee
           vaut moins qu une icone carree. */
        balises.push(ronde
          ? { tag: 'link', attrs: { rel: 'icon', href: 'icone-boutique.svg', type: 'image/svg+xml' }, injectTo: 'head' }
          : { tag: 'link', attrs: { rel: 'icon', href: logo, type }, injectTo: 'head' })
      } else {
        /* iPhone ne lit pas le manifeste et ignore le SVG pour l'ecran
           d'accueil : sans logo il prendra une capture de la page. C'est moins
           beau qu'une icone, et c'est toujours mieux que rien. L'onglet du
           navigateur, lui, accepte le SVG. */
        balises.push({ tag: 'link', attrs: { rel: 'icon', href: 'icone-boutique.svg', type: 'image/svg+xml' }, injectTo: 'head' })
      }
      return balises
    },
  }
}

export default defineConfig({
  plugins: [react(), donneesPourAtelier(), installationSurLeTelephone()],
})
