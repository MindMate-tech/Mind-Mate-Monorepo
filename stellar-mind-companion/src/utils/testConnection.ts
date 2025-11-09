/**
 * Utility to test Supabase and Beyond Presence API connections
 */

import { testSupabaseConnection } from '@/lib/syncBeyondCalls';
import { listCalls } from '@/lib/beyondPresenceApi';

export interface ConnectionTestResult {
  supabase: {
    connected: boolean;
    error?: string;
  };
  beyondPresence: {
    connected: boolean;
    error?: string;
  };
}

/**
 * Test both Supabase and Beyond Presence API connections
 */
export async function testConnections(): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    supabase: { connected: false },
    beyondPresence: { connected: false },
  };

  // Test Supabase connection
  try {
    const supabaseOk = await testSupabaseConnection();
    result.supabase.connected = supabaseOk;
    if (!supabaseOk) {
      result.supabase.error = 'Failed to connect to Supabase. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    }
  } catch (error) {
    result.supabase.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Beyond Presence API connection
  try {
    await listCalls(1);
    result.beyondPresence.connected = true;
  } catch (error) {
    result.beyondPresence.connected = false;
    result.beyondPresence.error = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof Error && error.message.includes('VITE_BEYOND_API_KEY')) {
      result.beyondPresence.error = 'VITE_BEYOND_API_KEY is not configured. Please set it in your .env file.';
    }
  }

  return result;
}

