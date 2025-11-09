# Audio Recording Fix - AbortError Resolution

## Problem

Audio recording was not working and showing this error:
```
Error attaching track: AbortError: The play() request was interrupted by a new load request.
```

## Root Cause

The issue was caused by **audio stream conflicts**:

1. **Timing Conflict**: Audio recording was starting immediately after permission grant, before LiveKit established its connection
2. **Multiple Stream Requests**: Both LiveKit and our recording hook were trying to access the microphone simultaneously
3. **Browser Limitation**: Browsers can't handle multiple simultaneous `getUserMedia()` requests for the same device

## Solution

### 1. Delayed Recording Start
- **Before**: Recording started immediately after permissions
- **After**: Recording starts 3 seconds after LiveKit session is created
- This allows LiveKit to establish its connection first

### 2. Retry Logic
Added retry mechanism in `useAudioRecorder`:
- 3 retry attempts with 1-second delays
- Better error handling and cleanup
- Prevents infinite retry loops

### 3. Stream Cleanup
- Properly clean up existing streams before requesting new ones
- Check if already recording before starting
- Stop tracks properly on errors

### 4. Connection State Awareness
- Wait for `permissionGranted` and `avatarSessionCreated` before starting
- Track recording attempts to avoid duplicates
- Retry on failure with exponential backoff

## Changes Made

### `src/hooks/useAudioRecorder.ts`
- ✅ Added retry logic (3 attempts)
- ✅ Added stream cleanup before new requests
- ✅ Added check to prevent duplicate recording starts
- ✅ Better error handling and cleanup
- ✅ Added `autoGainControl` to audio constraints

### `src/components/VideoChat.tsx`
- ✅ Moved recording start to `useEffect` that waits for LiveKit connection
- ✅ Added 3-second delay after session creation
- ✅ Added retry mechanism if initial start fails
- ✅ Added `recordingStartAttemptedRef` to prevent duplicate attempts

## How It Works Now

1. **User grants permissions** → `requestPermissions()` called
2. **LiveKit session created** → `avatarSessionCreated = true`
3. **Wait 3 seconds** → Allow LiveKit to establish connection
4. **Start recording** → Request microphone stream for recording
5. **Set up interval** → 30-second batch uploads begin
6. **If fails** → Retry after 3 seconds

## Console Logs

Look for these logs to track the flow:

- `[Audio Recording] Starting audio recording after LiveKit connection...`
- `[Audio Recording] ✅ Audio recording started successfully`
- `[Audio Recording] ❌ Failed to start audio recording:` (if error)
- `[Audio Recording] Retrying audio recording start...` (on retry)
- `[Audio Batch] 30-second interval reached, processing batch...`

## Testing

1. **Open browser console** (F12 → Console tab)
2. **Grant permissions** when prompted
3. **Watch for logs**:
   - Should see `[Audio Recording] Starting...` after ~3 seconds
   - Should see `✅ Audio recording started successfully`
   - Should see `[Audio Batch]` logs every 30 seconds
4. **Check Supabase**:
   - Go to `audio_bucket` → `batches/` directory
   - Files should appear every 30 seconds

## Troubleshooting

### Still Not Recording?

1. **Check Console**: Look for error messages with `[Audio Recording]` prefix
2. **Check Permissions**: Ensure microphone permission is granted
3. **Check LiveKit**: Make sure LiveKit connection is established (check connection state)
4. **Check Browser**: Some browsers have stricter audio policies (try Chrome/Edge)

### AbortError Still Appearing?

1. **Increase Delay**: Change the 3000ms delay to 5000ms in `VideoChat.tsx`
2. **Check Other Tabs**: Close other tabs that might be using microphone
3. **Browser Restart**: Sometimes browser needs restart after permission changes

### Recording Starts But No Uploads?

1. **Check Interval**: Verify `recordingIntervalRef.current` is set
2. **Check Supabase**: Verify bucket `audio_bucket` exists and is accessible
3. **Check Network**: Look for upload errors in console
4. **Check File Size**: Very small files might be skipped

## Expected Behavior

✅ **Success Flow**:
1. Permissions granted
2. LiveKit connects
3. Wait 3 seconds
4. Recording starts
5. Every 30 seconds: stop → convert → upload → restart
6. Files appear in Supabase `audio_bucket/batches/`

❌ **Failure Flow**:
1. Permissions granted
2. LiveKit connects
3. Wait 3 seconds
4. Recording fails → retry after 3 seconds
5. If retry fails → logs error, continues without blocking call

## Next Steps

If issues persist:
1. Check browser console for specific error messages
2. Verify Supabase bucket configuration
3. Test in different browsers (Chrome recommended)
4. Check network tab for failed upload requests

