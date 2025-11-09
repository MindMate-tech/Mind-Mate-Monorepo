# Audio Recording & Voice Analysis Setup

This document explains how to set up audio recording, Supabase storage, and voice prediction API integration.

## Overview

When a user grants camera and microphone permissions in the patient frontend:
1. Audio recording starts automatically
2. Audio is recorded locally in chunks (every 30 seconds)
3. Audio is converted to WAV format
4. Audio is uploaded to Supabase storage bucket
5. The voice prediction API is called with the Supabase URL
6. Results are logged to the console

## Prerequisites

1. **Supabase Account**: You need a Supabase project with a storage bucket
2. **Voice API**: The voice prediction API should be running (default: `http://localhost:8000`)

## Setup Steps

### 1. Install Dependencies

Dependencies are already installed:
- `@supabase/supabase-js` - Supabase client library

### 2. Configure Environment Variables

Create a `.env` file in the `patient_frontend` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Voice Prediction API URL
VITE_VOICE_API_URL=http://localhost:8000
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

### 3. Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `audio`
4. Set it to **Public** (or configure RLS policies if you want it private)

**Using SQL (optional):**
```sql
-- Create a public bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true);
```

### 4. Start the Voice Prediction API

Make sure the voice prediction API is running:

```bash
cd voice_model
source venv/bin/activate
./start_api.sh
# Or: uvicorn api:app --host 0.0.0.0 --port 8000
```

The API should be accessible at `http://localhost:8000` (or your configured URL).

## How It Works

### Audio Recording Flow

1. **Permission Grant**: When user clicks "Grant Access", permissions are requested
2. **Recording Start**: Once permissions are granted, audio recording starts automatically
3. **Periodic Processing**: Every 30 seconds:
   - Current recording is stopped
   - Audio blob is converted to WAV format
   - WAV file is uploaded to Supabase storage
   - Public URL is obtained
   - Voice prediction API is called with the URL
   - Results are logged to console
   - Recording restarts for the next cycle

### Visual Indicators

- **Green "Listening..."**: Speech recognition is active
- **Red "Recording Audio..."**: Audio is being recorded
- **Blue "Processing Audio..."**: Audio is being processed/uploaded

### Console Output

The following information is logged to the browser console:

```
Audio recording started
Processing audio recording...
Audio blob obtained, size: [size]
Converting audio to WAV format...
WAV conversion complete, size: [size]
Uploading audio to Supabase...
Supabase upload complete, URL: [url]
Calling voice prediction API...
=== VOICE PREDICTION RESULT ===
{
  "status": "success",
  "result": "normal" | "dementia_detected",
  "probabilities": {
    "normal": 0.7234,
    "normal_percentage": 72.34,
    "dementia": 0.2766,
    "dementia_percentage": 27.66
  },
  "confidence": 0.7234,
  "message": "...",
  "audio_info": {...}
}
=== END PREDICTION RESULT ===
Recording restarted
```

## Configuration

### Recording Interval

The default recording interval is 30 seconds. To change it, modify the interval in `VideoChat.tsx`:

```typescript
recordingIntervalRef.current = setInterval(async () => {
  await processAndUploadAudio();
}, 30000); // Change this value (in milliseconds)
```

### Audio Format

Audio is automatically converted to WAV format with:
- Sample rate: 16000 Hz (matches model requirements)
- Bit depth: 16-bit
- Channels: Mono

### Bucket Name

The default bucket name is `audio`. To change it, update `AUDIO_BUCKET_NAME` in `src/lib/supabase.ts`:

```typescript
export const AUDIO_BUCKET_NAME = 'your-bucket-name';
```

## Troubleshooting

### Audio Recording Not Starting

- Check browser console for errors
- Ensure microphone permissions are granted
- Check that `startRecording()` is being called

### Supabase Upload Fails

- Verify Supabase credentials in `.env` file
- Check that the `audio` bucket exists and is accessible
- Verify bucket permissions (should be public or have proper RLS policies)

### API Call Fails

- Ensure the voice prediction API is running
- Check `VITE_VOICE_API_URL` in `.env` file
- Verify the API endpoint is correct: `{API_URL}/predict/url`
- Check browser console for detailed error messages

### WAV Conversion Issues

- Some browsers may have limitations with audio conversion
- Check browser console for Web Audio API errors
- Ensure browser supports `AudioContext` and `OfflineAudioContext`

## Files Modified/Created

1. **`src/lib/supabase.ts`** - Supabase client configuration
2. **`src/hooks/useAudioRecorder.ts`** - Audio recording hook
3. **`src/utils/audioUtils.ts`** - Audio conversion utilities (to WAV)
4. **`src/utils/supabaseUpload.ts`** - Supabase upload utility
5. **`src/utils/voiceApi.ts`** - Voice prediction API client
6. **`src/components/VideoChat.tsx`** - Main integration point

## Security Notes

- Supabase anon key is safe to expose in frontend code
- Audio files are stored in Supabase storage (configure bucket policies as needed)
- Voice prediction API should be secured in production
- Consider implementing authentication for API calls in production

## Next Steps

- Add UI to display prediction results
- Implement error handling UI
- Add configuration for recording duration/interval
- Add ability to manually trigger audio processing
- Store prediction results in database

