import { DocumentArchive } from "@/components/DocumentArchive";
import { requireUser } from "@/lib/auth-guard";
import { getDocuments } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DokumenterPage() {
  const user = await requireUser();
  const documents = [...(await getDocuments())].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Dokumenter</h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted">
        Vedtægter, referater, regnskab og øvrige papirer til bestyrelsen.
        Alle i bestyrelsen kan uploade. Kun formand og næstformand kan slette.
      </p>
      <DocumentArchive documents={documents} user={user} />
    </div>
  );
}
