import type { VideoType } from '@/types'

export interface ExerciseVideoData {
  videoType?: VideoType | null
  youtubeUrl?: string | null
  videoId?: string | null
  videoUrl?: string | null
  thumbnail?: string | null
  name: string
}

export function resolveVideoType(exercise: ExerciseVideoData): VideoType | null {
  if (exercise.videoType === 'youtube' || exercise.videoType === 'upload') {
    return exercise.videoType
  }
  if (exercise.youtubeUrl || exercise.videoId) return 'youtube'
  if (exercise.videoUrl) return 'upload'
  return null
}

export function getYoutubeWatchUrl(exercise: ExerciseVideoData): string | null {
  if (exercise.youtubeUrl) return exercise.youtubeUrl
  if (exercise.videoId) return `https://www.youtube.com/watch?v=${exercise.videoId}`
  return null
}

export function getInitialThumbnail(exercise: ExerciseVideoData): string | undefined {
  if (exercise.thumbnail) return exercise.thumbnail
  if (exercise.videoId) {
    return `https://img.youtube.com/vi/${exercise.videoId}/maxresdefault.jpg`
  }
  return undefined
}

export function getHqDefaultThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function resolveUploadUrl(videoUrl: string, apiBaseUrl: string): string {
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl
  }
  const base = apiBaseUrl.replace(/\/$/, '')
  const path = videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`
  return `${base}${path}`
}

export function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
