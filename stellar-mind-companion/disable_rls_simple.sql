-- Simple: Disable RLS for Storage (Quick Fix)
-- Run this in Supabase SQL Editor to completely disable RLS for storage uploads

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Make sure audio_bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio_bucket', 'audio_bucket', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Verify bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'audio_bucket';

