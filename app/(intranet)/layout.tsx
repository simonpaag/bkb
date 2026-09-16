import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/auth-guard";

export default async function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {children}
      </main>
      <footer className="border-t border-navy/10 py-6 text-center text-xs text-muted">
        B/K Bolværket · Christianshavn · Bestyrelsens intranet
      </footer>
    </div>
  );
}
