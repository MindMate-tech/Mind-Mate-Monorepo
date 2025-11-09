import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, Phone, Maximize2, Upload, Loader2 } from "lucide-react";
import { Track } from 'livekit-client';
import {
  ParticipantTile,
  useConnectionState,
  useLocalParticipant,
  useTracks,
  LiveKitRoom
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { convertToWAV } from '@/utils/audioUtils';
import { uploadAudioToSupabase } from '@/utils/supabaseUpload';
import { predictVoiceFromUrl } from '@/utils/voiceApi';
import { syncEndedCalls, syncCallWithMessages, syncCallsAtStart } from '@/lib/syncBeyondCalls';
import { testConnections } from '@/utils/testConnection';

interface VideoChatProps {
  isExpanded: boolean;
  onToggleExercises: () => void;
  onShowMemories: () => void;
  roomName: string;
  participantName: string;
  token: string;
  liveKitUrl: string;
}

interface LiveKitInnerProps {
  onToggleExercises: () => void;
  onShowMemories: () => void;
  isRecording?: boolean;
  isProcessingAudio?: boolean;
  onManualUpload?: () => Promise<void>;
  isUploading?: boolean;
}

const LiveKitInner = ({ onToggleExercises, onShowMemories, isRecording = false, isProcessingAudio = false, onManualUpload, isUploading = false }: LiveKitInnerProps) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  
  // Sync calls when connection disconnects
  useEffect(() => {
    if (connectionState === 'disconnected') {
      console.log('Connection disconnected, syncing ended calls...');
      syncEndedCalls(100).catch((error) => {
        console.error('Error syncing calls on disconnect:', error);
      });
    }
  }, [connectionState]);
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // Speech recognition for keyword detection
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    keywords: ["i don't know", "are you ready for the exercises"],
    onKeywordDetected: (keyword, fullTranscript) => {
      console.log(`Keyword detected: "${keyword}"`);
      console.log(`Full transcript: "${fullTranscript}"`);
      
      if (keyword.toLowerCase() === "i don't know") {
        console.log('Triggering memory carousel...');
        onShowMemories();
      } else if (keyword.toLowerCase() === "are you ready for the exercises") {
        console.log('Triggering exercise panel...');
        onToggleExercises();
      }
    },
    onTranscript: (text) => {
      console.log('Live transcript:', text);
    },
    continuous: true,
  });

  useEffect(() => {
    console.log('Connection state:', connectionState);
    console.log('Tracks:', tracks);
    console.log('Local participant:', localParticipant);
  }, [connectionState, tracks, localParticipant]);

  // Start speech recognition when connected
  useEffect(() => {
    if (connectionState === 'connected' && !isListening) {
      console.log('Starting speech recognition...');
      startListening();
    }
    
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [connectionState, isListening, startListening, stopListening]);

  const toggleVideo = useCallback(async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  }, [localParticipant, isVideoOn]);

  const toggleAudio = useCallback(async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  }, [localParticipant, isAudioOn]);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Connection status */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
        Status: {connectionState}
      </div>

      {/* Speech recognition status */}
      {isListening && (
        <div className="absolute top-2 left-2 bg-green-600 bg-opacity-80 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Listening...
        </div>
      )}

      {/* Audio recording status */}
      {isRecording && (
        <div className="absolute top-12 left-2 bg-red-600 bg-opacity-80 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Recording Audio...
        </div>
      )}

      {/* Audio processing status */}
      {isProcessingAudio && (
        <div className="absolute top-20 left-2 bg-blue-600 bg-opacity-80 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Processing Audio...
        </div>
      )}

      {/* Manual upload status */}
      {isUploading && (
        <div className="absolute top-28 left-2 bg-purple-600 bg-opacity-80 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Uploading to Supabase...
        </div>
      )}

      {/* AI Avatar iframe - Fullscreen */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-800">
        <iframe 
          src="https://bey.chat/5b6db874-ad47-4108-b15b-5341326a751e" 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          allow="camera; microphone; fullscreen"
          title="AI Therapist Avatar"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          AI Therapist
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <Button
          variant={isVideoOn ? "default" : "destructive"}
          size="icon"
          onClick={toggleVideo}
          className="rounded-full h-12 w-12"
        >
          {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={isAudioOn ? "default" : "destructive"}
          size="icon"
          onClick={toggleAudio}
          className="rounded-full h-12 w-12"
        >
          {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExercises}
          className="rounded-full h-12 w-12 ml-4"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
        
        {onManualUpload && (
          <Button
            variant="default"
            size="icon"
            onClick={onManualUpload}
            disabled={isUploading || !isRecording}
            className="rounded-full h-12 w-12 ml-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            title="Upload calls and audio to Supabase"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

const VideoChat = ({ isExpanded, onToggleExercises, onShowMemories, token, liveKitUrl, roomName }: VideoChatProps) => {
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [avatarSessionCreated, setAvatarSessionCreated] = useState(false);
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);
  
  // Audio recording
  const { isRecording, startRecording, stopRecording, error: recordingError } = useAudioRecorder();
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingDurationRef = useRef<number>(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  // Beyond Presence session tracking
  const beyondSessionIdRef = useRef<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process recorded audio: convert to WAV and upload to Supabase in batches (every 30 seconds)
  const processAndUploadAudio = useCallback(async () => {
    if (!isRecording) {
      console.log('Not recording, skipping audio processing');
      return;
    }

    setIsProcessingAudio(true);
    try {
      console.log('[Audio Batch] Processing 30-second audio recording...');
      
      // Stop current recording to get the blob
      const audioBlob = await stopRecording();
      
      if (!audioBlob || audioBlob.size === 0) {
        console.warn('[Audio Batch] No audio data recorded, skipping upload');
        setIsProcessingAudio(false);
        // Restart recording even if no data
        try {
          await startRecording();
        } catch (restartErr) {
          console.error('Failed to restart recording:', restartErr);
        }
        return;
      }

      console.log('[Audio Batch] Audio blob obtained, size:', audioBlob.size, 'bytes', 'type:', audioBlob.type);
      
      // Convert to WAV format (with fallback to original blob if conversion fails)
      console.log('[Audio Batch] Converting audio to WAV format...');
      let wavBlob: Blob;
      try {
        wavBlob = await convertToWAV(audioBlob);
        console.log('[Audio Batch] ✅ WAV conversion complete, size:', wavBlob.size, 'bytes');
      } catch (convertErr) {
        console.error('[Audio Batch] ⚠️ WAV conversion failed, using original blob:', convertErr);
        // Fallback: use original blob if WAV conversion fails
        wavBlob = audioBlob;
        console.log('[Audio Batch] Using original blob format:', audioBlob.type, 'size:', audioBlob.size);
      }
      
      // Upload to Supabase audio_bucket
      console.log('[Audio Batch] Uploading audio batch to Supabase bucket: audio_bucket...');
      console.log('[Audio Batch] Upload details:', {
        blobSize: wavBlob.size,
        blobType: wavBlob.type,
        bucket: 'audio_bucket'
      });
      
      let audioUrl: string;
      let uploadAttempts = 0;
      const maxUploadAttempts = 3;
      
      while (uploadAttempts < maxUploadAttempts) {
        try {
          uploadAttempts++;
          console.log(`[Audio Batch] Upload attempt ${uploadAttempts}/${maxUploadAttempts}...`);
          audioUrl = await uploadAudioToSupabase(wavBlob);
          console.log('[Audio Batch] ✅ Upload successful! URL:', audioUrl);
          break; // Success, exit retry loop
        } catch (uploadErr) {
          console.error(`[Audio Batch] ❌ Upload attempt ${uploadAttempts} failed:`, uploadErr);
          console.error('[Audio Batch] Error details:', {
            error: uploadErr instanceof Error ? uploadErr.message : String(uploadErr),
            blobSize: wavBlob.size,
            blobType: wavBlob.type,
            attempt: uploadAttempts,
            maxAttempts: maxUploadAttempts
          });
          
          if (uploadAttempts >= maxUploadAttempts) {
            // All attempts failed
            console.error('[Audio Batch] ❌ All upload attempts failed. Giving up.');
            throw uploadErr;
          }
          
          // Wait before retry (exponential backoff)
          const retryDelay = Math.min(1000 * Math.pow(2, uploadAttempts - 1), 5000);
          console.log(`[Audio Batch] Retrying upload in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      
      // Optional: Call prediction API (commented out - uncomment if needed)
      // console.log('Calling voice prediction API...');
      // const predictionResult = await predictVoiceFromUrl(audioUrl);
      // console.log('=== VOICE PREDICTION RESULT ===');
      // console.log(JSON.stringify(predictionResult, null, 2));
      // console.log('=== END PREDICTION RESULT ===');
      
      // Restart recording for next 30-second batch
      await startRecording();
      console.log('[Audio Batch] Recording restarted for next batch');
      
    } catch (err) {
      console.error('[Audio Batch] ❌ Error processing audio batch:', err);
      console.error('[Audio Batch] Full error details:', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      });
      
      // Show user-visible error (you can customize this)
      if (err instanceof Error) {
        if (err.message.includes('does not exist')) {
          console.error('[Audio Batch] ⚠️ Bucket does not exist! Please create audio_bucket in Supabase Storage.');
        } else if (err.message.includes('not configured')) {
          console.error('[Audio Batch] ⚠️ Supabase credentials not configured! Check your .env file.');
        } else if (err.message.includes('Permission')) {
          console.error('[Audio Batch] ⚠️ Permission denied! Check bucket RLS policies.');
        }
      }
      
      // Try to restart recording even if processing failed
      try {
        await startRecording();
        console.log('[Audio Batch] Recording restarted after error');
      } catch (restartErr) {
        console.error('[Audio Batch] Failed to restart recording:', restartErr);
      }
    } finally {
      setIsProcessingAudio(false);
    }
  }, [isRecording, startRecording, stopRecording]);

  // Sync ended calls periodically (every 5 minutes)
  useEffect(() => {
    if (avatarSessionCreated) {
      // Test connections on mount
      testConnections().then((result) => {
        if (!result.supabase.connected) {
          console.warn('Supabase connection test failed:', result.supabase.error);
        }
        if (!result.beyondPresence.connected) {
          console.warn('Beyond Presence API connection test failed:', result.beyondPresence.error);
        }
      });

      // Set up periodic sync for ended calls
      syncIntervalRef.current = setInterval(async () => {
        try {
          console.log('Syncing ended calls...');
          await syncEndedCalls(100);
        } catch (error) {
          console.error('Error syncing ended calls:', error);
        }
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [avatarSessionCreated]);

  // Cleanup on unmount - sync call data when disconnecting
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (isRecording) {
        stopRecording().catch(console.error);
      }
      
      // Sync ended calls when component unmounts
      if (avatarSessionCreated) {
        syncEndedCalls(100).catch((error) => {
          console.error('Error syncing calls on unmount:', error);
        });
      }
    };
  }, [isRecording, stopRecording, avatarSessionCreated]);

  const createBeyondPresenceSession = async () => {
    setIsCreatingAvatar(true);
    try {
      console.log('Creating Beyond Presence avatar session...');
      console.log('Room:', roomName);
      
      // Get a token for the avatar participant
      const avatarTokenResponse = await fetch(`/api/token?room=${roomName}&username=ai-therapist`);
      if (!avatarTokenResponse.ok) {
        throw new Error('Failed to fetch avatar token');
      }
      const avatarTokenData = await avatarTokenResponse.json();
      console.log('Avatar token obtained');
      
      // Call the backend API to create the avatar session
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room: roomName,
          token: avatarTokenData.token,
          avatarId: "694c83e2-8895-4a98-bd16-56332ca3f449",
        }),
      });

      console.log('Avatar API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('Failed to create avatar session:', errorData);
        throw new Error(`Failed to create avatar session: ${errorData.error || response.statusText}`);
      }

      const sessionData = await response.json();
      console.log('Beyond Presence avatar session created successfully:', sessionData);
      
      // Store session ID for potential call tracking
      if (sessionData.sessionId || sessionData.id || sessionData.data?.session_id || sessionData.data?.id) {
        beyondSessionIdRef.current = sessionData.sessionId || sessionData.id || sessionData.data?.session_id || sessionData.data?.id;
        console.log('Stored Beyond Presence session ID:', beyondSessionIdRef.current);
      }
      
      console.log('AI assistant should join the room shortly...');
      setAvatarSessionCreated(true);
      
      // At call start: Sync all calls and meeting notes from v1/calls API
      console.log('[Call Start] Starting call - syncing all calls and meeting notes...');
      syncCallsAtStart(100)
        .then((result) => {
          console.log(`[Call Start] ✅ Successfully synced ${result.calls.length} calls with ${result.totalMessages} meeting notes/messages`);
        })
        .catch((error) => {
          console.error('[Call Start] ❌ Error syncing calls and meeting notes at call start:', error);
          // Don't block the call if sync fails
        });
    } catch (err) {
      console.error('Beyond Presence session error:', err);
      // Don't block the user from continuing - they can still use video chat without the avatar
      console.warn('Continuing without AI avatar...');
      setAvatarSessionCreated(true); // Allow user to proceed
    } finally {
      setIsCreatingAvatar(false);
    }
  };

  const requestPermissions = async () => {
    setIsRequestingPermission(true);
    setError(null);
    setPermissionDenied(false);
    
    try {
      // Request both camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop the stream immediately after getting permission (LiveKit will request its own)
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Camera and microphone permissions granted');
      setPermissionGranted(true);
      
      // Create Beyond Presence avatar session after permissions are granted
      // Audio recording will start after LiveKit connects (see useEffect below)
      await createBeyondPresenceSession();
    } catch (err) {
      console.error('Permission error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setPermissionDenied(true);
          setError('Camera and microphone access was denied. Please allow access in your browser settings and refresh the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found. Please connect a device and try again.');
        } else {
          setError(`Failed to access camera/microphone: ${err.message}`);
        }
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Track if we've attempted to start recording
  const recordingStartAttemptedRef = useRef(false);
  const [isManualUploading, setIsManualUploading] = useState(false);

  // Start audio recording after LiveKit connects to avoid conflicts
  useEffect(() => {
    if (permissionGranted && avatarSessionCreated && !isRecording && !recordingStartAttemptedRef.current) {
      // Wait a bit for LiveKit to fully establish connection
      const startRecordingAfterDelay = setTimeout(async () => {
        recordingStartAttemptedRef.current = true;
        try {
          console.log('[Audio Recording] Starting audio recording after LiveKit connection...');
          await startRecording();
          console.log('[Audio Recording] ✅ Audio recording started successfully');
          
          // Set up periodic audio batch uploads every 30 seconds
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }
          
          recordingIntervalRef.current = setInterval(async () => {
            console.log('[Audio Batch] 30-second interval reached, processing batch...');
            await processAndUploadAudio();
          }, 30000); // Process every 30 seconds (30000ms)
        } catch (err) {
          console.error('[Audio Recording] ❌ Failed to start audio recording:', err);
          recordingStartAttemptedRef.current = false; // Allow retry
          // Retry after a delay
          setTimeout(async () => {
            try {
              console.log('[Audio Recording] Retrying audio recording start...');
              await startRecording();
              console.log('[Audio Recording] ✅ Audio recording started on retry');
              recordingStartAttemptedRef.current = true;
            } catch (retryErr) {
              console.error('[Audio Recording] ❌ Retry failed:', retryErr);
              recordingStartAttemptedRef.current = false;
            }
          }, 3000); // Wait 3 seconds before retry
        }
      }, 3000); // Wait 3 seconds for LiveKit to establish connection

      return () => {
        clearTimeout(startRecordingAfterDelay);
      };
    }
  }, [permissionGranted, avatarSessionCreated, isRecording, startRecording, processAndUploadAudio]);

  // Manual upload function: sync calls and upload current audio
  const handleManualUpload = useCallback(async () => {
    if (!isRecording) {
      console.warn('[Manual Upload] Not recording, cannot upload audio');
      return;
    }

    setIsManualUploading(true);
    try {
      console.log('[Manual Upload] Starting manual upload...');
      
      // Step 1: Sync calls and messages from Beyond Presence API
      console.log('[Manual Upload] Step 1: Syncing calls and messages...');
      try {
        const syncResult = await syncCallsAtStart(100);
        console.log(`[Manual Upload] ✅ Synced ${syncResult.calls.length} calls with ${syncResult.totalMessages} messages`);
      } catch (syncErr) {
        console.error('[Manual Upload] ⚠️ Failed to sync calls (continuing with audio upload):', syncErr);
        // Continue with audio upload even if call sync fails
      }

      // Step 2: Stop current recording to get the blob
      console.log('[Manual Upload] Step 2: Stopping recording to get audio blob...');
      const audioBlob = await stopRecording();
      
      if (!audioBlob || audioBlob.size === 0) {
        console.warn('[Manual Upload] ⚠️ No audio data recorded, skipping upload');
        // Restart recording
        await startRecording();
        return;
      }

      console.log('[Manual Upload] Audio blob obtained, size:', audioBlob.size, 'bytes');

      // Step 3: Convert to WAV format
      console.log('[Manual Upload] Step 3: Converting audio to WAV format...');
      let wavBlob: Blob;
      try {
        wavBlob = await convertToWAV(audioBlob);
        console.log('[Manual Upload] ✅ WAV conversion complete, size:', wavBlob.size, 'bytes');
      } catch (convertErr) {
        console.warn('[Manual Upload] ⚠️ WAV conversion failed, using original blob:', convertErr);
        wavBlob = audioBlob;
      }

      // Step 4: Upload to Supabase
      console.log('[Manual Upload] Step 4: Uploading audio to Supabase...');
      const audioUrl = await uploadAudioToSupabase(wavBlob);
      console.log('[Manual Upload] ✅ Audio uploaded successfully! URL:', audioUrl);

      // Step 5: Restart recording
      console.log('[Manual Upload] Step 5: Restarting recording...');
      await startRecording();
      console.log('[Manual Upload] ✅ Recording restarted');

      console.log('[Manual Upload] ✅ Manual upload completed successfully!');
    } catch (err) {
      console.error('[Manual Upload] ❌ Error during manual upload:', err);
      // Try to restart recording even if upload failed
      try {
        if (!isRecording) {
          await startRecording();
          console.log('[Manual Upload] Recording restarted after error');
        }
      } catch (restartErr) {
        console.error('[Manual Upload] Failed to restart recording:', restartErr);
      }
    } finally {
      setIsManualUploading(false);
    }
  }, [isRecording, startRecording, stopRecording]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">{error}</div>
          {permissionDenied && (
            <div className="text-sm text-gray-400 mt-4">
              <p className="mb-2">To enable camera and microphone:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Allow" for camera and microphone</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!permissionGranted || !avatarSessionCreated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-6">
            <Video className="h-16 w-16 mx-auto text-primary mb-4" />
            {!permissionGranted ? (
              <>
                <h3 className="text-xl font-semibold text-white mb-2">Camera & Microphone Access</h3>
                <p className="text-gray-400">We need access to your camera and microphone for the video session</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white mb-2">Setting Up AI Assistant</h3>
                <p className="text-gray-400">Preparing your virtual therapy session...</p>
              </>
            )}
          </div>
          <Button 
            onClick={requestPermissions}
            disabled={isRequestingPermission || isCreatingAvatar || permissionGranted}
            size="lg"
            className="px-8"
          >
            {isRequestingPermission 
              ? 'Requesting Access...' 
              : isCreatingAvatar 
              ? 'Setting Up AI Assistant...' 
              : permissionGranted 
              ? 'Preparing Session...'
              : 'Grant Access'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full flex flex-col transition-all duration-500 ${isExpanded ? 'w-1/2' : 'w-full'}`}>
      <LiveKitRoom
        serverUrl={liveKitUrl}
        token={token}
        connect={true}
        video={true}
        audio={true}
        onError={(err) => {
          console.error('LiveKit error:', err);
          if (err.message.includes('NotAllowedError') || err.message.includes('Permission')) {
            setPermissionDenied(true);
            setError('Camera and microphone access was denied. Please allow access in your browser settings.');
          } else {
            setError(err.message);
          }
        }}
        className="relative flex-1 bg-gradient-to-br from-space-deep to-space-mid rounded-2xl overflow-hidden shadow-soft"
      >
        <LiveKitInner 
          onToggleExercises={onToggleExercises} 
          onShowMemories={onShowMemories}
          isRecording={isRecording}
          isProcessingAudio={isProcessingAudio}
          onManualUpload={handleManualUpload}
          isUploading={isManualUploading}
        />
      </LiveKitRoom>
    </div>
  );
};

export default VideoChat;
