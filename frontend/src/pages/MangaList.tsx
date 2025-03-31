import { useState, useEffect } from 'react'
import { mangaApi, type Manga, type MangaScrapedData } from '../services/api'

export default function MangaList() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newChapter, setNewChapter] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<MangaScrapedData | null>(null)

  useEffect(() => {
    loadMangas()
  }, [])

  const loadMangas = async () => {
    try {
      setIsLoading(true)
      const data = await mangaApi.getAll()
      setMangas(data)
    } catch (err) {
      setError('Failed to load manga list')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScrape = async () => {
    if (!newUrl.trim()) {
      setError('Please enter a valid URL')
      return
    }

    try {
      setIsScraping(true)
      setError(null)
      const data = await mangaApi.scrapeUrl(newUrl)
      setScrapedData(data)
      
      // Handle potentially undefined values
      if (data.title) {
        setNewTitle(data.title)
      }
      
      if (data.chapter) {
        setNewChapter(data.chapter)
      }
    } catch (err) {
      setError('Failed to fetch manga details from URL')
      console.error(err)
    } finally {
      setIsScraping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!newTitle.trim()) {
        throw new Error('Title is required')
      }

      if (!newChapter.trim()) {
        throw new Error('Chapter number is required')
      }

      if (!newUrl.trim()) {
        throw new Error('URL is required')
      }

      console.log('Submitting manga with data:', {
        title: newTitle,
        chapter: newChapter,
        genre: scrapedData?.genre,
        imageUrl: scrapedData?.imageUrl,
        url: newUrl
      })

      const newManga = await mangaApi.add({
        title: newTitle.trim(),
        chapter: parseInt(newChapter),
        genre: scrapedData?.genre,
        imageUrl: scrapedData?.imageUrl || 'https://cdn.usegalileo.ai/sdxl10/7ab722ed-9864-4416-8938-e6d6d3b79639.png',
        url: newUrl.trim()
      })

      console.log('Successfully added manga:', newManga)
      
      // Add the new manga to the list
      setMangas(prev => [newManga, ...prev])
      
      // Reset form
      setNewTitle('')
      setNewChapter('')
      setNewUrl('')
      setScrapedData(null)
      setError('')
    } catch (err) {
      console.error('Error adding manga:', err)
      setError(err instanceof Error ? err.message : 'Failed to add manga')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true)
      await mangaApi.delete(id)
      setMangas(prev => prev.filter(manga => manga.id !== id))
    } catch (err) {
      setError('Failed to delete manga')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Manga List Section */}
      <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">My Comic List</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : mangas.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No manga added yet. Add your first one!</p>
          ) : (
            mangas.map((manga) => (
              <div key={manga.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
                <img src={manga.imageUrl} alt={manga.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <a 
                    href={manga.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate block"
                  >
                    {manga.title}
                  </a>
                  <div className="text-sm text-gray-600">
                    {manga.chapter && <span>Chapter {manga.chapter}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(manga.id)}
                  className="p-2 text-black hover:text-gray-800 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Manga Form Section */}
      <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Manga URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="url"
                placeholder="Enter manga URL"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={isScraping || isLoading}
              />
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                onClick={handleScrape}
                disabled={isScraping || isLoading || !newUrl.trim()}
              >
                {isScraping ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Enter the title"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">Chapter Number</label>
            <input
              type="text"
              id="chapter"
              placeholder="Enter chapter number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {scrapedData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
              <div className="flex items-center gap-3">
                {scrapedData.imageUrl && (
                  <img src={scrapedData.imageUrl} alt="Manga cover" className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <p className="font-medium">{scrapedData.title}</p>
                  {scrapedData.genre && <p className="text-sm text-gray-500">{scrapedData.genre}</p>}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            disabled={isLoading || isScraping}
          >
            {isLoading ? 'Adding...' : 'Add Entry'}
          </button>
        </form>
      </div>
    </div>
  )
} 