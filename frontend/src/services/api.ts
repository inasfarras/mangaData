import axios from 'axios'

// Create axios instance with the backend URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add logging interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  }, 
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

export interface Manga {
  id: string
  title: string
  chapter: number
  genre?: string
  imageUrl: string
  url: string
  createdAt: string
}

export interface MangaInput {
  title: string
  chapter: number
  genre?: string
  imageUrl: string
  url: string
}

export interface MangaScrapedData {
  title?: string
  chapter?: string
  genre?: string
  imageUrl?: string
}

export const mangaApi = {
  getAll: async (): Promise<Manga[]> => {
    const response = await api.get<Manga[]>('/manga')
    return response.data
  },

  add: async (manga: MangaInput): Promise<Manga> => {
    const response = await api.post<Manga>('/manga', manga)
    return response.data
  },

  update: async (id: string, manga: Partial<Manga>) => {
    const response = await api.put<Manga>(`/manga/${id}`, manga)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/manga/${id}`)
  },

  scrapeUrl: async (url: string): Promise<MangaScrapedData> => {
    const response = await api.post<MangaScrapedData>('/manga/scrape', { url })
    return response.data
  },
}

export default api 