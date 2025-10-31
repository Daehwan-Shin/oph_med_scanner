import { NextRequest, NextResponse } from "next/server";

const MCP_URL = process.env.MCP_URL || "";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (!MCP_URL) return NextResponse.json({ error: "MCP_URL not set" }, { status: 500 });

    const body = { name: "get_drug_detail_by_id", arguments: { drugid: id } };
    const resp = await fetch(MCP_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) return NextResponse.json({ error: "mcp failed" }, { status: 500 });
    const data = await resp.json();
    const detail = JSON.parse(data?.content?.[0]?.text ?? "{}");
    return NextResponse.json({ detail });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "detail failed" }, { status: 500 });
  }
}
