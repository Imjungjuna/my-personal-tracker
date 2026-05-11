import { OnboardingForm } from "./OnboardingForm";
import { SleepyDog } from "@/components/SleepyDog";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-8">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <SleepyDog state="tilting" size="md" />
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-bark-dark">
            안녕하세요! 🐾
          </h1>
          <p className="text-bark-mid text-sm mt-1 font-medium">
            몇 가지만 알려주세요
          </p>
        </div>
        <div className="w-full rounded-3xl bg-warm-white shadow-[0_4px_24px_rgba(200,149,108,0.12)] overflow-hidden">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
