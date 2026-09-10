import { createApp } from '../server';

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }

    // In Vercel serverless rewrites, recover original requested URL
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.originalUrl || req.url;
    if (matchedPath && (matchedPath.startsWith('/api') || matchedPath.startsWith('/'))) {
      req.url = matchedPath.startsWith('/api') ? matchedPath : `/api${matchedPath}`;
    } else if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    return new Promise((resolve) => {
      cachedApp(req, res, (err: any) => {
        if (err) {
          console.error('Express serverless error:', err);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
          }
          return resolve(err);
        }
        if (!res.headersSent) {
          res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
        }
        resolve(true);
      });
    });
  } catch (err: any) {
    console.error('API serverless handler fatal error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
    }
  }
}

