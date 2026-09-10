import { createApp } from '../server.ts';

let app: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = await createApp();
    }
    return app(req, res);
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


