import { getCachedUser } from "@/lib/dal";

export default async function UserHeader() {
  const user = await getCachedUser();

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "사용자";

  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <header className="px-4 pt-6 pb-2">
      <p className="text-bark-mid text-sm font-medium">{dateStr}</p>
      <h1 className="text-2xl font-extrabold text-bark-dark mt-0.5">
        안녕하세요, {displayName}님 🐾
      </h1>
    </header>
  );
}
