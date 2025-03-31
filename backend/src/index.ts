import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import mangaRoutes from './routes/manga';
import sqlRoutes from './routes/sql';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Configure CORS to accept requests from any origin during development
app.use(cors({
  origin: '*', // In production, you should specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Manga routes
app.use('/api/manga', mangaRoutes);

// SQL routes
app.use('/api/sql', sqlRoutes);

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
}); 