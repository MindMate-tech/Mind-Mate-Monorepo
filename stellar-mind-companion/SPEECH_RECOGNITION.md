# Speech Recognition Feature

## Overview
The application now includes real-time speech recognition that listens to the patient's speech during video calls and triggers specific UI actions based on detected keywords.

## Technology
- **Web Speech API**: Uses the browser's built-in speech recognition (powered by Google's speech recognition service)
- **Continuous Listening**: Automatically starts when the LiveKit connection is established
- **Keyword Detection**: Monitors for specific phrases in real-time

## Detected Keywords & Actions

### 1. "I don't know"
**Trigger**: When the patient says "I don't know"
**Action**: Opens the Memory Carousel showing family photos and memories
**Purpose**: Helps patients with dementia recall memories when they're struggling

### 2. "Are you ready for the exercises"
**Trigger**: When the AI therapist asks "Are you ready for the exercises"
**Action**: Opens the Exercise Panel with cognitive exercises
**Purpose**: Seamlessly transitions to exercise activities during therapy sessions

## How It Works

1. **Initialization**: Speech recognition starts automatically when the video call connects
2. **Continuous Monitoring**: The system continuously listens to the patient's speech
3. **Keyword Matching**: Transcribed text is checked against the keyword list (case-insensitive)
4. **Action Triggering**: When a keyword is detected, the corresponding UI action is triggered
5. **Visual Feedback**: A green "Listening..." indicator shows when speech recognition is active

## Browser Compatibility

The Web Speech API is supported in:
- ✅ Chrome/Edge (Chromium-based browsers)
- ✅ Safari (macOS and iOS)
- ❌ Firefox (limited support)

## Privacy & Security

- Speech recognition runs entirely in the browser
- Audio is processed by Google's speech recognition service
- No audio is stored or recorded by our application
- Transcripts are only used for keyword detection and not persisted

## Technical Implementation

### Files
- `src/hooks/useSpeechRecognition.ts` - Custom React hook for speech recognition
- `src/components/VideoChat.tsx` - Integration with video chat component
- `src/pages/Index.tsx` - Main page with callback handlers

### Key Features
- Automatic restart on errors
- Continuous listening mode
- Real-time transcript logging (console)
- Keyword detection with case-insensitive matching
- Visual listening indicator

## Adding New Keywords

To add new keywords and actions:

1. Update the `keywords` array in `VideoChat.tsx`:
```typescript
const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
  keywords: [
    "i don't know", 
    "are you ready for the exercises",
    "your new keyword here"  // Add new keyword
  ],
  onKeywordDetected: (keyword, fullTranscript) => {
    // Add new condition
    if (keyword.toLowerCase() === "your new keyword here") {
      // Trigger your action
    }
  },
  // ...
});
```

2. Create the corresponding callback function in `Index.tsx`
3. Pass the callback to the `VideoChat` component

## Debugging

Console logs are available for:
- Speech recognition start/stop events
- Real-time transcripts
- Keyword detection events
- Connection state changes

Check the browser console for detailed logs during development.
