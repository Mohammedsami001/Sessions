-- Allow room hosts to delete ALL participants (needed for room deletion)
-- Run this in your Supabase SQL Editor.

DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_participants;

CREATE POLICY "Users can leave rooms"
  ON public.room_participants FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR room_id IN (SELECT id FROM public.rooms WHERE host_id = auth.uid())
  );
