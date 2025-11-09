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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { room, token, avatarId } = req.body as {
      room?: string;
      token?: string;
      avatarId?: string;
    };

    if (!room) {
      return res.status(400).json({ error: 'Missing "room"' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Missing "token"' });
    }

    const beyApiKey = process.env.BEY_API_KEY;

    if (!beyApiKey) {
      return res.status(500).json({ error: 'BEY_API_KEY not configured' });
    }

    // Get LiveKit URL from environment
    const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://mindgate-b4zorucn.livekit.cloud';

    const requestPayload = {
      avatar_id: avatarId || '694c83e2-8895-4a98-bd16-56332ca3f449',
      livekit_url: liveKitUrl,
      livekit_token: token,
      transport_type: 'livekit'
    };

    console.log('=== Beyond Presence API Request ===');
    console.log('URL:', 'https://api.bey.dev/v1/sessions');
    console.log('Payload:', JSON.stringify(requestPayload, null, 2));
    console.log('API Key present:', !!beyApiKey);

    // Create Beyond Presence avatar session
    const avatarResponse = await fetch('https://api.bey.dev/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': beyApiKey,
      },
      body: JSON.stringify(requestPayload),
    });

    console.log('=== Beyond Presence API Response ===');
    console.log('Status:', avatarResponse.status);
    console.log('Status Text:', avatarResponse.statusText);

    if (!avatarResponse.ok) {
      const errorText = await avatarResponse.text();
      console.error('Beyond API error response:', errorText);
      return res.status(avatarResponse.status).json({
        error: 'Failed to create avatar session',
        details: errorText
      });
    }

    const avatarData = await avatarResponse.json();
    console.log('Avatar session created successfully:', JSON.stringify(avatarData, null, 2));

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      sessionId: avatarData.session_id || avatarData.id,
      data: avatarData
    });
  } catch (error) {
    console.error('Error creating avatar session:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

