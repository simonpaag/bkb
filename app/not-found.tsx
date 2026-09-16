import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <h1 className="font-serif text-4xl text-navy">Siden findes ikke</h1>
      <p className="mt-3 text-muted">Siden er flyttet, eller adressen er forkert.</p>
      <Link href="/" className="mt-6 text-canal hover:underline">
        Tilbage til oversigten
      </Link>
    </div>
  );
}
