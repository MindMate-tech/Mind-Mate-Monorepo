# Audio Batch Upload Setup

## Overview

The system now records user voice in 30-second batches and automatically uploads them to the Supabase `audio_bucket` storage bucket.

## Configuration

### Supabase Bucket

The audio files are uploaded to: **`audio_bucket`**

You can view your bucket at:
https://supabase.com/dashboard/project/rnamwndxkoldzptaumws/storage/files/buckets/audio_bucket

### Recording Interval

- **Recording Duration**: 30 seconds per batch
- **Upload Frequency**: Every 30 seconds
- **File Format**: WAV
- **File Location**: `batches/` directory within the bucket

## How It Works

1. **Start Recording**: When the user grants microphone permissions, recording starts automatically
2. **30-Second Batches**: Audio is recorded continuously in 30-second chunks
3. **Automatic Upload**: Every 30 seconds:
   - Current recording is stopped
   - Audio is converted to WAV format
   - File is uploaded to `audio_bucket/batches/` directory
   - Recording restarts for the next batch

## File Naming

Files are automatically named with:
- Timestamp (ISO format, sanitized)
- Session ID
- Random suffix

Format: `batches/YYYY-MM-DDTHH-MM-SS-session-TIMESTAMP-RANDOM.wav`

Example: `batches/2025-01-15T10-30-45-session-1705315845000-abc123.wav`

## Console Logging

The system provides detailed console logs for debugging:

- `[Audio Batch]` - Batch processing logs
- `[Supabase Upload]` - Upload status logs
- ✅ Success indicators
- ❌ Error indicators

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Bucket Setup

Ensure your Supabase bucket `audio_bucket` is configured:

1. Go to Supabase Dashboard → Storage
2. Create bucket named `audio_bucket` if it doesn't exist
3. Set bucket to **Public** (or configure RLS policies as needed)
4. Ensure the bucket allows uploads

## Error Handling

- If upload fails, recording continues (won't block the user)
- Errors are logged to console with `[Audio Batch] ❌` prefix
- Recording automatically restarts even after errors
- Empty recordings (no audio data) are skipped

## Monitoring

### Check Uploads in Supabase

1. Go to: https://supabase.com/dashboard/project/rnamwndxkoldzptaumws/storage/files/buckets/audio_bucket
2. Navigate to `batches/` directory
3. You should see files appearing every 30 seconds when recording is active

### Browser Console

Open browser DevTools → Console to see:
- Batch processing status
- Upload progress
- File sizes
- Public URLs of uploaded files
- Any errors

## Troubleshooting

### No Files Appearing

1. **Check Permissions**: Ensure microphone permission is granted
2. **Check Console**: Look for error messages
3. **Check Bucket**: Verify `audio_bucket` exists and is accessible
4. **Check Environment Variables**: Ensure Supabase credentials are set

### Upload Errors

1. **Bucket Doesn't Exist**: Create `audio_bucket` in Supabase Storage
2. **RLS Policies**: Check Row Level Security policies allow uploads
3. **Network Issues**: Check browser console for network errors
4. **File Size**: Very large files might timeout (30-second recordings should be fine)

### Recording Not Starting

1. **Microphone Permission**: Check browser permissions
2. **HTTPS**: Some browsers require HTTPS for microphone access
3. **Browser Support**: Ensure browser supports MediaRecorder API

## Optional: Voice Prediction API

The voice prediction API call has been commented out. If you need it:

1. Uncomment lines 248-253 in `VideoChat.tsx`
2. Ensure `VITE_VOICE_API_URL` is set in `.env`

## File Organization

Files are organized in the bucket as:
```
audio_bucket/
  └── batches/
      ├── 2025-01-15T10-30-45-session-1705315845000-abc123.wav
      ├── 2025-01-15T10-31-15-session-1705315875000-def456.wav
      └── ...
```

This makes it easy to:
- Track batches by timestamp
- Identify files from the same session
- Sort files chronologically

