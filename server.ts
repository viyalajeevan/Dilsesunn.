import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MatchingEngine } from './server/matcher.js';
import {
  MatchRequest,
  UserEligibilityProfile,
  ActiveSession,
  RealtimeMessage,
  SupportPreference,
  SupportTopic,
  CommunicationPreference
} from './src/types/peerSupport.js';

import fs from 'fs';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Gemini AI Client configuration (read only from process.env, never hard-coded)
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log('Gemini AI client initialized successfully from environment variable.');
  } catch (err) {
    console.warn('Gemini AI client initialization skipped or failed:', err);
    aiClient = null;
  }
} else {
  console.log('No GEMINI_API_KEY or API_KEY found in process.env. AI features will use gentle empathetic fallbacks.');
}

// Manually route WebSocket upgrades: /ws is handled by peer-support wss, other upgrades are safely ignored
server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || '127.0.0.1';
    const parsedUrl = new URL(request.url || '', `http://${host}`);
    if (parsedUrl.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
      return;
    }
  } catch {
    if (request.url && request.url.startsWith('/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
      return;
    }
  }

  // Gracefully close non-/ws socket without emitting unhandled errors
  socket.destroy();
});

// Permissive CORS for PWABuilder, Lighthouse, and mobile device crawlers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Simple GET /health route returning { ok: true }
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Explicit manifest route handlers with correct MIME type
const handleManifest = (_req: express.Request, res: express.Response) => {
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(manifestPath);
  } else {
    res.status(404).json({ error: 'manifest.json not found' });
  }
};

app.get('/manifest.json', handleManifest);
app.get('/manifest.webmanifest', handleManifest);
app.get('/site.webmanifest', handleManifest);

// Download manifest file directly as an attachment
app.get('/api/download-manifest', (_req, res) => {
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.json');
  res.download(manifestPath, 'manifest.json');
});

