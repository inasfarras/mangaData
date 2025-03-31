import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MangaList from './pages/MangaList'
import SqlEditorPage from './pages/SqlEditorPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MangaList />} />
          <Route path="sql" element={<SqlEditorPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App 