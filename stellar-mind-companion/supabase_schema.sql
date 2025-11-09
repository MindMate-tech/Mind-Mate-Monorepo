-- Supabase Schema for Beyond Presence Calls and Messages
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Table: beyond_calls
-- Stores call information from Beyond Presence API
CREATE TABLE IF NOT EXISTS beyond_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT UNIQUE NOT NULL, -- Beyond Presence call ID
    agent_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: beyond_call_messages
-- Stores individual messages from calls
CREATE TABLE IF NOT EXISTS beyond_call_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT NOT NULL REFERENCES beyond_calls(call_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('ai', 'user')),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_call FOREIGN KEY (call_id) REFERENCES beyond_calls(call_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beyond_calls_call_id ON beyond_calls(call_id);
CREATE INDEX IF NOT EXISTS idx_beyond_calls_started_at ON beyond_calls(started_at);
CREATE INDEX IF NOT EXISTS idx_beyond_calls_agent_id ON beyond_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_beyond_call_messages_call_id ON beyond_call_messages(call_id);
CREATE INDEX IF NOT EXISTS idx_beyond_call_messages_sent_at ON beyond_call_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_beyond_call_messages_sender ON beyond_call_messages(sender);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE beyond_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE beyond_call_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- For now, allow all operations - you may want to restrict this based on user roles
CREATE POLICY "Allow all operations on beyond_calls" ON beyond_calls
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on beyond_call_messages" ON beyond_call_messages
    FOR ALL USING (true) WITH CHECK (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_beyond_calls_updated_at BEFORE UPDATE ON beyond_calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

