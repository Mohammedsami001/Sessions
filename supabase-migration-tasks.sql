-- ============================================
-- SESSIONS STUDY OS — Supabase Migration Script (Tasks Update)
-- Run this script in your Supabase Dashboard SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================

-- 1. ADD NEW COLUMNS TO TASKS TABLE
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'global' CHECK (scope IN ('global', 'room')),
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sub_tasks JSONB DEFAULT '[]'::jsonb;

-- 2. DROP OLD TASKS POLICIES
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;

-- 3. CREATE NEW TASKS RLS POLICIES FOR COLLABORATION
-- Users can view their own tasks, OR tasks that belong to a room they are currently in.
CREATE POLICY "Users can view accessible tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (room_id IS NOT NULL AND room_id IN (SELECT public.get_my_room_ids()))
  );

-- Users can update their own tasks, OR tasks that belong to a room they are currently in.
CREATE POLICY "Users can update accessible tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR (room_id IS NOT NULL AND room_id IN (SELECT public.get_my_room_ids()))
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (room_id IS NOT NULL AND room_id IN (SELECT public.get_my_room_ids()))
  );
