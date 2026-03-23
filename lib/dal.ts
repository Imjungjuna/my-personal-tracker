import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOnboardingComplete } from "@/lib/types/supabase";

export const verifySessionUsingGetUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { isAuth: true, user };
});

export const verifySessionUsingGetClaims = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) {
    redirect("/login");
  }

  return { isAuth: true, data };
});

export const getUserProfile = cache(async () => {
  const { user } = await verifySessionUsingGetUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, age")
    .eq("id", user.id)
    .single();

  if (!isOnboardingComplete(profile ?? null)) {
    redirect("/onboarding?next=/dashboard/mood-checkin");
  }

  return profile;
});

//below code is new dal

export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
});

export const getCachedSleepLogs7Days = cache(
  async (userId: string, fromDate: string) => {
    console.log("DB 통신 발생: getCachedSleepLogs7Days 호출됨"); // 여기에 추가
    const supabase = await createClient();

    const { data } = await supabase
      .from("sleep_logs")
      .select("sleep_date, bed_time, wake_time")
      .eq("user_id", userId)
      .gte("sleep_date", fromDate)
      .order("sleep_date", { ascending: false });

    return data ?? [];
  },
);

export const getCachedMoodLogs7Days = cache(
  async (userId: string, fromTs: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("mood_logs")
      .select("log_time, score")
      .eq("user_id", userId)
      .gte("log_time", fromTs)
      .order("log_time", { ascending: false });

    return data ?? [];
  },
);

export const getCachedNapLogs7Days = cache(
  async (userId: string, fromTs: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("nap_logs")
      .select("start_time, end_time")
      .eq("user_id", userId)
      .gte("start_time", fromTs)
      .order("start_time", { ascending: false });

    return data ?? [];
  },
);

export const getLatestSleepLog = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sleep_logs")
    .select("sleep_date, bed_time, wake_time")
    .eq("user_id", userId)
    .order("sleep_date", { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
});
