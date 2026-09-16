import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDocuments, saveDocuments } from "@/lib/store";
import { isAdmin, type DocumentCategory } from "@/lib/types";
import { DOCUMENT_CATEGORIES } from "@/lib/labels";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });
  }
  const documents = await getDocuments();
  documents.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });
  }

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "") as DocumentCategory;
  const file = form.get("file");

  if (!title || !DOCUMENT_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Udfyld titel og kategori." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Vælg en fil." }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowed = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".xls",
    ".xlsx",
  ];
  if (!allowed.includes(ext)) {
    return NextResponse.json(
      { error: "Filtypen er ikke tilladt." },
      { status: 400 },
    );
  }

  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "documents");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const document = {
    id: crypto.randomUUID(),
    title,
    category,
    filename: file.name,
    path: `/uploads/documents/${filename}`,
    uploadedBy: session.name,
    uploadedAt: new Date().toISOString(),
  };

  const documents = await getDocuments();
  documents.unshift(document);
  await saveDocuments(documents);
  return NextResponse.json(document, { status: 201 });
}
