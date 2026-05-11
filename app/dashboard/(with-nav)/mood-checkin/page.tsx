import { MoodLogForm } from "./MoodLogForm";
import { MoodChart } from "./MoodChart";
import { getCachedUser, getCachedMoodLogs7Days } from "@/lib/dal";
import { SleepyDog } from "@/components/SleepyDog";

export default async function MoodCheckinPage() {
  const user = await getCachedUser();
  const moodLogs = await getCachedMoodLogs7Days(user.id);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <SleepyDog state="happy" size="sm" />
          <h1 className="text-xl font-extrabold text-bark-dark">기분 기록</h1>
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <MoodLogForm />
        </div>

        <div className="rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] p-6">
          <MoodChart moodPromise={Promise.resolve(moodLogs)} />
        </div>
      </div>
    </div>
  );
}
