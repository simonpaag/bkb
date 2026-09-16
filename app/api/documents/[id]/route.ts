import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDocuments, saveDocuments } from "@/lib/store";
import { isAdmin } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json(
      { error: "Kun formand og næstformand kan slette dokumenter." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const documents = await getDocuments();
  const doc = documents.find((d) => d.id === id);
  if (!doc) {
    return NextResponse.json({ error: "Dokumentet findes ikke." }, { status: 404 });
  }

  const full = path.join(process.cwd(), "public", doc.path.replace(/^\//, ""));
  await fs.unlink(full).catch(() => undefined);
  await saveDocuments(documents.filter((d) => d.id !== id));
  return NextResponse.json({ ok: true });
}
