import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Welcome } from './pages/Welcome'
import { ProfileSelect } from './pages/ProfileSelect'
import { Home } from './pages/Home'
import { StageView } from './pages/StageView'
import { GameRoom } from './pages/GameRoom'
import { ParentMode } from './pages/ParentMode'
import { BandmateCelebrationLayer } from './components/UI/BandmateCelebration'
import { hasAnyProfile } from './utils/storage'

// ─── Route guard: redirect to welcome if no profiles exist ───────────────────

function RootRedirect() {
  const hasProfiles = hasAnyProfile()
  return <Navigate to={hasProfiles ? '/profiles' : '/welcome'} replace />
}

// ─── App shell with router ────────────────────────────────────────────────────

function AppShell() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/profiles" element={<ProfileSelect />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stage" element={<StageView />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
        <Route path="/parent" element={<ParentMode />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global bandmate unlock celebration — renders on top of any screen */}
      <BandmateCelebrationLayer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  )
}
