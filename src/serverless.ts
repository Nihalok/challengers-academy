import { createApp } from '../server.ts';

let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    // Normalize path for Vercel serverless functions
    if (req.query?.__path) {
      const subPath = Array.isArray(req.query.__path) ? req.query.__path.join('/') : req.query.__path;
      req.url = `/api/${subPath}`;
    } else if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    // Preserve raw body for Stripe webhook verification before any Express middleware touches it
    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
      } else if (typeof req.body === 'string') {
        req.rawBody = Buffer.from(req.body);
      } else if (typeof req.body === 'object') {
        req.rawBody = Buffer.from(JSON.stringify(req.body));
      }
    }

    const app = await getApp();
    return new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      res.on('error', (err: any) => reject(err));
      app(req, res, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  } catch (err: any) {
    console.error('Vercel API handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err?.message || 'Internal Server Error'
      });
    }
  }
}
