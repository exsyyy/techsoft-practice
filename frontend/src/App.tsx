import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CasesPage from './pages/CasesPage'
import CaseDetailPage from './pages/CaseDetailPage'
import CountriesPage from './pages/CountriesPage'
import CountryPage from './pages/CountryPage'
import TechnologiesPage from './pages/TechnologiesPage'
import GlossaryPage from './pages/GlossaryPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './api/ProtectedRout'


function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="countries" element={<CountriesPage />} />
        <Route path="countries/:slug" element={<CountryPage />} />
        <Route path="technologies" element={<TechnologiesPage />} />
        <Route path="glossary" element={<GlossaryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
        />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/countries/:slug" element={<CountryPage />} />

      </Route>
    </Routes>
  )
}

export default App