// Download comprehensive Android APK & TWA Package ZIP
app.get('/api/download-apk-package', async (_req, res) => {
  try {
    const archive = new ZipArchive({ zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="DilSeSunn-Android-APK-Package.zip"');

    archive.pipe(res);

    // Include manifest.json
    const manifestPath = path.resolve(__dirname, 'public', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      archive.file(manifestPath, { name: 'manifest.json' });
    }

    // Include TWA manifest for Bubblewrap (official Google PWA-to-APK CLI tool)
    const hostHeader = _req.get('host') || 'dilsesunn.onrender.com';
    const protocol = _req.protocol || 'https';
    const appBaseUrl = `${protocol}://${hostHeader}`;
    const twaManifest = {
      packageId: 'com.dilsesunn.app',
      host: hostHeader,
      name: 'DilSeSunn — Anonymous Peer Support',
      launcherName: 'DilSeSunn',
      themeColor: '#0f172a',
      navigationColor: '#0f172a',
      backgroundColor: '#0f172a',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: '/pwa-512x512.png',
      maskableIconUrl: '/pwa-maskable-512x512.png',
      appVersion: '1.0.0',
      appVersionCode: 1,
      shortcuts: [
        {
          name: 'Find a Listener',
          shortName: 'Listen',
          url: '/',
          chosenIconUrl: '/pwa-192x192.png'
        }
      ],
      generator: 'DilSeSunn APK Bundler'
    };
    archive.append(JSON.stringify(twaManifest, null, 2), { name: 'twa-manifest.json' });

    // Include icons
    const icon192 = path.resolve(__dirname, 'public', 'pwa-192x192.png');
    const icon512 = path.resolve(__dirname, 'public', 'pwa-512x512.png');
    const iconMask = path.resolve(__dirname, 'public', 'pwa-maskable-512x512.png');
    if (fs.existsSync(icon192)) archive.file(icon192, { name: 'res/icon-192.png' });
    if (fs.existsSync(icon512)) archive.file(icon512, { name: 'res/icon-512.png' });
    if (fs.existsSync(iconMask)) archive.file(iconMask, { name: 'res/icon-maskable-512.png' });

    // Include step-by-step instructions
    const readmeContent = `# DilSeSunn — Android APK & Native App Generation Guide

Thank you for downloading the DilSeSunn native Android build package!

## OPTION 1: 1-Click Native WebAPK Install (No PC required!)
1. Open DilSeSunn on your Android device in Google Chrome, Samsung Internet, Edge, or Brave:
   ${appBaseUrl}
2. Tap the "Install DilSeSunn on Android" button inside the app, or tap Chrome's menu (3 dots) -> "Install app".
3. Android automatically builds, signs, and installs the official WebAPK directly into your phone's app launcher!

---

## OPTION 2: Generate Standalone .APK File via PWABuilder (Online, 60 seconds)
1. Go to https://www.pwabuilder.com
2. Upload the included "manifest.json" and "res/icon-512.png" from this ZIP file.
3. Click "Package for Stores" -> "Android".
4. Click "Generate APK" or "Generate AAB" (for Google Play).
5. Download your signed or test .apk file and install it directly onto any Android device!

---

## OPTION 3: Build APK via Bubblewrap CLI (Google's official Trusted Web Activity tool)
If you have Node.js and Java installed on your computer:
1. Open a terminal in this unzipped folder.
2. Run:
   npx @bubblewrap/cli init --manifest=manifest.json
3. Run:
   npx @bubblewrap/cli build
4. Your signed app-release-signed.apk is ready in the output folder!
`;
    archive.append(readmeContent, { name: 'README-HOW-TO-GET-APK.md' });

    // Include portable offline launcher HTML
    const offlineLauncher = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DilSeSunn App Launcher</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 440px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; font-size: 24px; color: #fff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    a.btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>DilSeSunn — Anonymous Peer Support</h1>
    <p>A safe, non-judgmental shoulder to listen for strangers to discuss problems anonymously in real-time.</p>
    <a class="btn" href="${appBaseUrl}" target="_blank">Launch DilSeSunn Web App</a>
  </div>
</body>
</html>`;
    archive.append(offlineLauncher, { name: 'DilSeSunn-Launcher.html' });

    await archive.finalize();
  } catch (err) {
    console.error('Error generating APK package zip:', err);
    res.status(500).json({ error: 'Failed to generate APK bundle' });
  }
});

// Serve static assets from public before Vite
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(express.json());

// State Store
const matchingEngine = new MatchingEngine();
const socketRegistry = new Map<string, WebSocket>(); // userId -> WebSocket
const userProfiles = new Map<string, UserEligibilityProfile>(); // userId -> Profile
const matchQueue: MatchRequest[] = []; // Pending requests
const activeSessions = new Map<string, ActiveSession>(); // sessionId -> Session
const userActiveSessionMap = new Map<string, string>(); // userId -> sessionId
const sessionMessages = new Map<string, RealtimeMessage[]>(); // sessionId -> messages
const reports: Array<{ reporterId: string; reportedId: string; reason: string; timestamp: number }> = [];

// Helper to check socket connectivity
const isSocketConnected = (userId: string): boolean => {
  const ws = socketRegistry.get(userId);
  return !!ws && ws.readyState === WebSocket.OPEN;
};

// Process Matchmaking Queue
function processQueue() {
  if (matchQueue.length === 0) return;

  const listeners = Array.from(userProfiles.values());

  for (let i = matchQueue.length - 1; i >= 0; i--) {
    const request = matchQueue[i];

    // Ensure requester is still connected
    if (!isSocketConnected(request.requesterId)) {
      matchQueue.splice(i, 1);
      continue;
    }

    const match = matchingEngine.findBestMatch(request, listeners, isSocketConnected);

    if (match) {
      // Remove from queue
      matchQueue.splice(i, 1);

      const listener = match.listener;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      // Resolve communication mode
      let finalMode: 'text' | 'voice' = 'text';
      if (request.communicationMode === 'voice' && listener.acceptedCommunicationModes.includes('voice')) {
        finalMode = 'voice';
      } else if (request.communicationMode === 'either') {
        if (listener.acceptedCommunicationModes.includes('voice')) {
          finalMode = 'voice';
        } else {
          finalMode = 'text';
        }
      }

      const session: ActiveSession = {
        sessionId,
        requesterId: request.requesterId,
        requesterTag: request.requesterTag,
        requesterAura: request.requesterAura,
        listenerId: listener.userId,
        listenerTag: listener.uniqueTag,
        listenerAura: listener.auraColor,
        supportPreference: request.supportPreference,
        topic: request.topic,
        communicationMode: finalMode,
        status: 'active',
        startedAt: Date.now(),
        endedAt: null
      };

      activeSessions.set(sessionId, session);
      userActiveSessionMap.set(request.requesterId, sessionId);
      userActiveSessionMap.set(listener.userId, sessionId);
      sessionMessages.set(sessionId, []);

      // Update listener profile
      listener.activeSessionId = sessionId;

      // Notify Requester
      sendToUser(request.requesterId, {
        type: 'MATCH_FOUND',
        payload: {
          session,
          role: 'requester',
          peer: {
            userId: listener.userId,
            uniqueTag: listener.uniqueTag,
            alias: listener.alias,
            auraColor: listener.auraColor
          },
          matchScore: match.totalScore,
          scoreBreakdown: match.breakdown
        }
      });

      // Notify Listener
      sendToUser(listener.userId, {
        type: 'MATCH_FOUND',
        payload: {
          session,
          role: 'listener',
          peer: {
            userId: request.requesterId,
            uniqueTag: request.requesterTag,
            alias: 'Someone seeking a listening shoulder',
            auraColor: request.requesterAura
          },
          matchScore: match.totalScore,
          scoreBreakdown: match.breakdown
        }
      });

      broadcastStats();
    }
  }
}

function sendToUser(userId: string, data: unknown) {
  const ws = socketRegistry.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastStats() {
  const stats = {
    onlineUsersCount: socketRegistry.size,
    availableListenersCount: Array.from(userProfiles.values()).filter(
      (u) => u.isAvailableAsListener && isSocketConnected(u.userId) && !u.activeSessionId
    ).length,
    activeSessionsCount: activeSessions.size,
    queueLength: matchQueue.length
  };

  const payload = JSON.stringify({ type: 'STATS_UPDATE', payload: stats });
  for (const ws of socketRegistry.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  let authenticatedUserId: string | null = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { type, payload } = msg;

      switch (type) {
        case 'INIT_PROFILE': {
          authenticatedUserId = payload.userId;
          socketRegistry.set(payload.userId, ws);

          const existing = userProfiles.get(payload.userId);
          const profile: UserEligibilityProfile = {
            userId: payload.userId,
            uniqueTag: payload.uniqueTag,
            alias: payload.alias,
            auraColor: payload.auraColor,
            isAgeConfirmed: payload.isAgeConfirmed ?? true,
            isSuspended: existing?.isSuspended ?? false,
            isAvailableAsListener: payload.isAvailableAsListener ?? false,
            acceptedSupportStyles: payload.acceptedSupportStyles || [
              'listen_without_advice',
              'different_perspective',
              'similar_experience',
              'keep_company',
              'lighthearted'
            ],
            acceptedTopics: payload.acceptedTopics || ['anything', 'health', 'family', 'work', 'grief', 'other'],
            acceptedCommunicationModes: payload.acceptedCommunicationModes || ['text', 'voice'],
            activeSessionId: userActiveSessionMap.get(payload.userId) || null,
            lastActiveSessionEndedAt: existing?.lastActiveSessionEndedAt || null,
            totalSessionsCompleted: existing?.totalSessionsCompleted || 0
          };

          userProfiles.set(payload.userId, profile);

          ws.send(
            JSON.stringify({
              type: 'PROFILE_SYNCD',
              payload: {
                profile,
                activeSession: profile.activeSessionId ? activeSessions.get(profile.activeSessionId) : null
              }
            })
          );

          broadcastStats();
          processQueue();
          break;
        }

        case 'UPDATE_LISTENER_AVAILABILITY': {
          if (!authenticatedUserId) return;
          const profile = userProfiles.get(authenticatedUserId);
          if (profile) {
            profile.isAvailableAsListener = !!payload.isAvailable;
            if (payload.acceptedSupportStyles) profile.acceptedSupportStyles = payload.acceptedSupportStyles;
            if (payload.acceptedTopics) profile.acceptedTopics = payload.acceptedTopics;
            if (payload.acceptedCommunicationModes) profile.acceptedCommunicationModes = payload.acceptedCommunicationModes;

            ws.send(JSON.stringify({ type: 'LISTENER_STATUS_UPDATED', payload: profile }));
            broadcastStats();
            processQueue();
          }
          break;
        }

        case 'REQUEST_MATCH': {
          if (!authenticatedUserId) return;

          // Remove any existing request by this user
          const existingIdx = matchQueue.findIndex((q) => q.requesterId === authenticatedUserId);
          if (existingIdx !== -1) {
            matchQueue.splice(existingIdx, 1);
          }

          const matchReq: MatchRequest = {
            requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            requesterId: authenticatedUserId,
            requesterTag: payload.requesterTag,
            requesterAura: payload.requesterAura,
            supportPreference: payload.supportPreference,
            topic: payload.topic,
            communicationMode: payload.communicationMode,
            createdAt: Date.now()
          };

          matchQueue.push(matchReq);

          ws.send(
            JSON.stringify({
              type: 'MATCH_REQUEST_QUEUED',
              payload: {
                position: matchQueue.length,
                requestId: matchReq.requestId
              }
            })
          );

          broadcastStats();
          processQueue();
          break;
        }

        case 'CANCEL_MATCH_REQUEST': {
          if (!authenticatedUserId) return;
          const idx = matchQueue.findIndex((q) => q.requesterId === authenticatedUserId);
          if (idx !== -1) {
            matchQueue.splice(idx, 1);
            ws.send(JSON.stringify({ type: 'MATCH_REQUEST_CANCELLED' }));
            broadcastStats();
          }
          break;
        }

        case 'CHAT_MESSAGE': {
          if (!authenticatedUserId) return;
          const sessionId = userActiveSessionMap.get(authenticatedUserId);
          if (!sessionId) return;

          const session = activeSessions.get(sessionId);
          if (!session || session.status !== 'active') return;

          // Sanitize message
          const rawText = String(payload.text || '').trim();
          if (!rawText) return;

          const recipientId = session.requesterId === authenticatedUserId ? session.listenerId : session.requesterId;

          const msgObj: RealtimeMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            sessionId,
            senderId: authenticatedUserId,
            senderTag: payload.senderTag,
            text: rawText,
            timestamp: Date.now()
          };

          const history = sessionMessages.get(sessionId) || [];
          history.push(msgObj);
          sessionMessages.set(sessionId, history);

          // Deliver to recipient and echo to sender
          sendToUser(recipientId, { type: 'CHAT_MESSAGE_DELIVERED', payload: msgObj });
          ws.send(JSON.stringify({ type: 'CHAT_MESSAGE_DELIVERED', payload: msgObj }));
          break;
        }

        case 'TYPING_INDICATOR': {
          if (!authenticatedUserId) return;
          const sessionId = userActiveSessionMap.get(authenticatedUserId);
          if (!sessionId) return;
          const session = activeSessions.get(sessionId);
          if (!session) return;
          const recipientId = session.requesterId === authenticatedUserId ? session.listenerId : session.requesterId;
          sendToUser(recipientId, { type: 'PEER_TYPING', payload: { isTyping: !!payload.isTyping } });
          break;
        }

        case 'WEBRTC_SIGNAL': {
          if (!authenticatedUserId) return;
          const sessionId = userActiveSessionMap.get(authenticatedUserId);
          if (!sessionId) return;
          const session = activeSessions.get(sessionId);
          if (!session) return;
          const recipientId = session.requesterId === authenticatedUserId ? session.listenerId : session.requesterId;
          sendToUser(recipientId, {
            type: 'WEBRTC_SIGNAL',
            payload: payload
          });
          break;
        }

        case 'END_SESSION': {
          if (!authenticatedUserId) return;
          const sessionId = userActiveSessionMap.get(authenticatedUserId);
          if (!sessionId) return;

          const session = activeSessions.get(sessionId);
          if (session) {
            session.status = 'ended';
            session.endedAt = Date.now();

            const p1 = session.requesterId;
            const p2 = session.listenerId;

            userActiveSessionMap.delete(p1);
            userActiveSessionMap.delete(p2);

            const listenerProfile = userProfiles.get(session.listenerId);
            if (listenerProfile) {
              listenerProfile.activeSessionId = null;
              listenerProfile.lastActiveSessionEndedAt = Date.now();
              listenerProfile.totalSessionsCompleted += 1;
            }

            const requesterProfile = userProfiles.get(session.requesterId);
            if (requesterProfile) {
              requesterProfile.activeSessionId = null;
              requesterProfile.lastActiveSessionEndedAt = Date.now();
              requesterProfile.totalSessionsCompleted += 1;
            }

            sendToUser(p1, { type: 'SESSION_ENDED', payload: { sessionId } });
            sendToUser(p2, { type: 'SESSION_ENDED', payload: { sessionId } });

            activeSessions.delete(sessionId);
            broadcastStats();
            processQueue();
          }
          break;
        }

        case 'REPORT_AND_BLOCK': {
          if (!authenticatedUserId) return;
          const { reportedUserId, reason } = payload;

          reports.push({
            reporterId: authenticatedUserId,
            reportedId: reportedUserId,
            reason: reason || 'misconduct',
            timestamp: Date.now()
          });

          // Enforce mutual block in matching engine
          matchingEngine.addBlock(authenticatedUserId, reportedUserId);

          // Immediately terminate any active session
          const sessionId = userActiveSessionMap.get(authenticatedUserId);
          if (sessionId) {
            const session = activeSessions.get(sessionId);
            if (session) {
              session.status = 'ended';
              userActiveSessionMap.delete(session.requesterId);
              userActiveSessionMap.delete(session.listenerId);
              sendToUser(session.requesterId, { type: 'SESSION_TERMINATED_SAFETY', payload: { reason: 'reported' } });
              sendToUser(session.listenerId, { type: 'SESSION_TERMINATED_SAFETY', payload: { reason: 'reported' } });
              activeSessions.delete(sessionId);
            }
          }

          ws.send(JSON.stringify({ type: 'USER_REPORTED_AND_BLOCKED', payload: { reportedUserId } }));
          broadcastStats();
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (authenticatedUserId) {
      socketRegistry.delete(authenticatedUserId);
      // Remove from match queue if waiting
      const qIdx = matchQueue.findIndex((q) => q.requesterId === authenticatedUserId);
      if (qIdx !== -1) {
        matchQueue.splice(qIdx, 1);
      }
      broadcastStats();
    }
  });
});


app.get('/api/stats', (_req, res) => {
  res.json({
    onlineUsersCount: socketRegistry.size,
    availableListenersCount: Array.from(userProfiles.values()).filter(
      (u) => u.isAvailableAsListener && isSocketConnected(u.userId) && !u.activeSessionId
    ).length,
    activeSessionsCount: activeSessions.size,
    queueLength: matchQueue.length
  });
});

// AI Reflection / Listening Partner endpoint with graceful fallback
app.post('/api/ai-reflect', async (req, res) => {
  const { prompt, topic } = req.body || {};
  const userText = String(prompt || '').trim();

  // If Gemini client is active, attempt to generate an empathetic response
  if (aiClient && userText) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are an empathetic, calm, non-judgmental anonymous human listener on DilSeSunn peer support. Topic: ${topic || 'general life'}. Provide a brief, validating, gentle response (2-3 sentences max) without offering unwanted medical or legal advice: "${userText}"`
              }
            ]
          }
        ]
      });

      const reply = response.text?.trim() || '';
      if (reply) {
        return res.json({ ok: true, reply, source: 'ai' });
      }
    } catch (err) {
      console.warn('Gemini generateContent call failed, using graceful fallback:', err);
    }
  }

  // Graceful empathetic fallback when GEMINI_API_KEY is not set or request encounters an error
  const fallbackReplies = [
    "Thank you for sharing this with me. It takes real courage to open up, and you don't have to carry this alone. I am right here listening.",
    "I hear how much is weighing on your mind right now. Take a slow, gentle breath. What you are feeling is completely valid.",
    "Thank you for putting this into words. Whatever you are navigating today, please be gentle with yourself. You are heard and valued."
  ];
  const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  return res.json({ ok: true, reply, source: 'fallback' });
});

// Serve static assets from public (manifest, icons, etc.)
app.use(express.static(path.resolve(__dirname, 'public')));

// Start Server & Integrate Vite / Production Dist
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    console.log('Serving production build from dist folder (Vite dev server skipped)');
    const distPath = path.resolve(__dirname, 'dist');
    const distHtmlPath = path.resolve(distPath, 'index.html');

    // Serve built static files from dist
    app.use(express.static(distPath));

    // Send dist/index.html for any route that is not /api or /ws (SPA fallback)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
      }
      if (fs.existsSync(distHtmlPath)) {
        res.sendFile(distHtmlPath);
      } else {
        res.status(404).send('Build not found. Please run "npm run build" first.');
      }
    });
  } else {
    console.log('Initializing Vite in SPA middleware mode for development');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback catch-all to transform index.html for any SPA routes in development
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/ws')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const rootHtmlPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(rootHtmlPath)) {
          let template = fs.readFileSync(rootHtmlPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`DilSeSunn server running on http://0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

start();
