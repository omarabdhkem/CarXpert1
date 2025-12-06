import express from 'express';
import path from 'path';

export function setupVite(app: any) {
  // In development, let Vite handle the frontend
  // This is a placeholder for Vite dev server middleware
}

export function serveStatic(app: any) {
  // Serve static files from the client build directory
  const clientDistPath = path.join(__dirname, '../client');
  
  app.use(express.static(clientDistPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

export function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}
