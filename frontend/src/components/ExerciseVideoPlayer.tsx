import { useMemo, useState } from 'react'
import ReactPlayer from 'react-player'
import { Play } from 'lucide-react'
import { apiBaseUrl } from '@/config/api'
import { cn } from '@/utils/cn'
import {
  type ExerciseVideoData,
  getHqDefaultThumbnail,
  getInitialThumbnail,
  getYoutubeWatchUrl,
  resolveUploadUrl,
  resolveVideoType,
} from '@/utils/exercise-video'

interface ExerciseVideoPlayerProps {
  exercise: ExerciseVideoData
  className?: string
  height?: string
}

function VideoPreview({
  thumbnail,
  videoId,
  name,
  onPlay,
}: {
  thumbnail?: string
  videoId?: string | null
  name: string
  onPlay: () => void
}) {
  const [thumbSrc, setThumbSrc] = useState(thumbnail)

  return (
    <button
      type="button"
      onClick={onPlay}
      className="relative flex h-full w-full items-center justify-center bg-gray-900"
      aria-label={`Reproduzir vídeo de ${name}`}
    >
      {thumbSrc && (
        <img
          src={thumbSrc}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            if (videoId && thumbSrc.includes('maxresdefault')) {
              setThumbSrc(getHqDefaultThumbnail(videoId))
            }
          }}
        />
      )}
      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
        <Play className="ml-1 h-7 w-7 fill-current" />
      </span>
    </button>
  )
}

export function ExerciseVideoPlayer({
  exercise,
  className,
  height = '220px',
}: ExerciseVideoPlayerProps) {
  const videoType = resolveVideoType(exercise)
  const [started, setStarted] = useState(false)

  const playerUrl = useMemo(() => {
    if (videoType === 'youtube') return getYoutubeWatchUrl(exercise)
    if (videoType === 'upload' && exercise.videoUrl) {
      return resolveUploadUrl(exercise.videoUrl, apiBaseUrl)
    }
    return null
  }, [exercise, videoType])

  const thumbnail = getInitialThumbnail(exercise)

  if (!videoType || !playerUrl) return null

  if (!started) {
    return (
      <div
        className={cn('w-full overflow-hidden rounded-xl bg-gray-900', className)}
        style={{ height }}
      >
        <VideoPreview
          thumbnail={thumbnail}
          videoId={exercise.videoId}
          name={exercise.name}
          onPlay={() => setStarted(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn('w-full overflow-hidden rounded-xl bg-gray-900', className)}
      style={{ height }}
    >
      <ReactPlayer
        url={playerUrl}
        controls
        width="100%"
        height={height}
        playing={false}
        playsinline
        config={{
          youtube: {
            playerVars: {
              playsinline: 1,
              modestbranding: 1,
              rel: 0,
            },
          },
          file: {
            attributes: {
              playsInline: true,
              controlsList: 'nodownload',
            },
          },
        }}
      />
    </div>
  )
}
