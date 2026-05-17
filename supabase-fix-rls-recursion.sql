-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- Problem: room_participants SELECT policy references itself,
-- causing "infinite recursion detected in policy" errors.
-- Solution: SECURITY DEFINER functions bypass RLS for cross-table lookups.
-- 
-- Run this ONCE in your Supabase SQL Editor.
-- ============================================

-- STEP 1: Create helper functions that bypass RLS
-- These run as the function owner (superuser), so they skip policy checks.

CREATE OR REPLACE FUNCTION public.get_my_room_ids()
RETURNS SETOF UUID AS $$
  SELECT room_id FROM public.room_participants WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_public_room(p_room_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.rooms WHERE id = p_room_id AND visibility = 'public');
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- STEP 2: Drop ALL broken policies that cause the recursion

DROP POLICY IF EXISTS "Public rooms are viewable by authenticated users" ON public.rooms;
DROP POLICY IF EXISTS "Room members can view participants" ON public.room_participants;
DROP POLICY IF EXISTS "Users can read accessible messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;


-- STEP 3: Recreate policies using the helper functions (no more direct cross-table subqueries)

-- ROOMS: can see public rooms, rooms you host, or rooms you're in
CREATE POLICY "Public rooms are viewable by authenticated users"
  ON public.rooms FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR host_id = auth.uid()
    OR id IN (SELECT public.get_my_room_ids())
  );

-- ROOM PARTICIPANTS: can see participants in rooms you're in, or in public rooms
CREATE POLICY "Room members can view participants"
  ON public.room_participants FOR SELECT TO authenticated
  USING (
    room_id IN (SELECT public.get_my_room_ids())
    OR public.is_public_room(room_id)
  );

-- MESSAGES: can read global messages (room_id IS NULL) or messages in your rooms
CREATE POLICY "Users can read accessible messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    room_id IS NULL
    OR room_id IN (SELECT public.get_my_room_ids())
  );

-- MESSAGES: can send global messages or messages in rooms you're in
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      room_id IS NULL
      OR room_id IN (SELECT public.get_my_room_ids())
    )
  );
