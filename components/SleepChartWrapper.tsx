import { getCachedUser, getCachedSleepLogs7Days } from "@/lib/dal";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";

export default async function SleepChartWrapper() {
  const user = await getCachedUser();

  const sleepPromise = getCachedSleepLogs7Days(user.id);

  return <SleepCharts sleepPromise={sleepPromise} />;
}

//수면 기록은 원래 쿼리에 lte로 오늘 날짜까지 제한하는 조건이 있었어. DAL 함수는 gte 조건만 가지고 있으니, 자바스크립트의 filter 메서드를 사용해서 오늘 날짜 이후의 미래 데이터가 있다면 걸러내도록 처리했어.
