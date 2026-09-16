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

export function CanalMap({ berths, members, user }: Props) {
  const router = useRouter();
  const admin = isAdmin(user.role);
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showNumbersRef, setShowNumbersRef] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
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

  function pointerToPercent(e: React.PointerEvent) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !editMode) return;
    const { x, y } = pointerToPercent(e);
    setLocalBerths((prev) =>
      prev.map((b) => (b.id === dragging ? { ...b, x, y } : b)),
    );
  }

  async function onPointerUp() {
    if (!dragging) return;
    const berth = localBerths.find((b) => b.id === dragging);
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
            onClick={() => setShowNumbersRef((v) => !v)}
            className={`rounded-full px-3 py-1.5 text-sm ${showNumbersRef ? "bg-navy text-sand" : "bg-white text-navy"}`}
          >
            {showNumbersRef ? "Skjul referencenumre" : "Vis referencenumre"}
          </button>
          {admin ? (
            <>
              <button
                onClick={() => setEditMode((v) => !v)}
                className={`rounded-full px-3 py-1.5 text-sm ${editMode ? "bg-brass text-navy-deep" : "bg-white text-navy"}`}
              >
                {editMode ? "Flytning slået til" : "Flyt pladser"}
              </button>
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

        <div
          ref={mapRef}
          className="relative overflow-hidden rounded-2xl border border-navy/10 bg-navy shadow-lg"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <img
            src={
              showNumbersRef
                ? "/maps/kanal-numreret.jpg"
                : "/maps/kanal-horizontal.jpg"
            }
            alt="Christianshavns Kanal, drejet så kanalen ligger vandret. Vest til venstre, øst til højre. Hele kanalen fra bolværket til øst for Torvegade."
            className="block w-full select-none"
            draggable={false}
          />
          <div className="pointer-events-none absolute top-2 left-3 rounded bg-navy/70 px-2 py-1 text-[11px] tracking-wide text-sand uppercase">
            Vest
          </div>
          <div className="pointer-events-none absolute top-2 right-3 rounded bg-navy/70 px-2 py-1 text-[11px] tracking-wide text-sand uppercase">
            Øst
          </div>
          <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded bg-navy/70 px-2 py-1 text-[11px] tracking-wide text-sand uppercase">
            Torvegade
          </div>

          {localBerths.map((berth) => {
            const taken = Boolean(berth.memberId);
            const active = berth.id === selectedId;
            return (
              <button
                key={berth.id}
                type="button"
                onPointerDown={(e) => {
                  if (editMode && admin) {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDragging(berth.id);
                  }
                }}
                onClick={() => setSelectedId(berth.id)}
                style={{ left: `${berth.x}%`, top: `${berth.y}%` }}
                className={`absolute flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border px-1 text-[10px] font-semibold shadow-md transition ${
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
            Officielle pladsnumre fra maillisten. Træk dem på plads med Flyt
            pladser.
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

      <aside className="paper-card h-fit rounded-2xl p-5">
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
                  {selectedMember.boatName || "Uden bådnavn"}
                </p>
                <p className="text-sm">{selectedMember.name}</p>
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
              Numrene er et første udkast — formand og næstformand kan flytte
              dem hen på de rigtige både.
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
