-- scripts/seed-sample-data.sql
-- Run in Supabase SQL editor after replacing <USER_ID> with your auth.users UUID

DO $$
DECLARE
  uid UUID := '<USER_ID>'; -- replace with your user ID
  base_date DATE := CURRENT_DATE - INTERVAL '29 days';
  i INT;
  d DATE;
  bed_ts TIMESTAMPTZ;
  wake_ts TIMESTAMPTZ;
  sleep_h NUMERIC;
  nap_start TIMESTAMPTZ;
BEGIN
  -- Ensure profile exists
  INSERT INTO profiles (id, has_narcolepsy, age, gender, usual_sleep_quality, usual_bed_time, usual_wake_time, usual_nap_duration_minutes)
  VALUES (uid, false, 28, 'male', 3, '23:00:00', '07:00:00', 20)
  ON CONFLICT (id) DO NOTHING;

  FOR i IN 0..29 LOOP
    d := base_date + i;

    -- Sleep log (vary 5.5h–8.5h)
    sleep_h := 5.5 + (random() * 3);
    bed_ts  := (d - INTERVAL '1 day') + TIME '23:00:00' + (random() * INTERVAL '2 hours') - INTERVAL '1 hour';
    wake_ts := bed_ts + (sleep_h * INTERVAL '1 hour');
    INSERT INTO sleep_logs (user_id, wake_date, bed_time, wake_time, sleep_quality)
    VALUES (uid, d, bed_ts AT TIME ZONE 'Asia/Seoul', wake_ts AT TIME ZONE 'Asia/Seoul',
            1 + floor(random() * 5)::INT)
    ON CONFLICT DO NOTHING;

    -- Condition log
    INSERT INTO condition_logs (user_id, log_date, mental_condition, physical_energy, muscle_soreness, did_exercise, yesterday_rpe)
    VALUES (uid, d,
            1 + floor(random() * 5)::INT,
            1 + floor(random() * 5)::INT,
            1 + floor(random() * 5)::INT,
            random() > 0.4,
            floor(random() * 11)::INT)
    ON CONFLICT DO NOTHING;

    -- Mood logs (2 per day)
    INSERT INTO mood_logs (user_id, score, log_time)
    VALUES
      (uid, 1 + floor(random() * 5)::INT, (d + TIME '08:00:00') AT TIME ZONE 'Asia/Seoul'),
      (uid, 1 + floor(random() * 5)::INT, (d + TIME '14:00:00') AT TIME ZONE 'Asia/Seoul');

    -- Nap log (60% of days)
    IF random() > 0.4 THEN
      nap_start := (d + TIME '13:00:00') AT TIME ZONE 'Asia/Seoul';
      INSERT INTO nap_logs (user_id, start_time, end_time)
      VALUES (uid, nap_start, nap_start + INTERVAL '20 minutes');
    END IF;
  END LOOP;
END $$;
