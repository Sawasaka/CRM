import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("apps/web/public/brand/rookie-smart-japan");
fs.mkdirSync(outDir, { recursive: true });

const company = "株式会社ルーキースマートジャパン";
const english = "ROOKIE SMART JAPAN";

const variants = [
  {
    id: "04-apex-signal",
    name: "Apex Signal",
    subtitle: "ENTERPRISE AI CRM",
    accent: "#4d9cff",
    accent2: "#b9d3ff",
    mark: "apex",
    note: "上場SaaSのような直線的で強いシグナル感",
  },
  {
    id: "05-grid-core",
    name: "Grid Core",
    subtitle: "DATA INTELLIGENCE",
    accent: "#7fb4ff",
    accent2: "#54e6a3",
    mark: "grid",
    note: "企業DB・構造化データ・基盤感を出す堅めの案",
  },
  {
    id: "06-nexus-ring",
    name: "Nexus Ring",
    subtitle: "CONNECTED CRM",
    accent: "#8fb7ff",
    accent2: "#a78bfa",
    mark: "ring",
    note: "連携・統合CRM・ネットワーク感を出す案",
  },
  {
    id: "07-prism-line",
    name: "Prism Line",
    subtitle: "SALES OPERATING SYSTEM",
    accent: "#5aa7ff",
    accent2: "#f4d35e",
    mark: "prism",
    note: "営業組織の伸びとシャープな成長感を出す案",
  },
  {
    id: "08-sovereign-wordmark",
    name: "Sovereign Wordmark",
    subtitle: "ROOKIE SMART JAPAN INC.",
    accent: "#2f8cff",
    accent2: "#dbe9ff",
    mark: "sovereign",
    note: "マークを抑えた、法人登記・契約書にも馴染む案",
  },
];

function defs(v) {
  return `
    <defs>
      <linearGradient id="text-${v.id}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#f4f7ff"/>
        <stop offset="0.58" stop-color="${v.accent2}"/>
        <stop offset="1" stop-color="${v.accent}"/>
      </linearGradient>
      <linearGradient id="mark-${v.id}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#edf5ff"/>
        <stop offset="0.48" stop-color="${v.accent2}"/>
        <stop offset="1" stop-color="${v.accent}"/>
      </linearGradient>
      <radialGradient id="glow-${v.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${v.accent}" stop-opacity="0.45"/>
        <stop offset="1" stop-color="${v.accent}" stop-opacity="0"/>
      </radialGradient>
      <filter id="soft-${v.id}" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="10"/>
      </filter>
      <filter id="shadow-${v.id}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.38"/>
      </filter>
    </defs>
  `;
}

