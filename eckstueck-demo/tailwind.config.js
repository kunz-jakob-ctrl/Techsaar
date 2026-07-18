/** Lokaler Tailwind-Build statt Play-CDN (DSGVO + "not for production").
 *  Nach HTML-Änderungen neu bauen:
 *    npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
 */
module.exports = {
  content: ['./index.html'],
  theme: { extend: {} },
  plugins: [],
};
