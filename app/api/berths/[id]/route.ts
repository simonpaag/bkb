import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBerths, getMembers, saveBerths, saveMembers } from "@/lib/store";
import { isAdmin, type CanalSide } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const berths = await getBerths();
  const berth = berths.find((b) => b.id === id);
  if (!berth) {
    return NextResponse.json({ error: "Pladsen findes ikke." }, { status: 404 });
  }

  if (typeof body.x === "number") berth.x = Math.min(98, Math.max(2, body.x));
  if (typeof body.y === "number") berth.y = Math.min(98, Math.max(2, body.y));
  if (typeof body.number === "number") berth.number = body.number;
  if (body.side === "norden" || body.side === "sonden") {
    berth.side = body.side as CanalSide;
  }

  if (body.memberId !== undefined) {
    const members = await getMembers();
    const nextMemberId = body.memberId ? String(body.memberId) : null;

    for (const other of berths) {
      if (other.memberId === nextMemberId) other.memberId = null;
    }
    for (const member of members) {
      if (member.berthId === berth.id) member.berthId = null;
      if (nextMemberId && member.id === nextMemberId) member.berthId = berth.id;
    }
    berth.memberId = nextMemberId;
    await saveMembers(members);
  }

  await saveBerths(berths);
  return NextResponse.json(berth);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }
  const { id } = await params;
  const berths = await getBerths();
  const berth = berths.find((b) => b.id === id);
  if (!berth) {
    return NextResponse.json({ error: "Pladsen findes ikke." }, { status: 404 });
  }

  const members = await getMembers();
  for (const member of members) {
    if (member.berthId === id) member.berthId = null;
  }
  await saveMembers(members);
  await saveBerths(berths.filter((b) => b.id !== id));
  return NextResponse.json({ ok: true });
}
