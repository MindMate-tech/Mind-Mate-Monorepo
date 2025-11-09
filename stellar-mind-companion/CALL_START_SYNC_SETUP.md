# Call Start Sync - Meeting Notes Integration

## Overview

At the start of every call, the system automatically:
1. Calls the Beyond Presence API `v1/calls` endpoint
2. Syncs all calls (including ongoing ones) to Supabase
3. Syncs all meeting notes (messages) for each call to Supabase

## How It Works

### Call Start Trigger

When a Beyond Presence avatar session is created (call starts):
1. The system automatically calls `syncCallsAtStart()`
2. This function calls the `v1/calls` API endpoint
3. For each call, it syncs:
   - Call metadata (ID, agent, timestamps)
   - All messages/meeting notes from that call

### Data Flow

```
Call Start → Beyond Presence Session Created
    ↓
Call v1/calls API endpoint
    ↓
Get all calls (up to 100 by default)
    ↓
For each call:
    ├─ Sync call data to beyond_calls table
    └─ Sync messages to beyond_call_messages table
    ↓
Update Supabase with all meeting notes
```

## Implementation Details

### Function: `syncCallsAtStart()`

Located in: `src/lib/syncBeyondCalls.ts`

**What it does:**
- Calls `GET /v1/calls` to fetch all calls
- For each call:
  - Syncs call data to `beyond_calls` table
  - Fetches messages via `GET /v1/calls/{id}/messages`
  - Syncs messages to `beyond_call_messages` table

**Parameters:**
- `limit` (default: 100) - Maximum number of calls to sync

**Returns:**
```typescript
{
  calls: SyncedCall[];      // Array of synced calls
  totalMessages: number;     // Total number of messages synced
}
```

### Integration Point

The sync is triggered in `VideoChat.tsx` when:
- Beyond Presence avatar session is successfully created
- Right after `setAvatarSessionCreated(true)`

**Code location:** `src/components/VideoChat.tsx` (lines 373-382)

## Console Logging

The system provides detailed logging with `[Call Start]` prefix:

- `[Call Start] Starting to sync all calls and meeting notes at call start...`
- `[Call Start] Calling Beyond Presence API v1/calls endpoint...`
- `[Call Start] Found X calls from API`
- `[Call Start] Syncing call {id} with meeting notes...`
- `[Call Start] ✅ Synced call {id} with X messages`
- `[Call Start] ✅ Successfully synced X calls with Y total meeting notes/messages`
- `[Call Start] ❌ Error...` (for errors)

## Supabase Tables Updated

### `beyond_calls`
Stores call information:
- `call_id` - Beyond Presence call ID
- `agent_id` - Agent managing the call
- `started_at` - Call start time
- `ended_at` - Call end time (null if ongoing)
- `synced_at` - When synced

### `beyond_call_messages`
Stores meeting notes/messages:
- `call_id` - Foreign key to call
- `message` - Message content (the meeting note)
- `sent_at` - When the message was sent
- `sender` - Either 'ai' or 'user'
- `synced_at` - When synced

## Error Handling

- If Supabase connection fails, error is logged but call continues
- If API call fails, error is logged but call continues
- If individual call sync fails, it continues with next call
- If message fetch fails for a call, call data is still synced

**The sync process never blocks the call from starting.**

## Testing

### Check Console Logs

1. Start a call (grant permissions and create avatar session)
2. Open browser DevTools → Console
3. Look for `[Call Start]` logs
4. You should see:
   - API call being made
   - Number of calls found
   - Each call being synced
   - Total messages synced

### Check Supabase

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Check `beyond_calls` table - should have call records
4. Check `beyond_call_messages` table - should have meeting notes

### Verify API Call

The function calls:
- `GET https://api.bey.dev/v1/calls` (with `x-api-key` header)
- For each call: `GET https://api.bey.dev/v1/calls/{id}/messages`

## Configuration

### Environment Variables

Make sure these are set:
```env
VITE_BEYOND_API_KEY=your_beyond_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Limit Parameter

By default, `syncCallsAtStart(100)` syncs up to 100 calls. You can adjust this:
- Increase for more calls: `syncCallsAtStart(500)`
- Decrease for faster sync: `syncCallsAtStart(50)`

## What Gets Synced

### At Call Start:
- ✅ All calls (ongoing and ended)
- ✅ All messages/meeting notes for each call
- ✅ Call metadata (timestamps, agent ID)
- ✅ Message metadata (sender, timestamp)

### What's NOT synced:
- ❌ Audio recordings (handled separately via audio batch uploads)
- ❌ Call recordings (if available via other API endpoints)

## Next Steps

After this implementation, you mentioned you'll provide next steps. The system is now ready to:
1. ✅ Sync calls at call start
2. ✅ Store meeting notes in Supabase
3. ✅ Track all call data and messages

The data is available in Supabase for:
- Analysis
- Reporting
- Integration with other systems
- Historical tracking

