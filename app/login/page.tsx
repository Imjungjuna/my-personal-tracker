import { GoogleSignInButton } from "./GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            로그인
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            계정으로 로그인하여 계속하세요
          </p>
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
