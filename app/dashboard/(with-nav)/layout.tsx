import Link from 'next/link'

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            대시보드
          </Link>
          <Link
            href="/dashboard/checkin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            수면 기록
          </Link>
          <Link
            href="/dashboard/mood-checkin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            기분 기록
          </Link>
          <Link
            href="/dashboard/nap-checkin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            낮잠 기록
          </Link>
        </div>
      </nav>
      {children}
    </>
  )
}
