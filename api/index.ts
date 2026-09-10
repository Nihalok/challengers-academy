import { createApp } from '../server.ts';

let app: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = await createApp();
    }
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



