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
        Kanalen er delt i to: Bolværket og strækningen bag Torvegade. Numrene
        er klubbens officielle pladsnumre. Alle i bestyrelsen kan trække dem
        hen på de rigtige både.
      </p>
      <CanalMap berths={sorted} members={members} user={user} />
    </div>
  );
}
