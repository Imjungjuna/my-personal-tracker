import { GoogleSignInButton } from "./GoogleSignInButton";
import { SleepyDog } from "@/components/SleepyDog";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="flex flex-col items-center gap-0 w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <SleepyDog state="sleeping" size="md" />

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-bark-dark">로그인</h1>
            <p className="text-bark-mid text-sm font-medium">
              계속하려면 로그인하세요
            </p>
          </div>
        </div>
        <div className="w-full rounded-3xl bg-cream p-4">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
