import { getCachedUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const GENDER_LABEL: Record<string, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
};

const SLEEP_QUALITY_LABEL: Record<number, string> = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

function formatTime(t: string | null): string {
  if (!t) return "—";
  return t.slice(0, 5); // "HH:MM:SS" → "HH:MM"
}

function formatNap(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes === 0) return "안 잠";
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

export default async function ProfilePage() {
  const user = await getCachedUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "age, gender, usual_bed_time, usual_wake_time, usual_sleep_quality, usual_nap_duration_minutes, has_narcolepsy"
    )
    .eq("id", user.id)
    .single();

  const username = user.email?.split("@")[0] ?? "사용자";

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-md px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-warm-white border border-[#E8D5C0] text-bark-mid hover:bg-[#F0E4D4] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-[17px] font-bold text-bark-dark">프로필</h1>
        </div>

        {/* 사용자 정보 */}
        <div className="rounded-2xl bg-warm-white border border-[#E8D5C0] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-paw-brown flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FDF6EC" strokeWidth={2} className="w-6 h-6">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold text-bark-dark">{username}</p>
            <p className="text-[12px] text-bark-mid">{user.email}</p>
          </div>
        </div>

        {/* 온보딩 정보 */}
        <div className="rounded-2xl bg-warm-white border border-[#E8D5C0] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#F0E4D4]">
            <p className="text-[12px] font-bold text-bark-mid uppercase tracking-wide">기본 정보</p>
          </div>
          <ProfileRow label="나이" value={profile?.age != null ? `${profile.age}세` : "—"} />
          <ProfileRow
            label="성별"
            value={profile?.gender ? GENDER_LABEL[profile.gender] ?? profile.gender : "—"}
          />
        </div>

        {/* 수면 정보 */}
        <div className="rounded-2xl bg-warm-white border border-[#E8D5C0] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#F0E4D4]">
            <p className="text-[12px] font-bold text-bark-mid uppercase tracking-wide">수면 패턴</p>
          </div>
          <ProfileRow label="평소 취침 시간" value={formatTime(profile?.usual_bed_time ?? null)} />
          <ProfileRow label="평소 기상 시간" value={formatTime(profile?.usual_wake_time ?? null)} />
          <ProfileRow
            label="평소 수면 질"
            value={
              profile?.usual_sleep_quality != null
                ? `${profile.usual_sleep_quality} / 5 · ${SLEEP_QUALITY_LABEL[profile.usual_sleep_quality]}`
                : "—"
            }
          />
          <ProfileRow label="평소 낮잠 시간" value={formatNap(profile?.usual_nap_duration_minutes ?? null)} />
          <ProfileRow
            label="기면증"
            value={profile?.has_narcolepsy ? "있음" : "없음"}
            last
          />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-3.5 ${
        !last ? "border-b border-[#F5EDE0]" : ""
      }`}
    >
      <span className="text-[13px] text-bark-mid">{label}</span>
      <span className="text-[13px] font-semibold text-bark-dark">{value}</span>
    </div>
  );
}
