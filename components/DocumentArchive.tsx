"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClubDocument, DocumentCategory, SessionUser } from "@/lib/types";
import { isAdmin } from "@/lib/types";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
} from "@/lib/labels";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DocumentArchive({
  documents,
  user,
}: {
  documents: ClubDocument[];
  user: SessionUser;
}) {
  const router = useRouter();
  const admin = isAdmin(user.role);
  const [category, setCategory] = useState<DocumentCategory | "alle">("alle");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const filtered = useMemo(
    () =>
      category === "alle"
        ? documents
        : documents.filter((d) => d.category === category),
    [documents, category],
  );

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = e.currentTarget;
    const res = await fetch("/api/documents", {
      method: "POST",
      body: new FormData(form),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Kunne ikke uploade.");
      setPending(false);
      return;
    }
    form.reset();
    setPending(false);
    router.refresh();
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Slet dokumentet “${title}”?`)) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Kunne ikke slette.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onUpload}
        className="paper-card grid gap-4 rounded-2xl p-6 sm:grid-cols-[1fr_180px_1fr_auto]"
      >
        <label>
          <span className="mb-1 block text-sm text-muted">Titel</span>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">Kategori</span>
          <select
            name="category"
            className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
            defaultValue="andet"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {DOCUMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">Fil</span>
          <input name="file" type="file" required className="w-full text-sm" />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2 text-sand disabled:opacity-60"
          >
            {pending ? "Uploader…" : "Upload"}
          </button>
        </div>
        {error ? (
          <p className="sm:col-span-4 text-sm text-red-700">{error}</p>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("alle")}
          className={`rounded-full px-3 py-1.5 text-sm ${category === "alle" ? "bg-navy text-sand" : "bg-white"}`}
        >
          Alle
        </button>
        {DOCUMENT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-sm ${category === c ? "bg-navy text-sand" : "bg-white"}`}
          >
            {DOCUMENT_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.length === 0 ? (
          <li className="text-muted">Ingen dokumenter i denne kategori.</li>
        ) : (
          filtered.map((doc) => (
            <li
              key={doc.id}
              className="paper-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4"
            >
              <div>
                <p className="font-medium text-navy">{doc.title}</p>
                <p className="text-sm text-muted">
                  {DOCUMENT_CATEGORY_LABELS[doc.category]} · {doc.filename} ·{" "}
                  {formatDate(doc.uploadedAt)} · {doc.uploadedBy}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <a
                  href={doc.path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-canal hover:underline"
                >
                  Åbn
                </a>
                {admin ? (
                  <button
                    onClick={() => onDelete(doc.id, doc.title)}
                    className="text-red-800 hover:underline"
                  >
                    Slet
                  </button>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
