-- ============================================
-- SESSIONS STUDY OS — Supabase Migration Script
-- Run this entire script in your Supabase Dashboard SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  total_focus_seconds BIGINT NOT NULL DEFAULT 0,
  exp BIGINT NOT NULL DEFAULT 0,
  total_sessions INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read profiles (needed for display names in chat/rooms)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete own profile (account deletion)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'Student'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. ROOMS TABLE
-- ============================================
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  join_code TEXT UNIQUE,
  focus_duration INT NOT NULL DEFAULT 1500,       -- 25 min in seconds
  break_duration INT NOT NULL DEFAULT 300,        -- 5 min in seconds
  long_break_duration INT NOT NULL DEFAULT 900,   -- 15 min in seconds
  long_break_interval INT NOT NULL DEFAULT 4,     -- long break every N focus blocks
  timer_status TEXT NOT NULL DEFAULT 'idle' CHECK (timer_status IN ('idle', 'focus', 'break', 'long_break')),
  timer_started_at TIMESTAMPTZ,
  cycles_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read public rooms (Discovery Lobby)
CREATE POLICY "Public rooms are viewable by authenticated users"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (
    visibility = 'public'
    OR host_id = auth.uid()
    OR id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
  );

-- Any authenticated user can create a room
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Only the host can update (timer controls, settings)
CREATE POLICY "Host can update room"
  ON public.rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Only the host can delete/archive
CREATE POLICY "Host can delete room"
  ON public.rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Function: generate short join code for private rooms
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.visibility = 'private' AND NEW.join_code IS NULL THEN
    LOOP
      -- Generate 6-char uppercase alphanumeric code
      new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
      -- Check uniqueness
      SELECT EXISTS(SELECT 1 FROM public.rooms WHERE join_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.join_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_room_created_generate_code
  BEFORE INSERT ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.generate_join_code();

-- ============================================
-- 3. ROOM PARTICIPANTS TABLE
-- ============================================
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Participants can see who else is in the room
CREATE POLICY "Room members can view participants"
  ON public.room_participants FOR SELECT
  TO authenticated
  USING (
    room_id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
    OR room_id IN (SELECT id FROM public.rooms WHERE visibility = 'public')
  );

-- Users can join rooms (insert own participant row)
CREATE POLICY "Users can join rooms"
  ON public.room_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can leave rooms (delete own participant row)
CREATE POLICY "Users can leave rooms"
  ON public.room_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Global messages (room_id IS NULL): any authenticated user
-- Room messages: only participants
CREATE POLICY "Users can read accessible messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    room_id IS NULL
    OR room_id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
  );

-- Users can send global messages or messages in rooms they're in
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      room_id IS NULL
      OR room_id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
    )
  );

-- Messages are immutable — no UPDATE or DELETE policies

-- ============================================
-- 5. TASKS TABLE
-- ============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. FOCUS COMPLETION TRIGGER
-- Credits EXP + stats to all room participants
-- when timer transitions from 'focus' to 'break' or 'long_break'
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_focus_complete()
RETURNS TRIGGER AS $$
DECLARE
  elapsed_seconds INT;
  earned_exp INT;
BEGIN
  -- Only fire when timer_status changes FROM 'focus' TO 'break' or 'long_break'
  IF OLD.timer_status = 'focus' AND NEW.timer_status IN ('break', 'long_break') THEN
    -- Calculate actual elapsed focus time
    elapsed_seconds := EXTRACT(EPOCH FROM (now() - OLD.timer_started_at))::INT;
    -- Cap at configured focus duration (prevent overcounting)
    IF elapsed_seconds > OLD.focus_duration THEN
      elapsed_seconds := OLD.focus_duration;
    END IF;

    -- Calculate EXP: base 100 + bonus for longer sessions
    earned_exp := 100 + (elapsed_seconds / 60) * 4;

    -- Credit all current participants
    UPDATE public.profiles
    SET
      total_focus_seconds = total_focus_seconds + elapsed_seconds,
      exp = exp + earned_exp,
      total_sessions = total_sessions + 1,
      last_active_date = CURRENT_DATE,
      streak_days = CASE
        WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
        WHEN last_active_date = CURRENT_DATE THEN streak_days
        ELSE 1
      END,
      updated_at = now()
    WHERE id IN (
      SELECT user_id FROM public.room_participants WHERE room_id = NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_timer_status_change
  AFTER UPDATE OF timer_status ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_focus_complete();

-- ============================================
-- 7. ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_rooms_visibility ON public.rooms(visibility) WHERE visibility = 'public';
CREATE INDEX idx_rooms_join_code ON public.rooms(join_code) WHERE join_code IS NOT NULL;
CREATE INDEX idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user ON public.room_participants(user_id);
CREATE INDEX idx_messages_room ON public.messages(room_id, created_at DESC);
CREATE INDEX idx_messages_global ON public.messages(created_at DESC) WHERE room_id IS NULL;
CREATE INDEX idx_tasks_user ON public.tasks(user_id);
CREATE INDEX idx_tasks_user_room ON public.tasks(user_id, room_id);
