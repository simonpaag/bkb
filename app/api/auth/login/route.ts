import { NextResponse } from "next/server";
import { getUsers } from "@/lib/store";
import { verifyPassword } from "@/lib/password";
import { setSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Udfyld e-mail og adgangskode." },
      { status: 400 },
    );
  }

  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Forkert e-mail eller adgangskode." },
      { status: 401 },
    );
  }

  await setSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
