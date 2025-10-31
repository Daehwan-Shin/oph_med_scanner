"use client";
import { useState } from "react";
import Tesseract from "tesseract.js";
import { BrowserMultiFormatReader } from "@zxing/browser";
import DrugCard from "../components/DrugCard";
import { buildQueryFromOCR } from "../lib/buildQuery";

export default function Page() {
  const [img, setImg] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [textDump, setTextDump] = useState(""); // DEBUG

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    setImg(url);
    setItems([]); setDetail(null); setTextDump(""); 
  }

  async function run() {
    if (!img) return;
    setLoading(true);
    try {
      // 1) Barcode first (if any)
      let barcodeText = "";
      try {
        const codeReader = new BrowserMultiFormatReader();
        const result = await codeReader.decodeFromImageUrl(img);
        barcodeText = result.getText();
      } catch {}

      // 2) OCR (Tesseract.js; kor+eng; using CDN to simplify worker/core paths)
      const ocr = await Tesseract.recognize(img, "kor+eng", {
        workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0",
        corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js"
      });
      const raw = ocr.data.text || "";
      setTextDump(raw);
      const query = buildQueryFromOCR(raw, barcodeText);

      const r = await fetch(`/api/search?text=${encodeURIComponent(query)}`);
      const j = await r.json();
      setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/detail?id=${encodeURIComponent(id)}`);
      const j = await r.json();
      setDetail(j.detail ?? null);
    } finally { setLoading(false); }
  }

  return (
    <main style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h1>안약 스캐너 (웹 MVP)</h1>
      <input type="file" accept="image/*" capture="environment" onChange={onPick} />
      <button onClick={run} disabled={!img || loading} style={{ marginLeft: 8 }}>OCR → 검색</button>

      {img && <div style={{ marginTop: 12 }}><img src={img} alt="preview" style={{ maxWidth: "100%", borderRadius: 8 }}/></div>}

      <h3 style={{ marginTop: 16 }}>검색 결과</h3>
      <ul style={{ padding: 0, listStyle: "none" }}>
        {items.map(it => <DrugCard key={String(it.id)} item={it} onOpen={openDetail} />)}
      </ul>

      {detail && (
        <section style={{ border: "1px solid #bbb", padding: 12, borderRadius: 8 }}>
          <h3>{detail.drug_name}</h3>
          <div>{detail.company}</div>
          <div>{[detail.drug_form, detail.dosage_route, detail.strength].filter(Boolean).join(" · ")}</div>
          <h4>효능/효과</h4><p>{detail.indications || "-"}</p>
          <h4>용법/용량</h4><p>{detail.dosage || "-"}</p>
          <h4>주의사항</h4><p>{detail.precautions || "-"}</p>
          <h4>임부/수유</h4><p>{detail.pregnancy_lactation || "-"}</p>
          <h4>보관</h4><p>{detail.storage || "-"}</p>
        </section>
      )}

      <details style={{ marginTop: 16 }}>
        <summary>OCR 원문(디버그)</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{textDump}</pre>
      </details>
    </main>
  );
}
