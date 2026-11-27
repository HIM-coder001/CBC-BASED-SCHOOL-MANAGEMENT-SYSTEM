import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import ErrorBoundary from './components/ErrorBoundary'

import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Attendance from './pages/Attendance'
import Assignments from './pages/Assignments'
import Grades from './pages/Grades'
import Competencies from './pages/Competencies'
import LearnerProfiles from './pages/LearnerProfiles'
import ReportCards from './pages/ReportCards'
import ParentPortal from './pages/ParentPortal'
import Parents from './pages/Parents'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import Fees from './pages/Fees'
import Users from './pages/Users'
import ImportData from './pages/ImportData'
import Analytics from './pages/Analytics'
import Academic from './pages/Academic'
import Timetable from './pages/Timetable'
import Transport from './pages/Transport'
import Discipline from './pages/Discipline'
import Library from './pages/Library'
import Tpad from './pages/Tpad'
import Exams from './pages/Exams'
import Nemis from './pages/Nemis'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'

function App() {
  const { loadUser } = useAuthStore()
  useEffect(() => { loadUser() }, [loadUser])

  const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>
  const R = ({ roles, children }) => <RoleRoute roles={roles}>{children}</RoleRoute>

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/landing" element={<Landing />} />

          <Route path="/" element={<P><Dashboard /></P>} />

          <Route path="/students" element={<R roles={['ADMIN']}><Students /></R>} />
          <Route path="/teachers" element={<R roles={['ADMIN']}><Teachers /></R>} />
          <Route path="/classes" element={<R roles={['ADMIN']}><Classes /></R>} />
          <Route path="/parents" element={<R roles={['ADMIN']}><Parents /></R>} />
          <Route path="/users" element={<R roles={['ADMIN']}><Users /></R>} />
          <Route path="/import" element={<R roles={['ADMIN']}><ImportData /></R>} />

          <Route path="/attendance" element={<R roles={['ADMIN','TEACHER','STUDENT']}><Attendance /></R>} />
          <Route path="/assignments" element={<R roles={['ADMIN','TEACHER','STUDENT']}><Assignments /></R>} />
          <Route path="/grades" element={<R roles={['ADMIN','TEACHER','STUDENT']}><Grades /></R>} />
          <Route path="/competencies" element={<R roles={['ADMIN','TEACHER','STUDENT']}><Competencies /></R>} />
          <Route path="/learner-profiles" element={<R roles={['ADMIN','TEACHER','STUDENT']}><LearnerProfiles /></R>} />
          <Route path="/report-cards" element={<R roles={['ADMIN','TEACHER','STUDENT']}><ReportCards /></R>} />

          <Route path="/messages" element={<R roles={['ADMIN','TEACHER']}><Messages /></R>} />
          <Route path="/fees" element={<R roles={['ADMIN']}><Fees /></R>} />
          <Route path="/settings" element={<R roles={['ADMIN']}><Settings /></R>} />
          <Route path="/analytics" element={<R roles={['ADMIN','TEACHER']}><Analytics /></R>} />
          <Route path="/academic" element={<R roles={['ADMIN']}><Academic /></R>} />
          <Route path="/timetable" element={<R roles={['ADMIN','TEACHER','STUDENT']}><Timetable /></R>} />
          <Route path="/transport" element={<R roles={['ADMIN']}><Transport /></R>} />
          <Route path="/discipline" element={<R roles={['ADMIN','TEACHER']}><Discipline /></R>} />
          <Route path="/library" element={<R roles={['ADMIN','TEACHER']}><Library /></R>} />
          <Route path="/tpad" element={<R roles={['ADMIN','TEACHER']}><Tpad /></R>} />
          <Route path="/exams" element={<R roles={['ADMIN','TEACHER']}><Exams /></R>} />
          <Route path="/nemis" element={<R roles={['ADMIN']}><Nemis /></R>} />

          <Route path="/parent-portal" element={<R roles={['PARENT']}><ParentPortal /></R>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
