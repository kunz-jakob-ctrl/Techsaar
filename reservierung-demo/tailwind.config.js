/* Spiegel des früheren Inline-Configs (CDN) — nach HTML-Änderungen neu bauen:
   npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        bisque:  '#F2EBE1',
        clay:    '#E3D7C6',
        line:    '#D3C4AF',
        ink:     '#211D18',
        muted:   '#8A7E6E',
        kobalt:  '#2B49C4',
        terra:   '#C05B33',
        senf:    '#D19E3F',
        celadon: '#7FA48E',
        ofen:      '#17130F',
        ofenkarte: '#211B15',
        ofenlinie: '#3A3229',
        ofentext:  '#EFE6D8',
        ofenmuted: '#9C8F7D',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans:    ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
    }
  }
};
