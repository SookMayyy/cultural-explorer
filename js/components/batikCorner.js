// js/components/batikCorner.js
// Renders the traditional Malaysian batik ornament corners

const BatikCorner = {
    svgPath: `
      <path d="M0 0 Q45 0 70 28 Q95 55 110 0Z" fill="#1B5E9C"/>
      <path d="M0 0 Q26 0 44 18 Q62 36 80 8 Q98-8 110 0" fill="#C0392B" stroke="#F0B429" stroke-width="2.5"/>
      <circle cx="17" cy="17" r="7" fill="#F0B429"/>
      <circle cx="52" cy="10" r="4" fill="#F0B429"/>
      <path d="M0 28 Q18 18 30 36 Q42 54 16 58 Q0 62 0 44Z" fill="#27AE60"/>
      <circle cx="9" cy="48" r="3" fill="#F0B429"/>
      <path d="M30 0 Q45 14 36 34 Q27 54 6 60" fill="none" stroke="#E74C3C" stroke-width="2"/>`,
  
    render() {
      const corners = ['tl', 'tr', 'bl', 'br'];
      return corners.map(pos => `
        <svg class="batik-corner ${pos}" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
          ${this.svgPath}
        </svg>`).join('');
    }
  };