# Oph Eye Scanner — Web MVP (Next.js + OCR + MCP proxy)

This is a minimal web app template for scanning ophthalmic products (eye drops / gel / ointment),
running OCR in the browser, and looking up drug information via a KPIC MCP backend.

## Quick start (local)
```bash
# from repo root
cd apps/web
npm i
npm run dev
# open http://localhost:3000
```

## Environment
- Set `MCP_URL` to your MCP server's call endpoint (e.g. Replit MCP repl: `https://<your-mcp>.repl.co/call`).
- You can set it in Replit Secrets or a local `.env.local` file (Next.js format).

## Deploy to Replit
- Create two Repls:
  1) **kpic-mcp** (import the MCP repo or your fork; ensure it exposes `/call`)
  2) **oph-eye-scanner-web** (import this repo)
- In the web Repl, set the Secret `MCP_URL` = the public `/call` endpoint of your MCP Repl.
- The default run command for web Repl is:
  ```sh
  cd apps/web && npm i && npm run dev
  ```

## Notes
- OCR uses Tesseract.js (kor+eng). Barcode detection is via @zxing/browser.
- API routes `/api/search` and `/api/detail` proxy to MCP to avoid CORS issues.
- Filtering for ophthalmic products is based on `drug_form` and `dosage_route` fields (Korean: 점안액/안겔/점안겔/안연고 or 라우트 '점안','눈').
