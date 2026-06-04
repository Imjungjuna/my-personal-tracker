// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/dashboard/calendar",
    label: "캘린더",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/checkin",
    label: "수면",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/mood-checkin",
    label: "기분",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth={2.5} />
      </svg>
    ),
  },
  {
    href: "/dashboard/nap-checkin",
    label: "낮잠",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/condition-checkin",
    label: "컨디션",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path d="M18 8c0 4-6 9-6 9S6 12 6 8a6 6 0 0112 0z" /><circle cx="12" cy="8" r="2" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[210px] shrink-0 bg-bark-dark min-h-screen px-3.5 py-6 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2.5 pb-5 mb-2 border-b border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFD97D" strokeWidth={1.8} className="w-5 h-5 shrink-0">
          <circle cx="12" cy="13" r="6" />
          <circle cx="6.5" cy="6.5" r="2" /><circle cx="17.5" cy="6.5" r="2" />
          <circle cx="3.5" cy="11" r="2" /><circle cx="20.5" cy="11" r="2" />
        </svg>
        <span className="text-warm-white font-bold text-sm">컨디션 트래커</span>
      </div>

      <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest px-2.5 py-2 mt-1">메뉴</p>

      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
              isActive
                ? "bg-sleepy-yellow text-bark-dark font-bold"
                : "text-white/60 hover:bg-white/[0.08] hover:text-warm-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}

      {/* General section */}
      <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest px-2.5 py-2 mt-4">일반</p>
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] text-sm font-medium text-white/35"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93A10 10 0 1112 2" />
        </svg>
        설정
      </Link>
    </aside>
  );
}
