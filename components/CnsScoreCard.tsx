import Link from "next/link";
import type { CnsStatus } from "@/lib/cns-score";

const STATUS_CONFIG: Record<
  CnsStatus,
  { bg: string; text: string; action: string }
> = {
  Optimal: {
    bg: "bg-green-100 text-green-800",
    text: "최상",
    action: "고강도 훈련 가능",
  },
  Recovered: {
    bg: "bg-blue-100 text-blue-800",
    text: "회복됨",
    action: "계획된 훈련 진행",
  },
  "Mild Fatigue": {
    bg: "bg-orange-100 text-orange-800",
    text: "가벼운 피로",
    action: "기술 위주 훈련 권장",
  },
  "High Fatigue": {
    bg: "bg-red-100 text-red-800",
    text: "고강도 피로",
    action: "완전 휴식 권장",
  },
};

export function CnsScoreCard({
  score,
  status,
}: {
  score: number | null;
  status: CnsStatus | null;
}) {
  if (score === null || status === null) {
    return (
      <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
        <h2 className="text-base font-extrabold text-bark-dark mb-2">
          💪 CNS 피로도
        </h2>
        <p className="text-sm text-bark-light mb-3">
          수면 기록과 컨디션 체크인을 완료하면 피로도 점수가 나타나요.
        </p>
        <Link
          href="/dashboard/condition-checkin"
          className="inline-block rounded-full bg-sleepy-yellow px-4 py-2 text-xs font-bold text-bark-dark hover:bg-sleepy-yellow-light transition"
        >
          컨디션 기록하기
        </Link>
      </section>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <section className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-5">
      <h2 className="text-base font-extrabold text-bark-dark mb-3">
        💪 CNS 피로도
      </h2>
      <div className="flex items-center gap-4">
        <span className="text-5xl font-extrabold text-bark-dark">{score}</span>
        <div className="flex flex-col gap-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${config.bg}`}
          >
            {config.text}
          </span>
          <span className="text-xs text-bark-mid">{config.action}</span>
        </div>
      </div>
      <Link
        href="/dashboard/condition-checkin"
        className="mt-3 inline-block rounded-full bg-sleepy-yellow px-4 py-2 text-xs font-bold text-bark-dark hover:bg-sleepy-yellow-light transition"
      >
        수정하기
      </Link>
    </section>
  );
}
