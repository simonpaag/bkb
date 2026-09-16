import Link from "next/link";
import { requireUser } from "@/lib/auth-guard";
import { getBerths, getDocuments, getMembers, getUsers } from "@/lib/store";
import { MEMBERSHIP_LABELS } from "@/lib/labels";
import { isAdmin } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OversigtPage() {
  const user = await requireUser();
  const [members, berths, documents, users] = await Promise.all([
    getMembers(),
    getBerths(),
    getDocuments(),
    getUsers(),
  ]);

  const withBerth = members.filter((m) => m.membershipType === "baadplads");
  const waiting = members.filter((m) => m.membershipType === "venteliste");
  const occupied = berths.filter((b) => b.memberId).length;
  const latestDocs = [...documents]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 3);

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-brass-dark uppercase">
        Bådklubben Bolværket · 1985
      </p>
      <h1 className="font-serif mt-2 text-4xl text-navy">
        Velkommen, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Her samler bestyrelsen medlemmer, bådpladser langs Christianshavns
        Kanal og klubbens dokumenter.
      </p>

      <div className="paper-card mt-8 overflow-hidden rounded-2xl">
        <img
          src="/maps/kanalen-foto.png"
          alt="Christianshavns Kanal med både langs bolværket"
          className="h-56 w-full object-cover sm:h-72"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Medlemmer med plads" value={withBerth.length} />
        <Stat label="På venteliste" value={waiting.length} />
        <Stat
          label="Optagne pladser"
          value={`${occupied} / ${berths.length}`}
        />
        <Stat label="Bestyrelsen" value={users.length} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Link
          href="/kanalen"
          className="paper-card group overflow-hidden rounded-2xl"
        >
          <div className="relative h-64">
            <img
              src="/maps/kanal-horizontal.jpg"
              alt="Kanalen, vandret"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
            <div className="absolute bottom-5 left-5 text-sand">
              <p className="text-xs tracking-[0.2em] uppercase">Kanalen</p>
              <p className="font-serif text-3xl">Bådepladser på kortet</p>
            </div>
          </div>
        </Link>

        <section className="paper-card rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-navy">Seneste dokumenter</h2>
          <ul className="mt-4 space-y-3">
            {latestDocs.map((doc) => (
              <li key={doc.id}>
                <a href={doc.path} className="hover:underline">
                  {doc.title}
                </a>
                <p className="text-xs text-muted">
                  {new Date(doc.uploadedAt).toLocaleDateString("da-DK")}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/dokumenter"
            className="mt-5 inline-block text-sm text-canal hover:underline"
          >
            Åbn arkivet
          </Link>
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-navy">Medlemmer</h2>
          <Link href="/medlemmer" className="text-sm text-canal hover:underline">
            Se alle
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {members
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "da"))
            .slice(0, 4)
            .map((m) => (
              <Link
                key={m.id}
                href={`/medlemmer/${m.id}`}
                className="paper-card overflow-hidden rounded-2xl"
              >
                {m.photoPath ? (
                  <img
                    src={m.photoPath}
                    alt={m.boatName || m.name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center bg-canal-soft font-serif text-3xl text-navy">
                    {m.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                )}
                <div className="p-3">
                  <p className="font-serif text-lg text-navy">
                    {m.boatName || m.name}
                  </p>
                  <p className="text-sm text-muted">
                    {m.boatName ? m.name : MEMBERSHIP_LABELS[m.membershipType]}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {isAdmin(user.role) ? (
        <p className="mt-10 text-sm text-muted">
          Du er logget ind som {user.role === "formand" ? "formand" : "næstformand"}
          {" "}og kan tilføje og slette brugere under{" "}
          <Link href="/bestyrelsen" className="text-canal hover:underline">
            Bestyrelsen
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="paper-card rounded-2xl p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-serif mt-1 text-3xl text-navy">{value}</p>
    </div>
  );
}
