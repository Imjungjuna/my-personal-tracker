import Link from "next/link";
import { SleepyDog } from "@/components/SleepyDog";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream gap-8 px-4">
      <div className="flex flex-col items-center gap-6">
        <SleepyDog state="sleeping" size="lg" />

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-bark-dark tracking-tight">
            Hello, Sleepy Dog! 🌙
          </h1>
          <p className="text-bark-mid text-lg font-medium">
            오늘의 수면과 기분을 기록해보세요
          </p>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-paw-brown px-8 py-3 text-base font-bold text-warm-white shadow-md transition hover:bg-paw-brown-light hover:text-bark-dark"
        >
          시작하기 →
        </Link>
      </div>
    </main>
  );
}
