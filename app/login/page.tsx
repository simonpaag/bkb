import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-deep">
      <img
        src="/maps/kanalen-foto.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-deep via-navy/80 to-canal/40" />
      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-5 py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          <div className="text-sand">
            <Logo light href={null} />
            <h1 className="font-serif mt-10 max-w-md text-5xl leading-tight">
              Christianshavns Kanal, set fra bestyrelsen.
            </h1>
            <p className="mt-5 max-w-md text-sand/75">
              Medlemmer, bådpladser og dokumenter for Bådklubben Bolværket —
              stiftet 18. maj 1985.
            </p>
          </div>
          <div className="paper-card w-full max-w-md rounded-2xl p-8">
            <h2 className="font-serif text-3xl text-navy">Log ind</h2>
            <p className="mt-2 mb-6 text-sm text-muted">
              Adgang kun for bestyrelsen.
            </p>
            <LoginForm />
            <div className="gold-rule my-6" />
            <p className="text-xs leading-5 text-muted">
              Log ind med din e-mail i bestyrelsen.
              <br />
              Adgangskode indtil videre:{" "}
              <span className="text-navy">Christianshavn1985</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
