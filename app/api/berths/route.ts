import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBerths, saveBerths } from "@/lib/store";
import { isAdmin, type CanalSide } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });
  }
  return NextResponse.json(await getBerths());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const berths = await getBerths();
  const number =
    Number(body?.number) ||
    Math.max(0, ...berths.map((b) => b.number)) + 1;
  const side: CanalSide = body?.side === "sonden" ? "sonden" : "norden";

  const berth = {
    id: crypto.randomUUID(),
    number,
    side,
    x: Number(body?.x ?? (side === "norden" ? 50 : 50)),
    y: Number(body?.y ?? (side === "norden" ? 42 : 54)),
    memberId: null,
  };
  berths.push(berth);
  await saveBerths(berths);
  return NextResponse.json(berth, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Ugyldigt format." }, { status: 400 });
  }
  await saveBerths(body);
  return NextResponse.json(body);
}
