// components/dashboard/CheckinButtons.tsx
import Link from "next/link";
import { getTodayCheckinStatus, getCachedUser } from "@/lib/dal";

const ITEMS = [
  { key: "sleep",     label: "수면",          href: "/dashboard/checkin" },
  { key: "mood",      label: "기분",          href: "/dashboard/mood-checkin" },
  { key: "nap",       label: "낮잠",          href: "/dashboard/nap-checkin" },
  { key: "condition", label: "컨디션 기록하기", href: "/dashboard/condition-checkin" },
] as const;

export async function CheckinButtons() {
  const user = await getCachedUser();
  const status = await getTodayCheckinStatus(user.id);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[11px] font-semibold text-bark-mid uppercase tracking-wider mr-1">
        오늘 체크인
      </span>
      {ITEMS.map((item) => {
        const done = status[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`px-3.5 py-2 rounded-[10px] text-xs font-medium transition-colors ${
              done
                ? "bg-[#F5EDE0] border border-[#E8D5C0] text-bark-mid"
                : "bg-bark-dark text-sleepy-yellow font-bold"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
