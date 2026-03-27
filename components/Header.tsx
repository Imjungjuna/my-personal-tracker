import { getCachedUser } from "@/lib/dal";

export default async function UserHeader() {
  const user = await getCachedUser();

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "사용자";

  return (
    <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-700">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          대시보드
        </h1>
        <p className="mt-1.5 text-base text-zinc-600 dark:text-zinc-400">
          안녕하세요,{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {displayName}
          </strong>
          님.
        </p>
      </div>
    </header>
  );
}
