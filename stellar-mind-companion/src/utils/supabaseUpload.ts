import { supabase, AUDIO_BUCKET_NAME } from '@/lib/supabase';

/**
 * Upload audio file to Supabase storage bucket (audio_bucket)
 * Files are organized in batches/ directory with timestamp and session ID
 * @param audioBlob - Audio blob to upload
 * @param fileName - Optional custom file name (defaults to timestamp-based name in batches/ directory)
 * @returns Public URL of the uploaded file
 */
export async function uploadAudioToSupabase(
  audioBlob: Blob,
  fileName?: string
): Promise<string> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = 'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
      console.error('[Supabase Upload] ❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Generate file name with timestamp and session ID for batch tracking
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionId = `session-${Date.now()}`;
    const filePath = fileName || `batches/${timestamp}-${sessionId}-${Math.random().toString(36).substring(7)}.wav`;
    
    console.log('[Supabase Upload] Uploading audio batch...', { 
      bucket: AUDIO_BUCKET_NAME,
      filePath, 
      size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
      blobType: audioBlob.type
    });
    
    // Check if bucket exists by trying to list it first (this will fail if bucket doesn't exist)
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage
        .from(AUDIO_BUCKET_NAME)
        .list('', { limit: 1 });

      if (bucketError) {
        console.error('[Supabase Upload] ❌ Bucket access error:', bucketError);
        if (bucketError.message?.includes('not found') || bucketError.message?.includes('does not exist')) {
          throw new Error(`Bucket "${AUDIO_BUCKET_NAME}" does not exist in Supabase. Please create it in the Supabase dashboard.`);
        }
        throw new Error(`Bucket access error: ${bucketError.message}`);
      }
    } catch (bucketCheckError) {
      // If bucket check fails, we'll still try to upload (might be a permission issue)
      console.warn('[Supabase Upload] ⚠️ Bucket check failed, attempting upload anyway:', bucketCheckError);
    }

    // Determine content type based on blob type
    let contentType = 'audio/wav';
    if (audioBlob.type) {
      contentType = audioBlob.type;
    } else if (filePath.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (filePath.endsWith('.webm')) {
      contentType = 'audio/webm';
    } else if (filePath.endsWith('.mp4')) {
      contentType = 'audio/mp4';
    }

    // Upload to Supabase storage bucket (audio_bucket)
    console.log('[Supabase Upload] Attempting upload to bucket:', AUDIO_BUCKET_NAME);
    console.log('[Supabase Upload] Upload parameters:', {
      filePath,
      contentType,
      blobSize: audioBlob.size,
      blobType: audioBlob.type || 'unknown'
    });
    
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET_NAME)
      .upload(filePath, audioBlob, {
        contentType: contentType,
        upsert: false, // Don't overwrite existing files
        cacheControl: '3600',
      });

    if (error) {
      console.error('[Supabase Upload] ❌ Upload error:', error);
      console.error('[Supabase Upload] Error details:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error,
        bucket: AUDIO_BUCKET_NAME,
        filePath: filePath,
        blobSize: audioBlob.size
      });
      throw new Error(`Failed to upload audio to ${AUDIO_BUCKET_NAME}: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned');
    }

    console.log('[Supabase Upload] ✅ Upload successful:', data.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded audio');
    }

    console.log('[Supabase Upload] ✅ Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[Supabase Upload] ❌ Error uploading to Supabase:', error);
    if (error instanceof Error) {
      console.error('[Supabase Upload] Error stack:', error.stack);
    }
    throw error;
  }
}
