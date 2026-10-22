/* Vite passe le CSS par PostCSS, et PostCSS appelle Tailwind. C'est tout ce
   qu'il y a à savoir : ce fichier est le branchement, pas un réglage. */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
