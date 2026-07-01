export type Role = 'trainer' | 'student'

export type StudentStatus = 'pending' | 'approved' | 'rejected'
export type VideoType = 'youtube' | 'upload'
export type ExerciseCategory = 'strength' | 'cardio' | 'mobility' | 'relaxation' | 'breathing'
export type WorkoutType = 'gestational' | 'post_partum' | 'general'
export type ExecutionStatus = 'started' | 'completed' | 'abandoned'
export type LinkType = 'permanent' | 'expirable'
export type NotificationTarget = 'trainer' | 'student'
export type EffortLevel = 'easy' | 'moderate' | 'hard'

export interface PersonalTrainer {
  id: string
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  status: StudentStatus
  registrationCode: string | null
  personalTrainerId: string
  createdAt: string
  updatedAt: string
  anamnesis?: Anamnesis | null
}

export interface Exercise {
  id: string
  name: string
  description: string | null
  videoType: VideoType | null
  youtubeUrl: string | null
  videoId: string | null
  videoUrl: string | null
  thumbnail: string | null
  durationSeconds: number | null
  category: ExerciseCategory
  postPartumOnly: boolean
  personalTrainerId: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkoutExercise {
  id: string
  workoutId: string
  exerciseId: string
  sets: number
  useTime: boolean
  reps: number | null
  timeOn: number | null
  restSeconds: number | null
  notes: string | null
  order: number
  exercise: Exercise
}

export interface Workout {
  id: string
  title: string
  description: string | null
  type: WorkoutType
  estimatedDurationMinutes: number | null
  isTemplate: boolean
  studentId: string | null
  personalTrainerId: string
  sentAt: string | null
  createdAt: string
  updatedAt: string
  workoutExercises?: WorkoutExercise[]
  student?: Student
}

export interface WorkoutExecution {
  id: string
  studentId: string
  workoutId: string
  status: ExecutionStatus
  startedAt: string | null
  finishedAt: string | null
  durationSeconds: number | null
  createdAt: string
  workout?: Workout
}

export interface WorkoutFeedback {
  id: string
  studentId: string
  workoutId: string
  rating: number
  comment: string | null
  effort: EffortLevel | null
  painOrDiscomfort: string | null
  createdAt: string
  student?: Student
  workout?: Workout
}

export interface Anamnesis {
  id: string
  studentId: string
  gestationalWeeks: number | null
  dueDate: string | null
  isPostPartum: boolean | null
  weeksPostPartum: number | null
  hasPreviousExerciseHistory: boolean | null
  medicalRestrictions: string | null
  healthObservations: string | null
  doctorName: string | null
  doctorPhone: string | null
  lgpdConsent: boolean
  lgpdConsentAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RegistrationLink {
  id: string
  code: string
  linkType: LinkType
  expiresAt: string | null
  isActive: boolean
  personalTrainerId: string
  createdAt: string
}

export interface Notification {
  id: string
  target: NotificationTarget
  personalTrainerId: string | null
  studentId: string | null
  title: string
  body: string
  type: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface DashboardMetrics {
  totalStudents: number
  pendingStudents: number
  approvedStudents: number
  totalWorkouts: number
  completedExecutions: number
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface AuthResponse {
  accessToken: string
  role: Role
}

export interface UploadResponse {
  url: string
  fileName: string
  size: number
  type: string
}
