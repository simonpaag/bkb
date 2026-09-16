"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Berth, Member, MembershipType, SessionUser } from "@/lib/types";
import { isAdmin } from "@/lib/types";
import { MEMBERSHIP_LABELS } from "@/lib/labels";
import { MemberForm } from "./MemberForm";

export function MemberDirectory({
  members,
  berths,
  user,
}: {
  members: Member[];
  berths: Berth[];
  user: SessionUser;
}) {
  const router = useRouter();
  const admin = isAdmin(user);
  const [q, setQ] = useState("");
  const [type, setType] = useState<MembershipType | "alle">("alle");
  const [showForm, setShowForm] = useState(false);

  const berthById = useMemo(
    () => Object.fromEntries(berths.map((b) => [b.id, b])),
    [berths],
  );

  const filtered = members.filter((m) => {
    const hay = `${m.name} ${m.boatName} ${m.email}`.toLowerCase();
    const matchQ = hay.includes(q.toLowerCase());
    const matchType = type === "alle" || m.membershipType === type;
    return matchQ && matchType;
  });

  async function remove(member: Member) {
    if (!confirm(`Slet ${member.name} fra medlemslisten?`)) return;
    await fetch(`/api/members/${member.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søg navn eller båd…"
            className="w-64 rounded-lg border border-navy/15 bg-white px-3 py-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MembershipType | "alle")}
            className="rounded-lg border border-navy/15 bg-white px-3 py-2"
          >
            <option value="alle">Alle typer</option>
            <option value="baadplads">Bådplads</option>
            <option value="venteliste">Venteliste</option>
            <option value="passiv">Passiv</option>
          </select>
        </div>
        {admin ? (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-navy px-4 py-2 text-sand"
          >
            {showForm ? "Luk formular" : "Tilføj medlem"}
          </button>
        ) : null}
      </div>

      {showForm && admin ? (
        <div className="paper-card mb-8 rounded-2xl p-6">
          <h2 className="font-serif mb-4 text-2xl text-navy">Nyt medlem</h2>
          <MemberForm berths={berths} onDone={() => setShowForm(false)} />
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => {
          const berth = member.berthId ? berthById[member.berthId] : null;
          return (
            <article
              key={member.id}
              className="paper-card overflow-hidden rounded-2xl"
            >
              <div className="relative h-40 bg-canal-soft">
                {member.photoPath ? (
                  <img
                    src={member.photoPath}
                    alt={member.boatName || member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    Intet bådbillede
                  </div>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-navy/85 px-2.5 py-1 text-[11px] tracking-wide text-sand uppercase">
                  {MEMBERSHIP_LABELS[member.membershipType]}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-serif text-xl text-navy">
                  {member.boatName || member.name}
                </h2>
                {member.boatName ? <p>{member.name}</p> : null}
                <p className="mt-1 text-sm text-muted">
                  {berth
                    ? `Plads ${berth.number}`
                    : member.membershipType === "venteliste"
                      ? "På venteliste"
                      : "Ingen plads"}
                  {member.boatLengthMeters
                    ? ` · ${member.boatLengthMeters} m`
                    : ""}
                </p>
                <div className="mt-3 flex gap-3 text-sm">
                  <Link
                    href={`/medlemmer/${member.id}`}
                    className="text-canal hover:underline"
                  >
                    Se kort
                  </Link>
                  {admin ? (
                    <button
                      onClick={() => remove(member)}
                      className="text-red-800 hover:underline"
                    >
                      Slet
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
