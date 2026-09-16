import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUsers, saveUsers } from "@/lib/store";
import { hashPassword } from "@/lib/password";
import { isAdmin, type BoardRole } from "@/lib/types";
import { BOARD_ROLES } from "@/lib/labels";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Brugeren findes ikke." }, { status: 404 });
  }

  if (body?.name) users[index].name = String(body.name).trim();
  if (body?.email) users[index].email = String(body.email).trim().toLowerCase();
  if (body?.role && BOARD_ROLES.includes(body.role as BoardRole)) {
    users[index].role = body.role as BoardRole;
  }
  if (body?.password) {
    users[index].passwordHash = hashPassword(String(body.password));
  }

  await saveUsers(users);
  const { passwordHash: _, ...safe } = users[index];
  return NextResponse.json(safe);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json(
      { error: "Kun formand og næstformand kan slette brugere." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json(
      { error: "Du kan ikke slette din egen bruger." },
      { status: 400 },
    );
  }

  const users = await getUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) {
    return NextResponse.json({ error: "Brugeren findes ikke." }, { status: 404 });
  }
  await saveUsers(next);
  return NextResponse.json({ ok: true });
}
