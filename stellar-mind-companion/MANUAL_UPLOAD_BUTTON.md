# Manual Upload Button

## Overview

A manual upload button has been added to the VideoChat component that allows you to:
1. Sync calls and messages from Beyond Presence API to Supabase
2. Pause current audio recording
3. Upload the recorded audio to Supabase
4. Resume recording

## Location

The upload button appears in the control bar at the bottom of the video chat interface, next to the video, audio, and exercises buttons.

**Visual**: Blue circular button with an Upload icon (↑)

## How It Works

When you click the upload button:

### Step 1: Sync Calls and Messages
- Calls the Beyond Presence API `v1/calls` endpoint
- Fetches all calls and their messages
- Syncs data to `beyond_calls` and `beyond_call_messages` tables in Supabase

### Step 2: Stop Recording
- Pauses the current audio recording
- Captures the audio blob that has been recorded so far

### Step 3: Convert Audio
- Converts the audio blob to WAV format
- Falls back to original format if conversion fails

### Step 4: Upload to Supabase
- Uploads the audio file to `audio_bucket/batches/` directory
- Returns the public URL of the uploaded file

### Step 5: Resume Recording
- Automatically restarts audio recording
- Continues recording for the next batch

## Button States

### Enabled (Ready to Upload)
- Blue button with Upload icon
- Visible when audio is recording
- Click to start upload

### Disabled
- Grayed out with reduced opacity
- Disabled when:
  - Not currently recording
  - Upload is in progress

### Uploading
- Shows spinning loader icon
- Button is disabled during upload
- Status indicator appears: "Uploading to Supabase..."

## Visual Indicators

### Status Badges (Top Left)
- **Purple badge**: "Uploading to Supabase..." (when upload is active)
- **Red badge**: "Recording Audio..." (when recording)
- **Blue badge**: "Processing Audio..." (during automatic batch processing)

### Button Appearance
- **Default**: Blue circular button with Upload icon
- **Uploading**: Spinning loader icon
- **Disabled**: Grayed out, not clickable

## Console Logs

Watch the browser console for detailed progress:

```
[Manual Upload] Starting manual upload...
[Manual Upload] Step 1: Syncing calls and messages...
[Manual Upload] ✅ Synced X calls with Y messages
[Manual Upload] Step 2: Stopping recording to get audio blob...
[Manual Upload] Audio blob obtained, size: X bytes
[Manual Upload] Step 3: Converting audio to WAV format...
[Manual Upload] ✅ WAV conversion complete
[Manual Upload] Step 4: Uploading audio to Supabase...
[Supabase Upload] ✅ Upload successful!
[Manual Upload] Step 5: Restarting recording...
[Manual Upload] ✅ Recording restarted
[Manual Upload] ✅ Manual upload completed successfully!
```

## Error Handling

If any step fails:
- Error is logged to console with `[Manual Upload] ❌` prefix
- Recording is automatically restarted
- Upload process continues even if call sync fails
- Detailed error messages show what went wrong

## When to Use

Use the manual upload button when:
- You want to sync calls and messages immediately
- You want to upload audio before the 30-second automatic interval
- You're ending a session and want to save current progress
- You want to test the upload functionality

## Automatic vs Manual Upload

### Automatic Upload (Every 30 seconds)
- Happens automatically in the background
- Only uploads audio (doesn't sync calls)
- No user interaction needed

### Manual Upload (Button Click)
- User-triggered
- Syncs calls AND uploads audio
- Immediate action
- Useful for testing or manual saves

## Troubleshooting

### Button Not Visible
- Make sure you're in the video chat interface
- Check that permissions are granted and session is active
- Button only appears when recording is active

### Button Disabled
- Check if audio is currently recording (red badge should be visible)
- Wait for current upload to complete
- Check browser console for errors

### Upload Fails
- Check console for detailed error messages
- Verify Supabase bucket `audio_bucket` exists
- Check Supabase credentials in `.env` file
- Verify network connection

## Next Steps

After clicking upload:
1. Check Supabase Dashboard → Table Editor → `beyond_calls` (should have call data)
2. Check Supabase Dashboard → Table Editor → `beyond_call_messages` (should have messages)
3. Check Supabase Dashboard → Storage → `audio_bucket` → `batches/` (should have audio file)

The button provides immediate feedback and detailed logging to help you track the upload process!

