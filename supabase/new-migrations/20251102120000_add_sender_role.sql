-- Add sender_role column to messages so clients can mark whether a message is from the user or assistant.
-- This keeps RLS intact (sender_id still must match auth.uid()), while allowing the UI to reliably render left/right.

ALTER TABLE IF EXISTS public.messages
  ADD COLUMN IF NOT EXISTS sender_role text;

-- Update replica identity to include the new column if needed (keeps realtime stable)
ALTER TABLE public.messages REPLICA IDENTITY FULL;
