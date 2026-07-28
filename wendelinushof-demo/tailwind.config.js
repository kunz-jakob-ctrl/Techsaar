/** Wendelinushof-Demo — lokaler Tailwind-Build (self-hosted, keine Fremd-Requests).
 *  Build:  npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
 *  Design: "Forest" — Tannengrün-Akzent auf Bone-Weiß, Source Serif 4 + Source Sans 3.
 *  Radius-System: Buttons = Pill, Karten/Bilder = 16 px (rounded-2xl), Inputs = 10 px. */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        bone:  '#F7F5EF',
        cream: '#EFECE1',
        sage:  '#E2E8DA',
        ink:   '#20291F',
        moss:  '#535B4B',
        pine:  '#2E5A33',
        pined: '#254A2A',
        deep:  '#1C3320',
        honey: '#A66A14',
        line:  'rgba(32,41,31,.16)',
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        input: '10px',
      },
      boxShadow: {
        soft: '0 14px 40px -18px rgba(32,41,31,.28)',
        card: '0 6px 24px -12px rgba(32,41,31,.22)',
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
  plugins: [],
}
