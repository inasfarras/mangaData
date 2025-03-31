import { useState } from 'react'
import Editor from '@monaco-editor/react'

interface SqlEditorProps {
  onExecute?: (sql: string) => void
}

interface QueryResponse {
  success: boolean
  data: any[]
  message: string
  error?: string
}

const exampleQueries = [
  {
    name: 'Select All Manga',
    query: `SELECT * FROM manga;`
  },
  {
    name: 'Count by Genre',
    query: `SELECT genre, COUNT(*) as count 
FROM manga 
GROUP BY genre;`
  },
  {
    name: 'Latest Chapters',
    query: `SELECT title, chapter 
FROM manga 
ORDER BY chapter DESC 
LIMIT 5;`
  }
]

export default function SqlEditor({ onExecute }: SqlEditorProps) {
  const [sql, setSql] = useState('')
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExecute = async () => {
    if (!sql.trim()) {
      setError('Please enter a SQL query')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch('http://localhost:3000/api/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to execute query')
      }

      setResult(data)
      onExecute?.(sql)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute query')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (query: string) => {
    setSql(query)
    setError(null)
    setResult(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">SQL Editor</h2>
        <button
          onClick={handleExecute}
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Executing...' : 'Execute Query'}
        </button>
      </div>

      <div className="flex gap-4 p-4 border-b">
        <div className="text-sm text-gray-600">Example Queries:</div>
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example.query)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            {example.name}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={sql}
          onChange={(value: string | undefined) => setSql(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-500">
          <div className="font-bold mb-1">Error:</div>
          <div>{error}</div>
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-50">
          <div className="font-bold mb-2">Result:</div>
          <pre className="whitespace-pre-wrap overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 