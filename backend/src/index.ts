import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import mangaRoutes from './routes/manga';

const app = express();

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Configure CORS to accept requests from your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // In production, specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        node_env: process.env.NODE_ENV,
        has_supabase_url: !!process.env.SUPABASE_URL,
        has_supabase_key: !!process.env.SUPABASE_ANON_KEY,
        frontend_url: process.env.FRONTEND_URL
      },
      supabase_connection: !!supabase
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Routes
app.use('/api/manga', mangaRoutes);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });
}

// For Vercel serverless deployment
export default app; 