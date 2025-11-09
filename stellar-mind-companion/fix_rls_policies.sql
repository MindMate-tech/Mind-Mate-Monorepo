-- Fix RLS Policies for Audio Upload
-- Run this SQL in your Supabase SQL Editor to fix RLS policy issues

-- ============================================
-- 1. Fix Storage Bucket RLS Policies
-- ============================================

-- Drop existing policies for audio_bucket if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;

-- Create permissive policies for audio_bucket
-- These allow anyone (including anonymous users) to upload and read from audio_bucket

-- Policy for INSERT (upload)
CREATE POLICY "Allow public uploads to audio_bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'audio_bucket'
);

-- Policy for SELECT (read/download)
CREATE POLICY "Allow public reads from audio_bucket"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'audio_bucket'
);

-- Policy for UPDATE (if needed)
CREATE POLICY "Allow public updates to audio_bucket"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'audio_bucket'
)
WITH CHECK (
  bucket_id = 'audio_bucket'
);

-- Policy for DELETE (if needed)
CREATE POLICY "Allow public deletes from audio_bucket"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'audio_bucket'
);

-- ============================================
-- 2. Alternative: Disable RLS on storage.objects (if above doesn't work)
-- ============================================
-- Uncomment the line below if you want to completely disable RLS for storage
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Verify audio_bucket exists and is public
-- ============================================

-- Check if bucket exists (this will show an error if it doesn't, which is fine)
-- You should create the bucket in the Supabase Dashboard if it doesn't exist

-- Make sure the bucket is set to public
-- You can do this in the Supabase Dashboard:
-- Storage → audio_bucket → Settings → Make it public

-- ============================================
-- 4. Alternative: Make bucket completely public via SQL
-- ============================================

-- Update bucket to be public (if it exists)
UPDATE storage.buckets
SET public = true
WHERE id = 'audio_bucket';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio_bucket', 'audio_bucket', true)
ON CONFLICT (id) DO UPDATE SET public = true;

