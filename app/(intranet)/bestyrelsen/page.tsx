import { BoardUsers } from "@/components/BoardUsers";
import { requireAdminUser } from "@/lib/auth-guard";
import { getUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function BestyrelsenPage() {
  const user = await requireAdminUser();
  const users = await getUsers();
  const safe = users.map(({ passwordHash: _passwordHash, ...rest }) => rest);

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Bestyrelsen</h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted">
        Adgang til intranettet. Bestyrelsen består af fem medlemmer og
        konstituerer sig med formand, næstformand, sekretær og kasserer.
      </p>
      <BoardUsers users={safe} currentUserId={user.id} />
    </div>
  );
}
