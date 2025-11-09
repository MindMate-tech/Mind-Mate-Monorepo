# Audio Upload Troubleshooting Guide

## Issue: Audio Recording But Not Uploading

Audio is being recorded (you see "Audio recording stopped, blob size: X") but files are not appearing in Supabase.

## What Was Fixed

### 1. **Retry Logic Added**
- Now retries upload up to 3 times with exponential backoff
- If first attempt fails, waits 1s, then 2s, then tries again
- Logs each attempt so you can see what's happening

### 2. **WAV Conversion Fallback**
- If WAV conversion fails, uses original blob format
- Prevents upload from failing due to conversion issues
- Logs when fallback is used

### 3. **Better Error Logging**
- More detailed error messages
- Shows specific error types (bucket missing, permissions, etc.)
- Logs full error stack traces

### 4. **Content Type Detection**
- Automatically detects blob type
- Sets correct content type for upload
- Handles WAV, WebM, MP4 formats

## How to Debug

### Step 1: Check Browser Console

Open DevTools (F12) → Console tab and look for:

**Success logs:**
```
[Audio Batch] Audio blob obtained, size: 12767 bytes
[Audio Batch] ✅ WAV conversion complete
[Audio Batch] Upload attempt 1/3...
[Supabase Upload] ✅ Upload successful!
```

**Error logs to watch for:**
```
[Audio Batch] ❌ Upload attempt X failed
[Supabase Upload] ❌ Upload error: ...
```

### Step 2: Check Common Issues

#### Issue: "Bucket does not exist"
**Fix:**
1. Go to Supabase Dashboard → Storage
2. Create bucket named `audio_bucket`
3. Set to **Public** or configure RLS policies

#### Issue: "Permission denied" or "RLS policy violation"
**Fix:**
1. Go to Supabase Dashboard → Storage → `audio_bucket`
2. Check **Policies** tab
3. Ensure there's a policy allowing INSERT operations
4. Or set bucket to **Public**

#### Issue: "Supabase credentials not configured"
**Fix:**
1. Check your `.env` file has:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Restart dev server after adding env vars

#### Issue: "Upload succeeded but no data returned"
**Fix:**
- This is rare, but might indicate a Supabase API issue
- Check Supabase status page
- Try again (retry logic will handle this)

### Step 3: Verify Upload is Being Attempted

Look for these logs in sequence:
1. `[Audio Batch] 30-second interval reached, processing batch...`
2. `[Audio Batch] Audio blob obtained, size: X bytes`
3. `[Audio Batch] Converting audio to WAV format...`
4. `[Audio Batch] Uploading audio batch to Supabase bucket...`
5. `[Supabase Upload] Attempting upload to bucket: audio_bucket`

If you see step 1-4 but not step 5, the upload function isn't being called.

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "supabase" or "storage"
3. Look for POST requests to `/storage/v1/object/audio_bucket/...`
4. Check:
   - **Status code**: Should be 200 (success) or 201 (created)
   - **Request payload**: Should show the blob
   - **Response**: Should show file path

**Common status codes:**
- `200/201` = Success ✅
- `400` = Bad request (check file path/format)
- `401` = Unauthorized (check API key)
- `403` = Forbidden (check RLS policies)
- `404` = Bucket not found
- `413` = File too large
- `500` = Server error

## Expected Console Output (Success)

```
[Audio Batch] 30-second interval reached, processing batch...
[Audio Batch] Processing 30-second audio recording...
[Audio Batch] Audio blob obtained, size: 12767 bytes type: audio/webm
[Audio Batch] Converting audio to WAV format...
[Audio Batch] ✅ WAV conversion complete, size: 25678 bytes
[Audio Batch] Uploading audio batch to Supabase bucket: audio_bucket...
[Audio Batch] Upload details: { blobSize: 25678, blobType: "audio/wav", bucket: "audio_bucket" }
[Audio Batch] Upload attempt 1/3...
[Supabase Upload] Uploading audio batch... { bucket: "audio_bucket", filePath: "batches/...", size: "25.08 KB" }
[Supabase Upload] Attempting upload to bucket: audio_bucket
[Supabase Upload] ✅ Upload successful: batches/2025-01-15T10-30-45-session-1234567890-abc123.wav
[Supabase Upload] ✅ Public URL: https://...
[Audio Batch] ✅ Upload successful! URL: https://...
[Audio Batch] Recording restarted for next batch
```

## Expected Console Output (Error)

```
[Audio Batch] Upload attempt 1/3...
[Supabase Upload] ❌ Upload error: Bucket "audio_bucket" does not exist
[Audio Batch] ❌ Upload attempt 1 failed: Error: Bucket "audio_bucket" does not exist
[Audio Batch] Retrying upload in 1000ms...
[Audio Batch] Upload attempt 2/3...
[Supabase Upload] ❌ Upload error: ...
[Audio Batch] ❌ All upload attempts failed. Giving up.
[Audio Batch] ⚠️ Bucket does not exist! Please create audio_bucket in Supabase Storage.
```

## Quick Checklist

- [ ] Audio is being recorded (see "blob size" in console)
- [ ] WAV conversion completes (or fallback used)
- [ ] Upload attempt is made (see "Upload attempt X/3")
- [ ] Bucket `audio_bucket` exists in Supabase
- [ ] Bucket is public or has proper RLS policies
- [ ] Supabase credentials are set in `.env`
- [ ] No network errors in Network tab
- [ ] Files appear in Supabase Storage → `audio_bucket` → `batches/`

## Still Not Working?

1. **Copy the exact error message** from console
2. **Check Network tab** for the failed request
3. **Verify bucket exists** in Supabase dashboard
4. **Test with a simple file** - try uploading manually in Supabase dashboard
5. **Check Supabase logs** - Dashboard → Logs → API logs

The improved error handling will now show you exactly what's failing!