function mark(v, x, y, size) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  if (v.mark === "apex") {
    return `
      <g filter="url(#shadow-${v.id})">
        <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.22}" fill="#151a22" stroke="rgba(185,211,255,0.34)"/>
        <circle cx="${cx}" cy="${cy}" r="${size * 0.42}" fill="url(#glow-${v.id})" filter="url(#soft-${v.id})"/>
        <path d="M ${x + size * 0.26} ${y + size * 0.66} L ${x + size * 0.50} ${y + size * 0.25} L ${x + size * 0.75} ${y + size * 0.66}" fill="none" stroke="url(#mark-${v.id})" stroke-width="${size * 0.075}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M ${x + size * 0.36} ${y + size * 0.66} L ${x + size * 0.50} ${y + size * 0.44} L ${x + size * 0.64} ${y + size * 0.66}" fill="none" stroke="#f8fbff" stroke-width="${size * 0.04}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>
      </g>
    `;
  }
  if (v.mark === "grid") {
    const gap = size * 0.075;
    const cell = (size - gap * 4) / 3;
    return `
      <g filter="url(#shadow-${v.id})">
        <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.18}" fill="#151a22" stroke="rgba(185,211,255,0.28)"/>
        ${[0, 1, 2].map((row) => [0, 1, 2].map((col) => {
          const active = row + col >= 2;
          return `<rect x="${x + gap + col * (cell + gap)}" y="${y + gap + row * (cell + gap)}" width="${cell}" height="${cell}" rx="${cell * 0.28}" fill="${active ? `url(#mark-${v.id})` : "#252b35"}" opacity="${active ? "0.98" : "0.72"}"/>`;
        }).join("")).join("")}
      </g>
    `;
  }
  if (v.mark === "ring") {
    return `
      <g filter="url(#shadow-${v.id})">
        <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.5}" fill="#151a22" stroke="rgba(185,211,255,0.30)"/>
        <circle cx="${cx}" cy="${cy}" r="${size * 0.31}" fill="none" stroke="url(#mark-${v.id})" stroke-width="${size * 0.075}"/>
        <circle cx="${x + size * 0.30}" cy="${y + size * 0.36}" r="${size * 0.065}" fill="#f3f7ff"/>
        <circle cx="${x + size * 0.70}" cy="${y + size * 0.34}" r="${size * 0.052}" fill="${v.accent}"/>
        <circle cx="${x + size * 0.62}" cy="${y + size * 0.73}" r="${size * 0.06}" fill="${v.accent2}"/>
      </g>
    `;
  }
  if (v.mark === "prism") {
    return `
      <g filter="url(#shadow-${v.id})">
        <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.18}" fill="#151a22" stroke="rgba(185,211,255,0.30)"/>
        <path d="M ${x + size * 0.22} ${y + size * 0.70} L ${x + size * 0.42} ${y + size * 0.31} L ${x + size * 0.80} ${y + size * 0.31} L ${x + size * 0.60} ${y + size * 0.70} Z" fill="url(#mark-${v.id})" opacity="0.96"/>
        <path d="M ${x + size * 0.42} ${y + size * 0.31} L ${x + size * 0.60} ${y + size * 0.70}" stroke="#ffffff" stroke-opacity="0.62" stroke-width="${size * 0.028}"/>
        <path d="M ${x + size * 0.31} ${y + size * 0.54} H ${x + size * 0.71}" stroke="#10131a" stroke-opacity="0.55" stroke-width="${size * 0.045}"/>
      </g>
    `;
  }
  return `
    <g filter="url(#shadow-${v.id})">
      <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.16}" fill="#151a22" stroke="rgba(185,211,255,0.30)"/>
      <text x="${cx}" y="${cy + size * 0.16}" text-anchor="middle" font-size="${size * 0.52}" font-weight="900" fill="url(#mark-${v.id})" font-family="'Inter','Plus Jakarta Sans',sans-serif">R</text>
      <path d="M ${x + size * 0.25} ${y + size * 0.74} H ${x + size * 0.75}" stroke="${v.accent}" stroke-width="${size * 0.035}" stroke-linecap="round"/>
    </g>
  `;
}

function logoSvg(v) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="840" height="210" viewBox="0 0 840 210" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>${company} ${v.name} logo</title>
  <desc>${v.note}</desc>
  ${defs(v)}
  <rect x="10" y="10" width="820" height="190" rx="36" fill="#0f1217" fill-opacity="0.96" stroke="rgba(185,211,255,0.18)"/>
  <rect x="11" y="11" width="818" height="188" rx="35" fill="url(#glow-${v.id})" opacity="0.16"/>
  ${mark(v, 46, 48, 114)}
  <text x="190" y="86" fill="#9fbfff" font-size="14" font-weight="800" letter-spacing="4.2" font-family="'Inter','Plus Jakarta Sans',sans-serif">${english}</text>
  <text x="190" y="132" fill="url(#text-${v.id})" font-size="38" font-weight="900" letter-spacing="0" font-family="'Hiragino Sans','Yu Gothic UI','Inter',sans-serif">${company}</text>
  <text x="190" y="160" fill="#8e97a8" font-size="13" font-weight="700" letter-spacing="2.8" font-family="'Inter','Plus Jakarta Sans',sans-serif">${v.subtitle}</text>
</svg>
`;
}

function homeSvg(v) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="540" viewBox="0 0 1600 540" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>${company} ${v.name} homepage banner</title>
  <desc>${v.note}</desc>
  ${defs(v)}
  <rect width="1600" height="540" fill="#0b0d11"/>
  <rect width="1600" height="540" fill="url(#glow-${v.id})" opacity="0.20"/>
  <circle cx="180" cy="128" r="90" fill="${v.accent2}" opacity="0.10" filter="url(#soft-${v.id})"/>
  <circle cx="1390" cy="382" r="120" fill="${v.accent}" opacity="0.10" filter="url(#soft-${v.id})"/>
  <rect x="118" y="96" width="1364" height="348" rx="46" fill="#11151c" fill-opacity="0.72" stroke="rgba(185,211,255,0.18)" filter="url(#shadow-${v.id})"/>
  ${mark(v, 188, 172, 156)}
  <text x="390" y="206" fill="#9fbfff" font-size="16" font-weight="850" letter-spacing="5.4" font-family="'Inter','Plus Jakarta Sans',sans-serif">${english}</text>
  <text x="390" y="282" fill="url(#text-${v.id})" font-size="64" font-weight="900" letter-spacing="0" font-family="'Hiragino Sans','Yu Gothic UI','Inter',sans-serif">${company}</text>
  <text x="392" y="330" fill="#9aa4b5" font-size="20" font-weight="700" letter-spacing="3.4" font-family="'Inter','Plus Jakarta Sans',sans-serif">${v.subtitle}</text>
  <path d="M 390 360 H 1020" stroke="url(#mark-${v.id})" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
  <text x="392" y="398" fill="#c4ccdb" font-size="17" font-weight="600" font-family="'Hiragino Sans','Yu Gothic UI','Inter',sans-serif">${v.note}</text>
</svg>
`;
}

for (const variant of variants) {
  fs.writeFileSync(path.join(outDir, `rsj-${variant.id}-logo.svg`), logoSvg(variant));
  fs.writeFileSync(path.join(outDir, `rsj-${variant.id}-home.svg`), homeSvg(variant));
}

console.log(`generated ${variants.length * 2} svg files in ${outDir}`);
