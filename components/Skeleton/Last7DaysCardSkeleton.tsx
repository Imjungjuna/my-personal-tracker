import { Skeleton } from "../ui/skeleton";

export default function Last7DaysCardSkeleton() {
  return (
    <section className="flex flex-1 flex-col pt-5 mb-5 md:mb-0 md:px-2">
      <div className="h-7 w-20 text-lg font-semibold text-zinc-900">
        최근 7일
      </div>

      <ul className="mt-4 flex flex-1 flex-col space-y-0 h-20">
        {["평균 수면", "평균 기분", "낮잠"].map((i) => (
          <li
            key={i}
            className="flex flex-1 items-center justify-between py-4 border-b border-paw-brown-light/30 first:pt-0 text-base text-zinc-600"
          >
            {i}

            <Skeleton className="h-6 w-24" />
          </li>
        ))}
      </ul>
    </section>
  );
}
