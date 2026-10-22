// Convert a TTF to three.js typeface JSON (facetype format), uppercase + digits + punctuation only.
import opentype from "opentype.js";
import fs from "node:fs";
const [,, src, dst] = process.argv;
const font = opentype.loadSync(src);
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:&+-'/!?@";
const scale = 1000 / font.unitsPerEm; // facetype assumes 1000 units
const glyphs = {};
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  if (!g) continue;
  const path = g.getPath(0, 0, font.unitsPerEm);
  let o = "";
  const r = (v) => Math.round(v * scale);
  for (const c of path.commands) {
    if (c.type === "M") o += `m ${r(c.x)} ${r(-c.y)} `;
    else if (c.type === "L") o += `l ${r(c.x)} ${r(-c.y)} `;
    else if (c.type === "Q") o += `q ${r(c.x)} ${r(-c.y)} ${r(c.x1)} ${r(-c.y1)} `;
    else if (c.type === "C") o += `b ${r(c.x)} ${r(-c.y)} ${r(c.x1)} ${r(-c.y1)} ${r(c.x2)} ${r(-c.y2)} `;
    else if (c.type === "Z") o += "z ";
  }
  glyphs[ch] = { ha: Math.round(g.advanceWidth * scale), x_min: Math.round((g.xMin ?? 0) * scale), x_max: Math.round((g.xMax ?? 0) * scale), o: o.trim() };
}
const out = {
  glyphs,
  familyName: "Archivo Bold Wide",
  ascender: Math.round(font.ascender * scale),
  descender: Math.round(font.descender * scale),
  underlinePosition: -100, underlineThickness: 50,
  boundingBox: { yMin: Math.round(font.tables.head.yMin * scale), xMin: Math.round(font.tables.head.xMin * scale), yMax: Math.round(font.tables.head.yMax * scale), xMax: Math.round(font.tables.head.xMax * scale) },
  resolution: 1000, original_font_information: { full_font_name: "Archivo Bold Wide" },
};
fs.writeFileSync(dst, JSON.stringify(out));
console.log("glyphs", Object.keys(glyphs).length, "bytes", fs.statSync(dst).size);
