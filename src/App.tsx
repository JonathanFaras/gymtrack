import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { WorkoutEditPage } from './pages/WorkoutEditPage'
import { SessionPage } from './pages/SessionPage'
import { HistoryPage } from './pages/HistoryPage'
import { HistoryDetailPage } from './pages/HistoryDetailPage'
import { ProgressPage } from './pages/ProgressPage'
import { ExerciseStatsPage } from './pages/ExerciseStatsPage'
import { RecordsPage } from './pages/RecordsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ExercisesPage } from './pages/ExercisesPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/seances" element={<WorkoutsPage />} />
        <Route path="/seances/nouvelle" element={<WorkoutEditPage />} />
        <Route path="/seances/:id" element={<WorkoutEditPage />} />
        <Route path="/entrainement/:id" element={<SessionPage />} />
        <Route path="/historique" element={<HistoryPage />} />
        <Route path="/historique/:id" element={<HistoryDetailPage />} />
        <Route path="/progression" element={<ProgressPage />} />
        <Route path="/progression/:exerciseId" element={<ExerciseStatsPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/exercices" element={<ExercisesPage />} />
        <Route path="/parametres" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
