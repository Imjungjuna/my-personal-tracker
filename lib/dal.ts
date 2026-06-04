import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOnboardingComplete } from "@/lib/types/supabase";
import { getISODaysAgo, getLogTimeFromDaysAgo, getTodayISO, getTodayStartTs } from "@/utils/date";

export const verifySessionUsingGetClaims = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) {
    redirect("/login");
  }

  return { isAuth: true, data };
});

export const getUserProfile = cache(async () => {
  const user = await getCachedUser();
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
  async (userId: string, fromDate: string = getISODaysAgo(6)) => {
    const supabase = await createClient();

    const { data } = await supabase
      .from("sleep_logs")
      .select("wake_date, bed_time, wake_time, sleep_quality")
      .eq("user_id", userId)
      .gte("wake_date", fromDate)
      .order("wake_date", { ascending: false });

    return data ?? [];
  },
);

export const getCachedMoodLogs7Days = cache(
  async (userId: string, fromTs: string = getLogTimeFromDaysAgo(6)) => {
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
  async (userId: string, fromTs: string = getLogTimeFromDaysAgo(6)) => {
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
  const supabase = await createClient()
  const { data } = await supabase
    .from('sleep_logs')
    .select('wake_date, bed_time, wake_time, sleep_quality')
    .eq('user_id', userId)
    .order('wake_date', { ascending: false })
    .limit(1)
  return data?.[0] ?? null
})

export const getTodaySleepLog = cache(async (userId: string, todayISO: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sleep_logs')
    .select('wake_date, bed_time, wake_time, sleep_quality')
    .eq('user_id', userId)
    .eq('wake_date', todayISO)
    .single()
  return data ?? null
})

export const getTodayConditionLog = cache(async (userId: string, todayISO: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('condition_logs')
    .select('id, user_id, log_date, mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe, created_at')
    .eq('user_id', userId)
    .eq('log_date', todayISO)
    .single()
  return data ?? null
})

export const getCachedConditionLogs7Days = cache(
  async (userId: string, fromDate: string = getISODaysAgo(6)) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("condition_logs")
      .select("log_date, mental_condition, physical_energy, muscle_soreness")
      .eq("user_id", userId)
      .gte("log_date", fromDate)
      .order("log_date", { ascending: true });
    return data ?? [];
  },
);

export const getTodayCheckinStatus = cache(async (userId: string) => {
  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();
  const supabase = await createClient();

  const [sleep, condition, mood, nap] = await Promise.all([
    supabase.from("sleep_logs").select("id").eq("user_id", userId).eq("wake_date", todayISO).maybeSingle(),
    supabase.from("condition_logs").select("id").eq("user_id", userId).eq("log_date", todayISO).maybeSingle(),
    supabase.from("mood_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("log_time", todayStartTs),
    supabase.from("nap_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("start_time", todayStartTs),
  ]);

  return {
    sleep:     !!sleep.data,
    condition: !!condition.data,
    mood:      (mood.count ?? 0) > 0,
    nap:       (nap.count ?? 0) > 0,
  };
});

export const getMonthLogs = cache(
  async (userId: string, year: number, month: number) => {
    const supabase = await createClient();
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const startTs = new Date(`${startDate}T00:00:00+09:00`).toISOString();
    const endTs   = new Date(`${endDate}T23:59:59+09:00`).toISOString();

    const [sleepLogs, conditionLogs, moodLogs, napLogs] = await Promise.all([
      supabase.from("sleep_logs").select("wake_date, bed_time, wake_time, sleep_quality").eq("user_id", userId).gte("wake_date", startDate).lte("wake_date", endDate),
      supabase.from("condition_logs").select("log_date, mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe").eq("user_id", userId).gte("log_date", startDate).lte("log_date", endDate),
      supabase.from("mood_logs").select("log_time, score").eq("user_id", userId).gte("log_time", startTs).lte("log_time", endTs),
      supabase.from("nap_logs").select("start_time, end_time").eq("user_id", userId).gte("start_time", startTs).lte("start_time", endTs),
    ]);

    return {
      sleepLogs:     sleepLogs.data     ?? [],
      conditionLogs: conditionLogs.data ?? [],
      moodLogs:      moodLogs.data      ?? [],
      napLogs:       napLogs.data       ?? [],
    };
  },
);
