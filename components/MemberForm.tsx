"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Berth, Member, MembershipType } from "@/lib/types";
import { MEMBERSHIP_LABELS, MEMBERSHIP_TYPES, SIDE_SHORT } from "@/lib/labels";

type Props = {
  member?: Member;
  berths: Berth[];
  onDone?: () => void;
};

export function MemberForm({ member, berths, onDone }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [membershipType, setMembershipType] = useState<MembershipType>(
    member?.membershipType ?? "baadplads",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);

    if (!member) {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          boatName: data.get("boatName"),
          boatLengthMeters: data.get("boatLengthMeters"),
          membershipType: data.get("membershipType"),
          berthId: data.get("berthId") || null,
          notes: data.get("notes"),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Kunne ikke oprette medlem.");
        setPending(false);
        return;
      }
      const created = await res.json();
      const photo = data.get("photo");
      if (photo instanceof File && photo.size > 0) {
        const photoForm = new FormData();
        photoForm.set("photo", photo);
        await fetch(`/api/members/${created.id}`, {
          method: "PATCH",
          body: photoForm,
        });
      }
      form.reset();
      router.refresh();
      onDone?.();
      setPending(false);
      return;
    }

    const res = await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      body: data,
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Kunne ikke gemme.");
      setPending(false);
      return;
    }
    router.refresh();
    onDone?.();
    setPending(false);
  }

  const available = berths.filter(
    (b) => !b.memberId || b.memberId === member?.id,
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-sm text-muted">Navn</span>
        <input
          name="name"
          defaultValue={member?.name}
          required
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">E-mail</span>
        <input
          name="email"
          type="email"
          defaultValue={member?.email}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Telefon</span>
        <input
          name="phone"
          defaultValue={member?.phone}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Bådnavn</span>
        <input
          name="boatName"
          defaultValue={member?.boatName}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Længde (meter)</span>
        <input
          name="boatLengthMeters"
          type="number"
          step="0.1"
          min="0"
          defaultValue={member?.boatLengthMeters ?? ""}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Medlemstype</span>
        <select
          name="membershipType"
          value={membershipType}
          onChange={(e) =>
            setMembershipType(e.target.value as MembershipType)
          }
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        >
          {MEMBERSHIP_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEMBERSHIP_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Bådplads</span>
        <select
          name="berthId"
          defaultValue={member?.berthId ?? ""}
          disabled={membershipType !== "baadplads"}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 disabled:opacity-50"
        >
          <option value="">Ingen plads</option>
          {available.map((b) => (
            <option key={b.id} value={b.id}>
              Plads {b.number} · {SIDE_SHORT[b.side]}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-sm text-muted">Billede af båd</span>
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="w-full text-sm"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-sm text-muted">Noter</span>
        <textarea
          name="notes"
          defaultValue={member?.notes}
          rows={3}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2"
        />
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
          {pending ? "Gemmer…" : member ? "Gem ændringer" : "Tilføj medlem"}
        </button>
      </div>
    </form>
  );
}
