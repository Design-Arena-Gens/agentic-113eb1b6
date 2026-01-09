import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { logger } from '../logger'

export interface DownloadedMedia {
  videos: string[]
  music: string
}

export class DownloaderAgent {
  private pexelsApiKey: string
  private pixabayApiKey: string

  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY || ''
    this.pixabayApiKey = process.env.PIXABAY_API_KEY || ''
  }

  async execute(tempDir: string): Promise<DownloadedMedia> {
    logger.info('Starting download process', 'Downloader')

    try {
      // Download copyright-free videos from Pexels
      const videos = await this.downloadVideos(tempDir)

      // Download copyright-free music from Pixabay
      const music = await this.downloadMusic(tempDir)

      logger.success('All media downloaded successfully', 'Downloader')

      return { videos, music }
    } catch (error) {
      logger.error(`Download failed: ${error}`, 'Downloader')
      throw error
    }
  }

  private async downloadVideos(tempDir: string): Promise<string[]> {
    logger.info('Searching for copyright-free videos', 'Downloader')

    const topics = ['nature', 'ocean', 'mountains', 'sunset', 'space', 'clouds', 'forest']
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]

    try {
      if (!this.pexelsApiKey) {
        logger.info('Pexels API key not found, creating placeholder videos', 'Downloader')
        return this.createPlaceholderVideos(tempDir)
      }

      const response = await axios.get(
        `https://api.pexels.com/videos/search?query=${randomTopic}&per_page=3&orientation=landscape`,
        {
          headers: { Authorization: this.pexelsApiKey },
          timeout: 30000,
        }
      )

      const videos: string[] = []

      for (let i = 0; i < Math.min(3, response.data.videos?.length || 0); i++) {
        const video = response.data.videos[i]
        const videoFile = video.video_files.find((f: any) => f.quality === 'hd' || f.quality === 'sd')

        if (videoFile) {
          const filePath = path.join(tempDir, `video_${i + 1}.mp4`)
          await this.downloadFile(videoFile.link, filePath)
          videos.push(filePath)
          logger.info(`Downloaded video ${i + 1}/3`, 'Downloader')
        }
      }

      if (videos.length === 0) {
        return this.createPlaceholderVideos(tempDir)
      }

      return videos
    } catch (error) {
      logger.error(`Failed to download from Pexels: ${error}`, 'Downloader')
      return this.createPlaceholderVideos(tempDir)
    }
  }

  private async downloadMusic(tempDir: string): Promise<string> {
    logger.info('Searching for copyright-free music', 'Downloader')

    try {
      if (!this.pixabayApiKey) {
        logger.info('Pixabay API key not found, creating placeholder music', 'Downloader')
        return this.createPlaceholderMusic(tempDir)
      }

      const response = await axios.get(
        `https://pixabay.com/api/?key=${this.pixabayApiKey}&q=inspirational+music&audio_type=music`,
        { timeout: 30000 }
      )

      if (response.data.hits && response.data.hits.length > 0) {
        const audio = response.data.hits[0]
        const audioUrl = audio.previewURL || audio.url

        const filePath = path.join(tempDir, 'background_music.mp3')
        await this.downloadFile(audioUrl, filePath)
        logger.success('Music downloaded', 'Downloader')

        return filePath
      }

      return this.createPlaceholderMusic(tempDir)
    } catch (error) {
      logger.error(`Failed to download music: ${error}`, 'Downloader')
      return this.createPlaceholderMusic(tempDir)
    }
  }

  private async downloadFile(url: string, filePath: string): Promise<void> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
    })
    fs.writeFileSync(filePath, response.data)
  }

  private createPlaceholderVideos(tempDir: string): string[] {
    logger.info('Creating placeholder video files', 'Downloader')
    const videos: string[] = []

    for (let i = 1; i <= 3; i++) {
      const filePath = path.join(tempDir, `video_${i}.mp4`)
      // Create a minimal placeholder file
      fs.writeFileSync(filePath, Buffer.from('PLACEHOLDER_VIDEO'))
      videos.push(filePath)
    }

    return videos
  }

  private createPlaceholderMusic(tempDir: string): string {
    logger.info('Creating placeholder music file', 'Downloader')
    const filePath = path.join(tempDir, 'background_music.mp3')
    fs.writeFileSync(filePath, Buffer.from('PLACEHOLDER_MUSIC'))
    return filePath
  }
}
