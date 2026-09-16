"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("formand@bkbolvaerket.dk");
  const [password, setPassword] = useState("Christianshavn1985");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke logge ind.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 outline-none ring-brass/40 focus:ring-2"
          autoComplete="username"
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Adgangskode</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 outline-none ring-brass/40 focus:ring-2"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-navy py-2.5 text-sand transition hover:bg-navy-deep disabled:opacity-60"
      >
        {pending ? "Logger ind…" : "Log ind"}
      </button>
    </form>
  );
}
