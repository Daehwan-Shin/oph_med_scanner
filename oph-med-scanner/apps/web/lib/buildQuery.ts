export function buildQueryFromOCR(raw: string, barcode: string) {
  const STOP = ["무균","무방부제","일회용","1회용","인공눈물","sterile","eyedrops","single-use"];
  let txt = (raw || "").replace(/\s+/g," ").trim();
  for (const w of STOP) txt = txt.replaceAll(w, "");
  // Keep common concentration units
  const picks = new Set<string>();
  (txt.match(/(\d+(\.\d+)?)\s*%/g) || []).forEach(v=>picks.add(v));
  (txt.match(/(\d+)\s*mg\/mL/gi) || []).forEach(v=>picks.add(v));
  const core = txt.split(" ")
    .filter(t => t.length>=2 && !/^[\d._-]+$/.test(t))
    .slice(0, 15).join(" ");
  return [barcode, core, [...picks].join(" ")].filter(Boolean).join(" ");
}

export function isOphthalmic(it: any) {
  const n = (s?: string) => (s ?? "").replace(/\s+/g,"").toLowerCase();
  const f = n(it?.drug_form), r = n(it?.dosage_route);
  const formHit = f.includes("점안") || f.includes("안연고") || f.includes("안겔") || f.includes("점안겔");
  const routeHit = r.includes("점안") || r.includes("눈");
  return formHit || routeHit;
}
