import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-700">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          대시보드
        </h1>
        <div className="flex items-center mt-1.5 text-base text-zinc-600 dark:text-zinc-400">
          <span>안녕하세요,</span>
          <Skeleton className="h-6 w-16 mx-1" />
          <span>님.</span>
        </div>
      </div>
    </header>
  );
}
