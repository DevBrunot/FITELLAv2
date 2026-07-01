import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/auth/Landing'
import { TrainerLogin } from '@/pages/auth/TrainerLogin'
import { TrainerRegister } from '@/pages/auth/TrainerRegister'
import { StudentLogin } from '@/pages/auth/StudentLogin'
import { StudentRegister } from '@/pages/auth/StudentRegister'
import { TrainerLayout } from '@/components/layout/TrainerLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Dashboard } from '@/pages/trainer/Dashboard'
import { Students } from '@/pages/trainer/Students'
import { StudentDetail } from '@/pages/trainer/StudentDetail'
import { Exercises } from '@/pages/trainer/Exercises'
import { Workouts } from '@/pages/trainer/Workouts'
import { WorkoutEditor } from '@/pages/trainer/WorkoutEditor'
import { RegistrationLinks } from '@/pages/trainer/RegistrationLinks'
import { Notifications } from '@/pages/trainer/Notifications'
import { MyWorkouts } from '@/pages/student/MyWorkouts'
import { WorkoutSession } from '@/pages/student/WorkoutSession'
import { Anamnesis } from '@/pages/student/Anamnesis'
import { StudentNotifications } from '@/pages/student/Notifications'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },

  // Trainer auth
  { path: '/trainer/login', element: <TrainerLogin /> },
  { path: '/trainer/register', element: <TrainerRegister /> },

  // Trainer protected
  {
    path: '/trainer',
    element: (
      <ProtectedRoute requiredRole="trainer">
        <TrainerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/trainer/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'students', element: <Students /> },
      { path: 'students/:id', element: <StudentDetail /> },
      { path: 'exercises', element: <Exercises /> },
      { path: 'workouts', element: <Workouts /> },
      { path: 'workouts/new', element: <WorkoutEditor /> },
      { path: 'workouts/:id', element: <WorkoutEditor /> },
      { path: 'links', element: <RegistrationLinks /> },
      { path: 'notifications', element: <Notifications /> },
    ],
  },

  // Student auth
  { path: '/student/login', element: <StudentLogin /> },
  { path: '/student/register', element: <StudentRegister /> },

  // Student protected
  {
    path: '/student',
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/student/workouts" replace /> },
      { path: 'workouts', element: <MyWorkouts /> },
      { path: 'workouts/:id', element: <WorkoutSession /> },
      { path: 'anamnesis', element: <Anamnesis /> },
      { path: 'notifications', element: <StudentNotifications /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
