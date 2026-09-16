import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBerths, getMembers, saveBerths, saveMembers } from "@/lib/store";
import { isAdmin, type MembershipType } from "@/lib/types";
import { MEMBERSHIP_TYPES } from "@/lib/labels";

type Params = { params: Promise<{ id: string }> };

async function savePhoto(file: File) {
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  if (!allowed.includes(ext)) {
    throw new Error("Billedet skal være JPG, PNG, WEBP eller GIF.");
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "boats");
  await fs.mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), bytes);
  return `/uploads/boats/${filename}`;
}

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });
  }
  const { id } = await params;
  const member = (await getMembers()).find((m) => m.id === id);
  if (!member) {
    return NextResponse.json({ error: "Medlemmet findes ikke." }, { status: 404 });
  }
  return NextResponse.json(member);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }

  const { id } = await params;
  const members = await getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Medlemmet findes ikke." }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let body: Record<string, unknown> = {};
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    form.forEach((value, key) => {
      if (key !== "photo") body[key] = value;
    });
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      members[index].photoPath = await savePhoto(photo);
    }
  } else {
    body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  if (body.name != null) members[index].name = String(body.name).trim();
  if (body.email != null) members[index].email = String(body.email).trim();
  if (body.phone != null) members[index].phone = String(body.phone).trim();
  if (body.boatName != null) members[index].boatName = String(body.boatName).trim();
  if (body.notes != null) members[index].notes = String(body.notes).trim();
  if (body.boatLengthMeters !== undefined) {
    members[index].boatLengthMeters =
      body.boatLengthMeters === "" || body.boatLengthMeters == null
        ? null
        : Number(body.boatLengthMeters);
  }
  if (
    body.membershipType &&
    MEMBERSHIP_TYPES.includes(body.membershipType as MembershipType)
  ) {
    members[index].membershipType = body.membershipType as MembershipType;
  }
  if (body.berthId !== undefined) {
    const nextBerth = body.berthId ? String(body.berthId) : null;
    members[index].berthId = nextBerth;
    const berths = await getBerths();
    for (const berth of berths) {
      if (berth.memberId === members[index].id) berth.memberId = null;
      if (nextBerth && berth.id === nextBerth) berth.memberId = members[index].id;
    }
    await saveBerths(berths);
  }

  await saveMembers(members);
  return NextResponse.json(members[index]);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }
  const { id } = await params;
  const members = await getMembers();
  const next = members.filter((m) => m.id !== id);
  if (next.length === members.length) {
    return NextResponse.json({ error: "Medlemmet findes ikke." }, { status: 404 });
  }
  const berths = await getBerths();
  for (const berth of berths) {
    if (berth.memberId === id) berth.memberId = null;
  }
  await saveBerths(berths);
  await saveMembers(next);
  return NextResponse.json({ ok: true });
}
