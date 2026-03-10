import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          로그인 오류
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          인증 코드 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
        </p>
        <Link
          href="/login"
          className="mt-6 flex h-10 items-center justify-center rounded-lg bg-zinc-900 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          로그인 페이지로
        </Link>
      </div>
    </div>
  )
}
