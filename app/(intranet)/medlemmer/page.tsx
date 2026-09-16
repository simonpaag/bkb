import { MemberDirectory } from "@/components/MemberDirectory";
import { requireUser } from "@/lib/auth-guard";
import { getBerths, getMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MedlemmerPage() {
  const user = await requireUser();
  const [members, berths] = await Promise.all([getMembers(), getBerths()]);
  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name, "da"));

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Medlemmer</h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted">
        Navn, båd, billede og medlemstype. Ventelisten er begrænset til 10
        personer, jf. vedtægterne.
      </p>
      <MemberDirectory members={sorted} berths={berths} user={user} />
    </div>
  );
}
