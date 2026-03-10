import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";
import { isOnboardingComplete } from "@/lib/types/supabase";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, age")
    .eq("id", user.id)
    .single();

  if (isOnboardingComplete(profile)) {
    redirect("/dashboard");
  }

  return (
    <div className="">
      <div className="m-8">
        <h1 className="">Onboarding</h1>
        <p className="">Complete your profile to get started</p>
        <div className="">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
