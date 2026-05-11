import { Skeleton } from "@/components/ui/skeleton";

export default function RecentSleepLogSkeleton() {
  return (
    <div className="pb-4 pt-6 border-b border-paw-brown-light/30 text-lg font-semibold text-zinc-900">
      최근 기록
      <Skeleton className="mt-2 h-6 w-50" />
    </div>
  );
}
