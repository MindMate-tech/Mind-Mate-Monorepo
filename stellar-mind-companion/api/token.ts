import { AccessToken } from 'livekit-server-sdk';

interface VercelRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const room = req.query.room as string;
  const username = req.query.username as string;

  if (!room) {
    return res.status(400).json({ error: 'Missing "room"' });
  }
  if (!username) {
    return res.status(400).json({ error: 'Missing "username"' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' });
  }

  try {
    const token = new AccessToken(apiKey, apiSecret, { identity: username });
    token.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ token: await token.toJwt() });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

