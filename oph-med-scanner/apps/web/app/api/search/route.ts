import { NextRequest, NextResponse } from "next/server";
import { isOphthalmic } from "../../../lib/buildQuery";

const MCP_URL = process.env.MCP_URL || "";

export async function GET(req: NextRequest) {
  try {
    const text = req.nextUrl.searchParams.get("text") || "";
    if (!MCP_URL) return NextResponse.json({ error: "MCP_URL not set" }, { status: 500 });

    const body = { name: "search_drugs_by_name", arguments: { drugname: text } };
    const resp = await fetch(MCP_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) return NextResponse.json({ error: "mcp failed" }, { status: 500 });
    const data = await resp.json();
    const list = JSON.parse(data?.content?.[0]?.text ?? "[]");

    const items = (Array.isArray(list) ? list : [])
      .filter(isOphthalmic)
      .slice(0, 20)
      .map((it:any) => ({
        id: it.drugcode ?? it.item_seq ?? it.id ?? null,
        name: it.drug_name ?? it.item_name ?? "",
        company: it.company ?? it.maker ?? "",
        form: it.drug_form ?? "",
        route: it.dosage_route ?? "",
        strength: it.strength ?? it.concentration ?? "",
        pack: it.package ?? it.pack_unit ?? ""
      }));

    return NextResponse.json({ items });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "search failed" }, { status: 500 });
  }
}
