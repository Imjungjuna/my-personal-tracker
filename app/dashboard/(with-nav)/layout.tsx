"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "🏠 홈" },
  { href: "/dashboard/checkin", label: "🌙 수면" },
  { href: "/dashboard/mood-checkin", label: "🐾 기분" },
  { href: "/dashboard/nap-checkin", label: "💤 낮잠" },
];

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-paw-brown-light bg-warm-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl gap-1 px-4 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? "bg-sleepy-yellow text-bark-dark"
                    : "text-bark-mid hover:bg-sleepy-yellow-light hover:text-bark-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </>
  );
}
