import { GoogleSignInButton } from "./GoogleSignInButton";
import { SleepyDog } from "@/components/SleepyDog";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 gap-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <SleepyDog state="sleeping" size="md" />

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-bark-dark">로그인</h1>
          <p className="text-bark-mid text-sm font-medium">
            계속하려면 로그인하세요
          </p>
        </div>

        <div className="w-full rounded-3xl bg-warm-white p-8 shadow-[0_4px_24px_rgba(200,149,108,0.12)]">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
