/*
  # 每日打卡PWA 数据库架构

  ## 新建表
  - `habits` - 习惯/打卡项目表
    - id, user_id, name, description, icon, color, frequency, target_days, created_at, is_active
  - `checkins` - 打卡记录表  
    - id, habit_id, user_id, check_date, note, created_at
  - `user_profiles` - 用户档案表
    - id, user_id, nickname, avatar_url, created_at, updated_at, streak_days, total_checkins

  ## 安全设置
  - 所有表启用 RLS
  - 用户只能访问自己的数据

  ## 说明
  - habits.frequency: daily/weekly/custom
  - habits.color: 16进制颜色值
  - checkins.check_date: 打卡日期 (date类型)
*/

-- 用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text DEFAULT '',
  avatar_url text DEFAULT '',
  streak_days integer DEFAULT 0,
  total_checkins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 习惯表
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '⭐',
  color text DEFAULT '#3B82F6',
  frequency text DEFAULT 'daily',
  target_days integer DEFAULT 7,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 打卡记录表
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, check_date)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_habit_id ON checkins(habit_id);
CREATE INDEX IF NOT EXISTS idx_checkins_check_date ON checkins(check_date);
CREATE INDEX IF NOT EXISTS idx_checkins_habit_date ON checkins(habit_id, check_date);
