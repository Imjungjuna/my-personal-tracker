export default function Last7DaysCardSkeleton() {
  return (
    <section className="flex flex-1 flex-col pt-5 mb-5 md:mb-0 md:px-2">
      <div className="h-7 w-20 rounded bg-zinc-200 animate-pulse dark:bg-zinc-800"></div>

      <ul className="mt-4 flex flex-1 flex-col space-y-0 h-20">
        {[1, 2, 3].map((i) => (
          <li
            key={i}
            className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 first:pt-0"
          >
            <div className="h-6 w-20 rounded bg-zinc-200 animate-pulse dark:bg-zinc-800"></div>

            <div className="h-6 w-24 rounded bg-zinc-200 animate-pulse dark:bg-zinc-800"></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
