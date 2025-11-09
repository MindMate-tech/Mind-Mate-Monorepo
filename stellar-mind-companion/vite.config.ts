import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { AccessToken } from 'livekit-server-sdk';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
  server: {
    host: "::",
    port: 8080,
    // Custom middleware to handle API routes in development
    proxy: mode === "development" ? undefined : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && {
      name: 'livekit-api',
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          const url = req.url || '';

          // Handle token endpoint
          if (url.startsWith('/api/token')) {
            try {
              const parsedUrl = new URL(url, `http://${req.headers.host}`);
              const room = parsedUrl.searchParams.get('room');
              const username = parsedUrl.searchParams.get('username');

              if (!room) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing "room"' }));
                return;
              }
              if (!username) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing "username"' }));
                return;
              }

              const apiKey = env.LIVEKIT_API_KEY;
              const apiSecret = env.LIVEKIT_API_SECRET;

              if (!apiKey || !apiSecret) {
                console.error('Missing LiveKit credentials. LIVEKIT_API_KEY:', !!apiKey, 'LIVEKIT_API_SECRET:', !!apiSecret);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'LiveKit credentials not configured' }));
                return;
              }

              const token = new AccessToken(apiKey, apiSecret, { identity: username });
              token.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store');
              res.end(JSON.stringify({ token: await token.toJwt() }));
              return;
            } catch (error) {
              console.error('Error generating token:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal server error' }));
              return;
            }
          }

          // Handle avatar endpoint
          if (url.startsWith('/api/avatar') && req.method === 'POST') {
            try {
              let body = '';

              req.on('data', (chunk: any) => {
                body += chunk.toString();
              });

              req.on('end', async () => {
                try {
                  const { room, token, avatarId } = JSON.parse(body);

                  if (!room) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Missing "room"' }));
                    return;
                  }

                  if (!token) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Missing "token"' }));
                    return;
                  }

                  const beyApiKey = env.BEY_API_KEY;

                  if (!beyApiKey) {
                    console.error('Missing BEY_API_KEY');
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'BEY_API_KEY not configured' }));
                    return;
                  }

                  // Generate a token for the avatar
                  const apiKey = env.LIVEKIT_API_KEY;
                  const apiSecret = env.LIVEKIT_API_SECRET;

                  if (!apiKey || !apiSecret) {
                    console.error('Missing LiveKit credentials for avatar');
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'LiveKit credentials not configured' }));
                    return;
                  }

                  const avatarToken = new AccessToken(apiKey, apiSecret, {
                    identity: 'bey-avatar-agent'
                  });
                  avatarToken.addGrant({
                    room,
                    roomJoin: true,
                    canPublish: true,
                    canSubscribe: true
                  });
                  const avatarJwt = await avatarToken.toJwt();

                  const liveKitUrl = env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://mindgate-b4zorucn.livekit.cloud';

                  const requestPayload = {
                    avatar_id: avatarId || '694c83e2-8895-4a98-bd16-56332ca3f449',
                    livekit_url: liveKitUrl,
                    livekit_token: avatarJwt,
                    transport_type: 'livekit'
                  };

                  console.log('=== Creating Beyond Presence session ===');
                  console.log('URL: https://api.bey.dev/v1/sessions');
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
                    res.statusCode = avatarResponse.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: 'Failed to create avatar session',
                      details: errorText
                    }));
                    return;
                  }

                  const avatarData = await avatarResponse.json() as any;
                  console.log('=== Beyond avatar session created successfully ===');
                  console.log(JSON.stringify(avatarData, null, 2));

                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Cache-Control', 'no-store');
                  res.end(JSON.stringify({
                    success: true,
                    sessionId: avatarData.session_id || avatarData.id,
                    data: avatarData
                  }));
                } catch (parseError) {
                  console.error('Error parsing request or creating avatar:', parseError);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'Internal server error',
                    details: parseError instanceof Error ? parseError.message : String(parseError)
                  }));
                }
              });

              return;
            } catch (error) {
              console.error('Error in avatar endpoint:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal server error' }));
              return;
            }
          }

          // Pass to next middleware if not an API route
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}});
