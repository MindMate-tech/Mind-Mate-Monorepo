# Supabase Setup Quick Start

## Issue: Tables and Bucket Missing

You're seeing these errors:
- `404 (Not Found)` for `beyond_calls` table
- Audio not uploading to Supabase

## Quick Fix (2 Steps)

### Step 1: Create the Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/rnamwndxkoldzptaumws
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase_schema.sql` file
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

**File location**: `patient_frontend/supabase_schema.sql`

This creates:
- `beyond_calls` table (for call data)
- `beyond_call_messages` table (for meeting notes/messages)

### Step 2: Verify Audio Bucket Exists

1. In Supabase Dashboard, go to **Storage** in the left sidebar
2. Check if `audio_bucket` exists
3. If it doesn't exist:
   - Click **New bucket**
   - Name: `audio_bucket`
   - Set to **Public** (or configure RLS policies)
   - Click **Create bucket**

## Verify Setup

### Check Tables
1. Go to **Table Editor** in Supabase Dashboard
2. You should see:
   - `beyond_calls`
   - `beyond_call_messages`

### Check Bucket
1. Go to **Storage** → `audio_bucket`
2. You should see the bucket with a `batches/` folder (created automatically on first upload)

## Test Audio Upload

After setup:
1. Start a call in your app
2. Wait 30 seconds
3. Check browser console for:
   - `[Supabase Upload] ✅ Upload successful`
4. Check Supabase Storage:
   - Go to Storage → `audio_bucket` → `batches/`
   - You should see `.wav` files appearing

## Troubleshooting

### Still Getting 404 for beyond_calls?

1. **Check SQL ran successfully**: Look for any errors in SQL Editor
2. **Refresh the page**: Sometimes Supabase needs a refresh
3. **Check table exists**: Go to Table Editor and verify `beyond_calls` is there
4. **Check RLS policies**: Make sure the policies allow access

### Audio Still Not Uploading?

1. **Check console logs**: Look for `[Supabase Upload]` messages
2. **Check bucket exists**: Verify `audio_bucket` is in Storage
3. **Check bucket permissions**: Make sure it's public or RLS allows uploads
4. **Check environment variables**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Common Errors

**"Bucket does not exist"**:
- Create `audio_bucket` in Storage

**"RLS policy violation"**:
- Check Row Level Security policies
- The SQL schema creates permissive policies, but verify they're active

**"Permission denied"**:
- Check your Supabase anon key has storage permissions
- Verify bucket is set to public or has proper RLS policies

## Next Steps

Once both are set up:
1. ✅ Tables created → Calls and messages will sync
2. ✅ Bucket created → Audio files will upload every 30 seconds

Check the browser console for detailed logs showing the sync and upload progress!

