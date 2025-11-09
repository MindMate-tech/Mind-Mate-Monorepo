# Beyond Presence Call Sync Setup Guide

This guide explains how to set up the integration between Beyond Presence API and Supabase to automatically sync calls and messages.

## Overview

The system automatically:
1. Fetches calls from Beyond Presence API (https://api.bey.dev)
2. Retrieves messages for each call
3. Stores all data in Supabase tables
4. Syncs data when calls end, on disconnect, and periodically

## Prerequisites

1. **Supabase Account**: You need a Supabase project
2. **Beyond Presence API Key**: Get your API key from https://bey.dev

## Setup Steps

### 1. Create Supabase Tables

Run the SQL schema in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_schema.sql` in this directory
4. Copy and paste the entire SQL into the SQL Editor
5. Click **Run** to execute

This will create two tables:
- `beyond_calls` - Stores call information
- `beyond_call_messages` - Stores individual messages from calls

### 2. Configure Environment Variables

Create or update your `.env` file in the `patient_frontend` directory:

```env
# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Beyond Presence API Key (NEW - REQUIRED)
VITE_BEYOND_API_KEY=your_beyond_presence_api_key_here
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

**To get your Beyond Presence API key:**
1. Go to https://bey.dev
2. Sign in to your account
3. Navigate to API settings
4. Copy your API key

### 3. Test the Connection

The system automatically tests connections when the VideoChat component loads. Check the browser console for connection status messages.

You can also manually test connections by importing and calling:

```typescript
import { testConnections } from '@/utils/testConnection';

testConnections().then((result) => {
  console.log('Supabase:', result.supabase);
  console.log('Beyond Presence:', result.beyondPresence);
});
```

## How It Works

### Automatic Syncing

The system syncs calls and messages automatically:

1. **On Session Creation**: When a Beyond Presence session is created, the system immediately syncs any ended calls
2. **On Disconnect**: When the LiveKit connection disconnects, all ended calls are synced
3. **Periodic Sync**: Every 5 minutes, the system syncs all ended calls
4. **On Unmount**: When the component unmounts, ended calls are synced

### Data Flow

1. **Fetch Calls**: The system calls `GET /v1/calls` to list all calls
2. **Filter Ended Calls**: Only calls with `ended_at` timestamp are synced
3. **Fetch Messages**: For each call, `GET /v1/calls/{id}/messages` retrieves all messages
4. **Store in Supabase**: Calls and messages are stored in the respective tables

### Table Structure

#### `beyond_calls`
- `id` (UUID) - Primary key
- `call_id` (TEXT) - Beyond Presence call ID (unique)
- `agent_id` (TEXT) - Agent ID managing the call
- `started_at` (TIMESTAMPTZ) - Call start time
- `ended_at` (TIMESTAMPTZ) - Call end time (null if ongoing)
- `synced_at` (TIMESTAMPTZ) - When the call was synced
- `created_at` (TIMESTAMPTZ) - Record creation time
- `updated_at` (TIMESTAMPTZ) - Last update time

#### `beyond_call_messages`
- `id` (UUID) - Primary key
- `call_id` (TEXT) - Foreign key to `beyond_calls.call_id`
- `message` (TEXT) - Message content
- `sent_at` (TIMESTAMPTZ) - When the message was sent
- `sender` (TEXT) - Either 'ai' or 'user'
- `synced_at` (TIMESTAMPTZ) - When the message was synced
- `created_at` (TIMESTAMPTZ) - Record creation time

## Manual Syncing

You can manually trigger a sync using the provided functions:

```typescript
import { syncEndedCalls, syncAllCalls, syncCallWithMessages } from '@/lib/syncBeyondCalls';

// Sync only ended calls
const result = await syncEndedCalls(100);
console.log(`Synced ${result.calls.length} calls with ${result.totalMessages} messages`);

// Sync all calls (including ongoing)
const allResult = await syncAllCalls(100);

// Sync a specific call with its messages
const callResult = await syncCallWithMessages('call-id-here');
```

## API Functions

### Beyond Presence API Client

Located in `src/lib/beyondPresenceApi.ts`:

- `listCalls(limit, cursor)` - List calls with pagination
- `getCall(callId)` - Get a specific call
- `listCallMessages(callId)` - Get messages for a call
- `fetchAllCalls(maxCalls)` - Fetch all calls with pagination

### Sync Functions

Located in `src/lib/syncBeyondCalls.ts`:

- `testSupabaseConnection()` - Test Supabase connection
- `syncCall(call)` - Sync a single call
- `syncCallMessages(callId, messages)` - Sync messages for a call
- `syncCallWithMessages(callId)` - Sync a complete call with messages
- `syncAllCalls(limit)` - Sync all calls
- `syncEndedCalls(limit)` - Sync only ended calls

## Troubleshooting

### Connection Test Fails

1. **Supabase Connection Failed**:
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
   - Check that the tables exist in Supabase
   - Verify Row Level Security (RLS) policies allow access

2. **Beyond Presence API Failed**:
   - Verify `VITE_BEYOND_API_KEY` is set correctly
   - Check that the API key is valid and has proper permissions
   - Ensure you're using the correct API endpoint (https://api.bey.dev)

### Data Not Syncing

1. Check browser console for error messages
2. Verify both connections are working (use `testConnections()`)
3. Ensure calls have `ended_at` timestamp (only ended calls are synced by default)
4. Check Supabase logs for any database errors

### Duplicate Data

The system checks for existing records before inserting:
- Calls are identified by `call_id`
- Messages are identified by `call_id`, `sent_at`, and `message` content

If duplicates appear, check the unique constraints in the database.

## Security Notes

1. **API Keys**: Never commit API keys to version control
2. **RLS Policies**: The default SQL schema allows all operations. You may want to restrict access based on user roles
3. **Environment Variables**: Use `.env.local` for local development (this file should be in `.gitignore`)

## Next Steps

1. Set up the Supabase tables
2. Configure environment variables
3. Test the connection
4. Monitor the console for sync activity
5. Query the Supabase tables to verify data is being stored

## Support

For issues or questions:
- Check the browser console for detailed error messages
- Review Supabase logs in the dashboard
- Verify API responses from Beyond Presence API

