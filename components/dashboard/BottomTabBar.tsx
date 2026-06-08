// components/dashboard/BottomTabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_ITEMS = [
  { href: "/dashboard", label: "대시보드", exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/calendar", label: "캘린더",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { href: "/check-in/sleep", label: "수면", exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  { href: "/check-in/mood", label: "기분", exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2}/><line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2}/></svg> },
  { href: "/check-in/nap", label: "낮잠", exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { href: "/check-in/condition", label: "컨디션", exact: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 8c0 4-6 9-6 9S6 12 6 8a6 6 0 0112 0z"/><circle cx="12" cy="8" r="2"/></svg> },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="메인 탐색" className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-t border-[#EDE0D0]/60">
      <div className="flex">
        {TAB_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? "text-paw-brown font-bold" : "text-bark-light"
              }`}
            >
              <span className="p-1">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
