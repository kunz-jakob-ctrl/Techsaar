/** TechSaar — lokaler Tailwind-Build (ersetzt das Play-CDN, DSGVO: keine Fremd-Requests).
 *  Build:  npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
 *  Farben/Fonts identisch zur früheren Inline-Config in index.html. */
module.exports = {
  content: ['./index.html', './impressum.html', './datenschutz.html'],
  theme: {
    extend: {
      colors: {
        void:   '#050507',
        night:  '#0F0F14',
        panel:  '#15151C',
        paper:  '#F4F3EF',
        ink:    '#F2F1F7',
        inkd:   '#141419',
        muted:  '#9897A5',
        mutedl: '#6E6D66',
        line:   'rgba(255,255,255,.10)',
        linel:  'rgba(20,20,25,.14)',
        lilac:  '#8B7CF6',
        lavend: '#C4B5FD',
        wash:   'rgba(139,124,246,.10)',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        brand: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
