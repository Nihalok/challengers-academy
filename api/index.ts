import { createApp } from '../server';

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }

    // Recover rewritten path from Vercel query parameter or headers
    if (req.query?.__path) {
      const subPath = Array.isArray(req.query.__path) ? req.query.__path.join('/') : req.query.__path;
      req.url = `/api/${subPath}`;
    } else {
      const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.originalUrl || req.url;
      if (matchedPath && matchedPath !== '/api' && (matchedPath.startsWith('/api') || matchedPath.startsWith('/'))) {
        req.url = matchedPath.startsWith('/api') ? matchedPath : `/api${matchedPath}`;
      } else if (req.url && !req.url.startsWith('/api')) {
        req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
      }
    }

    return cachedApp(req, res);
  } catch (err: any) {
    console.error('API serverless handler fatal error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
    }
  }
}

