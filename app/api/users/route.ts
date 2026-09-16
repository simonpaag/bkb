import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUsers, saveUsers } from "@/lib/store";
import { hashPassword } from "@/lib/password";
import { isAdmin, type BoardRole } from "@/lib/types";
import { BOARD_ROLES } from "@/lib/labels";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });
  }
  const users = await getUsers();
  return NextResponse.json(
    users.map(({ passwordHash, ...rest }) => rest),
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Kun formand og næstformand kan tilføje brugere." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const role = body?.role as BoardRole;

  if (!name || !email || !password || !BOARD_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Udfyld navn, e-mail, adgangskode og rolle." },
      { status: 400 },
    );
  }

  const users = await getUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json(
      { error: "Der findes allerede en bruger med den e-mail." },
      { status: 409 },
    );
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);

  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}
