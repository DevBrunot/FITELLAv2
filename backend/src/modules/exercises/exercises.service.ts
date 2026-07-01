// file: src/modules/exercises/exercises.service.ts
import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, ExerciseCategory, VideoType } from '../../entities/exercise.entity';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';

/** Extracts YouTube videoId from common URL formats */
function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private repo: Repository<Exercise>,
  ) {}

  async findAll(trainerId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { personalTrainerId: trainerId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, trainerId: string) {
    const exercise = await this.repo.findOneBy({ id, personalTrainerId: trainerId });
    if (!exercise) throw new NotFoundException('Exercício não encontrado');
    return exercise;
  }

  async create(dto: CreateExerciseDto, trainerId: string) {
    const exercise = this.repo.create({ ...dto, personalTrainerId: trainerId });

    if (dto.videoUrl) {
      exercise.videoType = VideoType.UPLOAD;
      exercise.videoUrl = dto.videoUrl;
    } else if (dto.youtubeUrl) {
      exercise.videoType = VideoType.YOUTUBE;
      const videoId = extractYoutubeVideoId(dto.youtubeUrl);
      if (videoId) {
        exercise.videoId = videoId;
        exercise.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    return this.repo.save(exercise);
  }

  async update(id: string, dto: UpdateExerciseDto, trainerId: string) {
    const exercise = await this.findOne(id, trainerId);
    Object.assign(exercise, dto);

    if (dto.videoUrl) {
      exercise.videoType = VideoType.UPLOAD;
      exercise.videoUrl = dto.videoUrl;
      exercise.youtubeUrl = null;
      exercise.videoId = null;
    } else if (dto.youtubeUrl) {
      exercise.videoType = VideoType.YOUTUBE;
      exercise.videoUrl = null;
      const videoId = extractYoutubeVideoId(dto.youtubeUrl);
      if (videoId) {
        exercise.videoId = videoId;
        exercise.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    return this.repo.save(exercise);
  }

  async remove(id: string, trainerId: string) {
    const exercise = await this.findOne(id, trainerId);
    await this.repo.remove(exercise);
  }
}
