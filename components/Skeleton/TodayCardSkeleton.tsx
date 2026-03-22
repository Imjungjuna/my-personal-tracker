import { Skeleton } from "@/components/ui/skeleton";

export default function TodayCardSkeleton() {
  return (
    <section className="flex flex-1 flex-col pt-5 md:px-2">
      <div className="h-7 w-12 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        오늘
      </div>

      <ul className="mt-4 flex flex-1 flex-col space-y-0">
        {["수면 기록", "기분 체크인", "낮잠"].map((i) => (
          <li
            key={i}
            className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 first:pt-0"
          >
            <div className="h-6 w-20 text-base text-zinc-600 dark:text-zinc-400">
              {i}
            </div>

            <span className="flex items-center gap-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
