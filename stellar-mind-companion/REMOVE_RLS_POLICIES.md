# Fix RLS Policy Issues for Audio Upload

## Problem

You're getting RLS (Row Level Security) policy errors when trying to upload audio to Supabase.

## Quick Fix

### Option 1: Run SQL Script (Recommended)

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/rnamwndxkoldzptaumws
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `fix_rls_policies.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

This will:
- Remove any restrictive RLS policies
- Create permissive policies for `audio_bucket`
- Make the bucket public
- Allow uploads from anonymous users

### Option 2: Disable RLS Completely (If Option 1 doesn't work)

If you still have issues, you can completely disable RLS for storage:

1. Go to SQL Editor
2. Run this command:
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Note**: This disables RLS for ALL storage buckets. Only do this if you're okay with that.

### Option 3: Fix via Dashboard

1. Go to **Storage** → **audio_bucket**
2. Click on **Policies** tab
3. Delete any existing policies
4. Click **New Policy**
5. Create a policy with:
   - **Policy name**: "Allow public uploads"
   - **Allowed operation**: INSERT
   - **Target roles**: `public`
   - **USING expression**: `bucket_id = 'audio_bucket'`
   - **WITH CHECK expression**: `bucket_id = 'audio_bucket'`
6. Create another policy for SELECT (read):
   - **Policy name**: "Allow public reads"
   - **Allowed operation**: SELECT
   - **Target roles**: `public`
   - **USING expression**: `bucket_id = 'audio_bucket'`

## Verify Bucket is Public

1. Go to **Storage** → **audio_bucket**
2. Click **Settings**
3. Make sure **Public bucket** is checked/enabled
4. If not, enable it and save

## Test Upload

After running the SQL script:

1. Try uploading audio again using the upload button
2. Check browser console for:
   - `[Supabase Upload] ✅ Upload successful!` (success)
   - `[Supabase Upload] ❌ Upload error:` (if still failing)
3. Check Supabase Storage:
   - Go to Storage → `audio_bucket` → `batches/`
   - You should see uploaded files

## Common RLS Errors

### "new row violates row-level security policy"
- **Fix**: Run the SQL script to create permissive policies

### "permission denied for table storage.objects"
- **Fix**: Make sure policies allow `public` role to INSERT

### "bucket not found"
- **Fix**: Create `audio_bucket` in Storage dashboard first

## What the SQL Script Does

1. **Drops existing restrictive policies** that might block uploads
2. **Creates new permissive policies** for `audio_bucket`:
   - Allows INSERT (upload) for public users
   - Allows SELECT (read) for public users
   - Allows UPDATE and DELETE if needed
3. **Makes bucket public** so it's accessible
4. **Creates bucket if it doesn't exist**

## Security Note

The policies created allow **anyone** (including anonymous users) to upload to `audio_bucket`. This is fine for development/testing, but for production you may want to:

- Add authentication checks
- Restrict to specific user roles
- Add file size limits
- Add file type validation

For now, the permissive policies will allow uploads to work immediately.

## After Running the Script

You should see:
- ✅ No more RLS policy errors
- ✅ Audio uploads working
- ✅ Files appearing in `audio_bucket/batches/` directory

If you still see errors, check the browser console for the exact error message and share it for further troubleshooting.

