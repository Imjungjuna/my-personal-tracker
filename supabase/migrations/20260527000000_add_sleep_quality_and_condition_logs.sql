-- 1. sleep_logs에 sleep_quality 컬럼 추가
ALTER TABLE sleep_logs
  ADD COLUMN IF NOT EXISTS sleep_quality SMALLINT
    CHECK (sleep_quality BETWEEN 1 AND 5);

-- 2. condition_logs 테이블 생성
CREATE TABLE IF NOT EXISTS condition_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  log_date         DATE NOT NULL,
  mental_condition SMALLINT NOT NULL CHECK (mental_condition BETWEEN 1 AND 5),
  physical_energy  SMALLINT NOT NULL CHECK (physical_energy BETWEEN 1 AND 5),
  muscle_soreness  SMALLINT NOT NULL CHECK (muscle_soreness BETWEEN 1 AND 5),
  did_exercise     BOOLEAN NOT NULL DEFAULT false,
  yesterday_rpe    SMALLINT NOT NULL DEFAULT 0 CHECK (yesterday_rpe BETWEEN 0 AND 10),
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, log_date)
);

-- 3. RLS 활성화
ALTER TABLE condition_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 본인 데이터만 접근
CREATE POLICY "Users manage own condition logs"
  ON condition_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
