import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const PYTHON_PORT = 8000;
let pythonProcess: ChildProcess | null = null;

// Function to start FastAPI Python service
function startPythonBackend() {
  console.log('[Server] Starting NexaDS FastAPI ML Engine...');
  pythonProcess = spawn('python3', [
    '-m', 'uvicorn',
    'backend.app.main:app',
    '--host', '127.0.0.1',
    '--port', String(PYTHON_PORT)
  ], {
    stdio: 'inherit',
    detached: false
  });

  pythonProcess.on('error', (err) => {
    console.error('[Server] Failed to launch Python backend process:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[Server] Python backend exited with code ${code} and signal ${signal}`);
  });
}

// Function to check if Python backend is ready
async function waitForPythonBackend(retries = 30): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${PYTHON_PORT}/api/health`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      console.log('[Server] Python FastAPI ML Engine is healthy & ready.');
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.warn('[Server] Python backend readiness timeout; continuing with proxy setup.');
  return false;
}

async function startServer() {
  const app = express();

  // Launch Python backend
  startPythonBackend();
  waitForPythonBackend();

  // Proxy /api requests to FastAPI backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://127.0.0.1:${PYTHON_PORT}`,
      changeOrigin: true,
      ws: true,
      onError: (err: Error, req: any, res: any) => {
        console.error('[Proxy Error]:', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Backend AI Engine starting up or unavailable', detail: err.message }));
        }
      }
    } as any)
  );

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] NexaDS application running at http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Server] Shutting down gracefully...');
    if (pythonProcess) {
      pythonProcess.kill();
    }
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  if (pythonProcess) pythonProcess.kill();
  process.exit(1);
});
