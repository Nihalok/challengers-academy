import { createApp } from '../server';

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }
    
    // Ensure URL has /api prefix for Express routing on Vercel
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    
    return cachedApp(req, res);
  } catch (err: any) {
    console.error('API serverless handler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}
