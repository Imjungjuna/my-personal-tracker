import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center gap-4 justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Hello Sleepy Dog!</h1>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
