import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// MVC backend routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { getStats } from './controllers/studentController.js';
import { authenticateUser } from './middleware/authMiddleware.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Custom middleware to handle base64 documents and larger metadata packages
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- MVC ROUTE REGISTERING ---
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/notifications', notificationRoutes);
  
  // Stats route mapped for backward compatibility matching client request URL
  app.get('/api/stats', authenticateUser, getStats);

  // --- VITE DEVELOPMENT OR PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASU MVC Server] active and listening on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
