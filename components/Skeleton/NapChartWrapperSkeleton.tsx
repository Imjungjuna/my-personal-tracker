import { Skeleton } from "@/components/ui/skeleton";

export default function NapChartWrapperSkeleton() {
  return (
    <div className="pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        최근 낮잠
      </h3>
      <Skeleton className="mt-4 h-64" />
    </div>
  );
}
