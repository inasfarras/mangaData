import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import mangaRoutes from './routes/manga';
import sqlRoutes from './routes/sql';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 