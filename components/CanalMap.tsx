"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Berth, Member, SessionUser } from "@/lib/types";
import { isAdmin } from "@/lib/types";
import { MEMBERSHIP_LABELS, SIDE_LABELS, SIDE_SHORT } from "@/lib/labels";

type Props = {
  berths: Berth[];
  members: Member[];
  user: SessionUser;
};

type Pane = {
  id: string;
  title: string;
  x0: number;
  x1: number;
  src: string;
};

const PANES: Pane[] = [
  {
    id: "bolvaerket",
    title: "Bolværket",
    x0: 0,
    x1: 60,
    src: "/maps/kanal-bolvaerket.jpg?v=4",
  },
  {
    id: "torvegade",
    title: "Bag Torvegade",
    x0: 60,
    x1: 100,
    src: "/maps/kanal-torvegade.jpg?v=4",
  },
];

function inPane(berth: Berth, pane: Pane) {
  return pane.x1 >= 100 ? berth.x >= pane.x0 : berth.x >= pane.x0 && berth.x < pane.x1;
}

function toLocalX(x: number, pane: Pane) {
  return ((x - pane.x0) / (pane.x1 - pane.x0)) * 100;
}

export function CanalMap({ berths, members, user }: Props) {
  const router = useRouter();
  const admin = isAdmin(user);
  const mapRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [dragging, setDragging] = useState<{ id: string; paneId: string } | null>(
    null,
  );
  const [localBerths, setLocalBerths] = useState(berths);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalBerths(berths);
  }, [berths]);

  const memberById = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m])),
    [members],
  );
  const selected = localBerths.find((b) => b.id === selectedId) ?? null;
  const selectedMember = selected?.memberId
    ? memberById[selected.memberId]
    : undefined;

  const assignable = members.filter((m) => m.membershipType === "baadplads");

  async function patchBerth(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/berths/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke gemme pladsen.");
      return;
    }
    router.refresh();
  }

  function pointerToMap(e: React.PointerEvent, pane: Pane) {
    const rect = mapRefs.current[pane.id]?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    const localX = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const x = pane.x0 + (localX / 100) * (pane.x1 - pane.x0);
    return {
      x: Math.min(pane.x1 - 0.2, Math.max(pane.x0, x)),
      y: Math.min(96, Math.max(4, y)),
    };
  }

  function onPointerMove(e: React.PointerEvent, pane: Pane) {
    if (!dragging || !editMode || dragging.paneId !== pane.id) return;
    const { x, y } = pointerToMap(e, pane);
    setLocalBerths((prev) =>
      prev.map((b) => (b.id === dragging.id ? { ...b, x, y } : b)),
    );
  }

  async function onPointerUp() {
    if (!dragging) return;
    const berth = localBerths.find((b) => b.id === dragging.id);
    setDragging(null);
    if (berth) await patchBerth(berth.id, { x: berth.x, y: berth.y });
  }

  async function assignMember(memberId: string) {
    if (!selected) return;
    await patchBerth(selected.id, { memberId: memberId || null });
    setLocalBerths((prev) =>
      prev.map((b) =>
        b.id === selected.id
          ? { ...b, memberId: memberId || null }
          : memberId && b.memberId === memberId
            ? { ...b, memberId: null }
            : b,
      ),
    );
  }

  async function addBerth(side: "norden" | "sonden") {
    const res = await fetch("/api/berths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side }),
    });
    if (!res.ok) return;
    const berth = await res.json();
    setLocalBerths((prev) => [...prev, berth]);
    setSelectedId(berth.id);
    router.refresh();
  }

  async function deleteBerth() {
    if (!selected) return;
    if (!confirm(`Slet plads ${selected.number}?`)) return;
    const res = await fetch(`/api/berths/${selected.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setLocalBerths((prev) => prev.filter((b) => b.id !== selected.id));
    setSelectedId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`rounded-full px-3 py-1.5 text-sm ${editMode ? "bg-brass text-navy-deep" : "bg-white text-navy"}`}
          >
            {editMode ? "Flytning slået til" : "Flyt pladser"}
          </button>
          {admin ? (
            <>
              <button
                onClick={() => addBerth("norden")}
                className="rounded-full bg-white px-3 py-1.5 text-sm"
              >
                + Nord
              </button>
              <button
                onClick={() => addBerth("sonden")}
                className="rounded-full bg-white px-3 py-1.5 text-sm"
              >
                + Syd
              </button>
            </>
          ) : null}
        </div>

        <div className="space-y-8">
          {PANES.map((pane) => {
            return (
              <section key={pane.id}>
                <h2 className="font-serif mb-3 text-2xl text-navy">{pane.title}</h2>
                <div
                  ref={(el) => {
                    mapRefs.current[pane.id] = el;
                  }}
                  className="relative overflow-hidden rounded-2xl border border-navy/10 bg-[#f3efe6] shadow-lg"
                  onPointerMove={(e) => onPointerMove(e, pane)}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                >
                  <img
                    src={pane.src}
                    alt={`Christianshavns Kanal ved ${pane.title}`}
                    draggable={false}
                    className="block w-full select-none"
                  />
                  {localBerths.filter((b) => inPane(b, pane)).map((berth) => {
                    const taken = Boolean(berth.memberId);
                    const active = berth.id === selectedId;
                    return (
                      <button
                        key={berth.id}
                        type="button"
                        onPointerDown={(e) => {
                          if (editMode) {
                            e.currentTarget.setPointerCapture(e.pointerId);
                            setDragging({ id: berth.id, paneId: pane.id });
                          }
                        }}
                        onClick={() => setSelectedId(berth.id)}
                        style={{
                          left: `${toLocalX(berth.x, pane)}%`,
                          top: `${berth.y}%`,
                        }}
                        className={`absolute flex h-7 min-w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border px-1.5 text-xs font-semibold shadow-md transition ${
                          active
                            ? "z-20 scale-125 border-white bg-brass text-navy-deep"
                            : taken
                              ? "border-navy bg-navy text-sand hover:scale-110"
                              : "border-navy/40 bg-white/90 text-navy hover:scale-110"
                        } ${editMode ? "cursor-grab" : "cursor-pointer"}`}
                        title={`Plads ${berth.number}${taken && memberById[berth.memberId!] ? " · " + memberById[berth.memberId!].boatName : " · ledig"}`}
                      >
                        {berth.number}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-navy" />
            Optaget
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 rounded-full border border-navy/30 bg-white" />
            Ledig
          </span>
          <span>
            Officielle pladsnumre fra maillisten. Alle i bestyrelsen kan
            trække dem på plads med Flyt pladser.
          </span>
        </div>
        {editMode ? (
          <p className="mt-2 text-sm text-brass-dark">
            Træk numrene hen på de rigtige både. Placeringen gemmes med det
            samme.
          </p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      </div>

      <aside className="paper-card h-fit rounded-2xl p-5 lg:sticky lg:top-6">
        {selected ? (
          <div>
            <p className="text-xs tracking-[0.18em] text-brass-dark uppercase">
              {SIDE_SHORT[selected.side]}
            </p>
            <h2 className="font-serif mt-1 text-3xl text-navy">
              Plads {selected.number}
            </h2>
            <p className="mt-1 text-sm text-muted">{SIDE_LABELS[selected.side]}</p>

            {selectedMember ? (
              <div className="mt-4">
                {selectedMember.photoPath ? (
                  <img
                    src={selectedMember.photoPath}
                    alt={selectedMember.boatName || selectedMember.name}
                    className="mb-3 h-36 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-36 items-center justify-center rounded-xl bg-canal-soft text-sm text-muted">
                    Intet bådbillede
                  </div>
                )}
                <p className="font-serif text-xl text-navy">
                  {selectedMember.boatName || selectedMember.name}
                </p>
                {selectedMember.boatName ? (
                  <p className="text-sm">{selectedMember.name}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted">
                  {MEMBERSHIP_LABELS[selectedMember.membershipType]}
                  {selectedMember.boatLengthMeters
                    ? ` · ${selectedMember.boatLengthMeters} m`
                    : ""}
                </p>
              </div>
            ) : (
              <p className="mt-6 text-muted">Pladsen er ledig.</p>
            )}

            {admin ? (
              <div className="mt-5 space-y-3 border-t border-navy/10 pt-4">
                <label className="block text-sm">
                  <span className="mb-1 block text-muted">Tildel medlem</span>
                  <select
                    value={selected.memberId ?? ""}
                    onChange={(e) => assignMember(e.target.value)}
                    className="w-full rounded-lg border border-navy/15 bg-white px-2 py-2"
                  >
                    <option value="">Ledig plads</option>
                    {assignable.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.boatName ? ` · ${m.boatName}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={deleteBerth}
                  className="text-sm text-red-800 hover:underline"
                >
                  Slet denne plads
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-2xl text-navy">Bådepladser</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Klik på et nummer for at se, hvilken båd der ligger på pladsen.
              Kortet er delt ved Torvegade. Alle i bestyrelsen kan flytte
              numrene.
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-canal-soft/60 p-3">
                <dt className="text-muted">Optaget</dt>
                <dd className="font-serif text-2xl text-navy">
                  {localBerths.filter((b) => b.memberId).length}
                </dd>
              </div>
              <div className="rounded-xl bg-canal-soft/60 p-3">
                <dt className="text-muted">Ledige</dt>
                <dd className="font-serif text-2xl text-navy">
                  {localBerths.filter((b) => !b.memberId).length}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
}
