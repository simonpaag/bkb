import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBerths, getMembers, saveBerths, saveMembers } from "@/lib/store";
import { isAdmin, type MembershipType } from "@/lib/types";
import { MEMBERSHIP_TYPES } from "@/lib/labels";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });
  }
  return NextResponse.json(await getMembers());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Kun formand og næstformand kan oprette medlemmer." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const membershipType = body?.membershipType as MembershipType;
  if (!name || !MEMBERSHIP_TYPES.includes(membershipType)) {
    return NextResponse.json({ error: "Udfyld navn og medlemstype." }, { status: 400 });
  }

  const members = await getMembers();
  const member = {
    id: crypto.randomUUID(),
    name,
    email: String(body?.email ?? "").trim(),
    phone: String(body?.phone ?? "").trim(),
    boatName: String(body?.boatName ?? "").trim(),
    boatLengthMeters:
      body?.boatLengthMeters === "" || body?.boatLengthMeters == null
        ? null
        : Number(body.boatLengthMeters),
    membershipType,
    berthId: body?.berthId ? String(body.berthId) : null,
    photoPath: null,
    notes: String(body?.notes ?? "").trim(),
    createdAt: new Date().toISOString(),
  };

  members.push(member);
  await saveMembers(members);

  if (member.berthId) {
    const berths = await getBerths();
    for (const berth of berths) {
      if (berth.memberId === member.id) berth.memberId = null;
      if (berth.id === member.berthId) berth.memberId = member.id;
    }
    await saveBerths(berths);
  }

  return NextResponse.json(member, { status: 201 });
}
