import Link from "next/link";

export function Logo({
  light = false,
  href = "/",
}: {
  light?: boolean;
  href?: string | null;
}) {
  const mark = (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt=""
        width={48}
        height={48}
        className={`h-12 w-12 rounded-full object-contain ${
          light ? "bg-sand p-0.5" : "bg-white"
        }`}
      />
      <div className="leading-tight">
        <div
          className={`font-serif text-lg tracking-wide ${light ? "text-sand" : "text-navy"}`}
        >
          B/K Bolværket
        </div>
        <div
          className={`text-[11px] uppercase tracking-[0.22em] ${light ? "text-brass" : "text-muted"}`}
        >
          Bestyrelsens intranet
        </div>
      </div>
    </div>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex">
      {mark}
    </Link>
  );
}
