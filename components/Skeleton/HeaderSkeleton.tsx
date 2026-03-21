export default function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-700">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          대시보드
        </h1>
        <p className="mt-1.5 text-base text-zinc-600 dark:text-zinc-400">
          안녕하세요,{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">예시</strong>
          님.
        </p>
      </div>
      <div className="items-center gap-3 hidden">
        <div className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          수면 기록하기
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
          기분 기록하기
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
          낮잠 기록하기
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
          로그아웃
        </div>
      </div>
    </header>
  );
}
