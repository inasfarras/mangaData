import express from 'express'
import { supabase } from '../index'
import axios from 'axios'
import * as cheerio from 'cheerio'

const router = express.Router()

// Get all manga for a user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('manga')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Map the data to match the frontend Manga interface
    const mappedData = data.map(manga => ({
      id: manga.id,
      title: manga.title,
      chapter: manga.chapter,
      genre: manga.genre,
      imageUrl: manga.image_url,
      url: manga.url || '', // Handle missing url field
      createdAt: manga.created_at
    }))

    res.json(mappedData)
  } catch (error: unknown) {
    console.error('Error fetching mangas:', error)
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch mangas' })
    }
  }
})

// Add a new manga
router.post('/', async (req, res) => {
  try {
    const { title, chapter, genre, imageUrl, url } = req.body
    
    console.log('Attempting to add manga with data:', {
      title,
      chapter,
      genre,
      imageUrl,
      url
    })
    
    // Create insert object without url field if it doesn't exist in your schema
    const { data, error } = await supabase
      .from('manga')
      .insert([
        {
          title,
          chapter: Number(chapter),
          genre: genre !== 'Unknown' ? genre : null,
          image_url: imageUrl
          // url field is not included since it doesn't exist in the schema
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Successfully added manga:', data)

    // Map the response to match the frontend Manga interface
    const mappedData = {
      id: data.id,
      title: data.title,
      chapter: data.chapter,
      genre: data.genre,
      imageUrl: data.image_url,
      url: url, // Add URL from the request since it's not stored in DB
      createdAt: data.created_at
    }
    
    res.status(201).json(mappedData)
  } catch (error: unknown) {
    console.error('Error adding manga:', error)
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to add manga' })
    }
  }
})

// Delete a manga
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('manga')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.status(204).send()
  } catch (error: unknown) {
    console.error('Error deleting manga:', error)
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to delete manga' })
    }
  }
})

// Helper function to parse URL parts
function extractMangaInfo(url: string) {
  // Try to extract manga name from URL
  let urlMangaName = '';
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      // Assuming paths like /manga/manga-name or /series/manga-name
      urlMangaName = pathParts[1].replace(/-/g, ' ');
      // Capitalize words
      urlMangaName = urlMangaName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
  }
  return urlMangaName;
}

// Scrape manga details from URL
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Scraping URL:', url);

    // Get manga name from URL as fallback
    const urlMangaName = extractMangaInfo(url);
    console.log('Extracted manga name from URL:', urlMangaName);

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Different selectors for different sites
    let title = '';
    let chapter = '';
    let genre = '';
    let imageUrl = '';

    // Try to find title - look for various common selectors
    // First check for title in metadata
    const metaTitle = $('meta[property="og:title"]').attr('content') || '';
    console.log('Meta title:', metaTitle);

    if (metaTitle) {
      // If meta title contains "Chapter", split it
      if (metaTitle.toLowerCase().includes('chapter')) {
        const parts = metaTitle.split(/chapter|Chapter/i);
        title = parts[0].trim();
        // Extract chapter number if available
        if (parts.length > 1) {
          const chapterMatch = parts[1].match(/\d+/);
          if (chapterMatch) {
            chapter = chapterMatch[0];
          }
        }
      } else {
        title = metaTitle;
      }
    }

    // If still no title, try common heading selectors
    if (!title) {
      title = $('.series-name').text().trim() || 
             $('.manga-title').text().trim() || 
             $('h1').first().text().trim();
    }

    // If title contains "Chapter", split it
    if (title && title.toLowerCase().includes('chapter')) {
      const parts = title.split(/chapter|Chapter/i);
      title = parts[0].trim();
      if (parts.length > 1) {
        const chapterMatch = parts[1].match(/\d+/);
        if (chapterMatch) {
          chapter = chapterMatch[0];
        }
      }
    }

    // If still no clear title, use the URL-based name
    if (!title || title.length < 2) {
      title = urlMangaName || 'Unknown Title';
    }

    // Look for genre or tags - only set if actually found
    const foundGenre = $('.genres').text().trim() || 
           $('.manga-genres').text().trim() || 
           $('.tags').text().trim();
    
    // Clean up genre text if found
    genre = foundGenre ? foundGenre.replace(/\s+/g, ' ').trim() : '';

    // Look for image
    imageUrl = $('meta[property="og:image"]').attr('content') ||
              $('.manga-cover img').attr('src') || 
              $('.series-profile-thumb img').attr('src') || 
              $('.cover-image').attr('src') ||
              $('img.img-fluid').first().attr('src') ||
              'https://cdn.usegalileo.ai/sdxl10/7ab722ed-9864-4416-8938-e6d6d3b79639.png';

    console.log('Scraped info:', { title, chapter, genre, imageUrl });

    res.json({
      title,
      ...(genre && { genre }),
      imageUrl,
      chapter
    });
  } catch (error: unknown) {
    console.error('Scraping error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to scrape manga details' });
    }
  }
});

export default router 