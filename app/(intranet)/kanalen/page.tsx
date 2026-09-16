import { CanalMap } from "@/components/CanalMap";
import { requireUser } from "@/lib/auth-guard";
import { getBerths, getMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function KanalenPage() {
  const user = await requireUser();
  const [berths, members] = await Promise.all([getBerths(), getMembers()]);
  const sorted = [...berths].sort((a, b) => a.number - b.number);

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Kanalen</h1>
      <p className="mt-2 mb-6 max-w-3xl text-muted">
        Det originale satellitkort er drejet, så Christianshavns Kanal ligger
        helt vandret. Numrene på kortet er klubbens officielle pladsnumre fra
        maillisten. De er fordelt langs kanalen som et første udkast — formand
        og næstformand kan trække dem hen på de rigtige både.
      </p>
      <img
        src="/maps/kanalen-foto.png"
        alt="Både langs bolværket i Christianshavns Kanal"
        className="mb-8 h-44 w-full rounded-2xl object-cover sm:h-56"
      />
      <CanalMap berths={sorted} members={members} user={user} />
    </div>
  );
}
