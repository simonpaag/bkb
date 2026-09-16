"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BoardRole, User } from "@/lib/types";
import { BOARD_ROLES, ROLE_LABELS } from "@/lib/labels";

type SafeUser = Omit<User, "passwordHash">;

export function BoardUsers({
  users,
  currentUserId,
}: {
  users: SafeUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Kunne ikke oprette bruger.");
      setPending(false);
      return;
    }
    form.reset();
    setPending(false);
    router.refresh();
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Slet ${name} fra bestyrelsens intranet?`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Kunne ikke slette.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="paper-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy text-sand">
            <tr>
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Rolle</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-navy/10">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                <td className="px-4 py-3 text-right">
                  {user.id === currentUserId ? (
                    <span className="text-xs text-muted">Dig</span>
                  ) : (
                    <button
                      onClick={() => onDelete(user.id, user.name)}
                      className="text-red-800 hover:underline"
                    >
                      Slet
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="paper-card rounded-2xl p-6">
        <h2 className="font-serif text-2xl text-navy">Ny bruger</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Kun formand og næstformand kan tilføje og slette adgang til
          intranettet.
        </p>
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Navn</span>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Adgangskode</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Rolle</span>
            <select
              name="role"
              defaultValue={"bestyrelsesmedlem" satisfies BoardRole}
              className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
            >
              {BOARD_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <p className="sm:col-span-2 text-sm text-red-700">{error}</p>
          ) : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-navy px-4 py-2 text-sand disabled:opacity-60"
            >
              {pending ? "Opretter…" : "Tilføj bestyrelsesmedlem"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
