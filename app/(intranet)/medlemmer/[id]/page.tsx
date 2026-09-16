import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { getBerths, getMembers } from "@/lib/store";
import { isAdmin } from "@/lib/types";
import { MEMBERSHIP_LABELS, SIDE_LABELS } from "@/lib/labels";
import { MemberForm } from "@/components/MemberForm";

export const dynamic = "force-dynamic";

export default async function MedlemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [members, berths] = await Promise.all([getMembers(), getBerths()]);
  const member = members.find((m) => m.id === id);
  if (!member) notFound();
  const berth = berths.find((b) => b.id === member.berthId);

  return (
    <div className="max-w-3xl">
      <Link href="/medlemmer" className="text-sm text-canal hover:underline">
        ← Alle medlemmer
      </Link>
      <div className="paper-card mt-4 overflow-hidden rounded-2xl">
        {member.photoPath ? (
          <img
            src={member.photoPath}
            alt={member.boatName || member.name}
            className="h-64 w-full object-cover"
          />
        ) : null}
        <div className="p-6">
          <p className="text-xs tracking-[0.18em] text-brass-dark uppercase">
            {MEMBERSHIP_LABELS[member.membershipType]}
          </p>
          <h1 className="font-serif mt-1 text-4xl text-navy">
            {member.boatName || member.name}
          </h1>
          <p className="mt-1 text-lg">{member.name}</p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">E-mail</dt>
              <dd>{member.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Telefon</dt>
              <dd>{member.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Længde</dt>
              <dd>
                {member.boatLengthMeters
                  ? `${member.boatLengthMeters} m`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Bådplads</dt>
              <dd>
                {berth
                  ? `Plads ${berth.number} · ${SIDE_LABELS[berth.side]}`
                  : "Ingen"}
              </dd>
            </div>
          </dl>
          {member.notes ? (
            <p className="mt-5 rounded-xl bg-canal-soft/50 p-3 text-sm">
              {member.notes}
            </p>
          ) : null}
        </div>
      </div>

      {isAdmin(user) ? (
        <section className="paper-card mt-8 rounded-2xl p-6">
          <h2 className="font-serif mb-4 text-2xl text-navy">Redigér</h2>
          <MemberForm member={member} berths={berths} />
        </section>
      ) : null}
    </div>
  );
}
