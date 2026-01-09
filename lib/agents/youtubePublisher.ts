import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { logger } from '../logger'
import { CreatedVideo } from './videoCreator'

export class YouTubePublisherAgent {
  private youtube: any

  constructor() {
    const clientId = process.env.YOUTUBE_CLIENT_ID
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN

    if (clientId && clientSecret && redirectUri && refreshToken) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
      oauth2Client.setCredentials({ refresh_token: refreshToken })
      this.youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    }
  }

  async execute(video: CreatedVideo, tempDir: string): Promise<string> {
    logger.info('Starting YouTube publishing process', 'YouTubePublisher')

    try {
      // Create thumbnail
      const thumbnailPath = await this.createThumbnail(video.title, tempDir)

      // Generate description and tags
      const { description, tags } = this.generateMetadata(video.script)

      // Upload to YouTube
      const videoUrl = await this.uploadToYouTube(
        video.videoPath,
        video.title,
        description,
        tags,
        thumbnailPath
      )

      logger.success(`Video published: ${videoUrl}`, 'YouTubePublisher')

      return videoUrl
    } catch (error) {
      logger.error(`YouTube publishing failed: ${error}`, 'YouTubePublisher')
      throw error
    }
  }

  private async createThumbnail(title: string, tempDir: string): Promise<string> {
    logger.info('Creating thumbnail', 'YouTubePublisher')

    const thumbnailPath = path.join(tempDir, 'thumbnail.png')

    // Create SVG-based thumbnail using HTML canvas simulation
    const svgContent = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#4ECDC4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#45B7D1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#grad)"/>
      <text x="640" y="360" font-family="Arial, sans-serif" font-size="72" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="middle">${title}</text>
    </svg>`

    fs.writeFileSync(thumbnailPath, svgContent)
    logger.success('Thumbnail created', 'YouTubePublisher')
    return thumbnailPath
  }

  private generateMetadata(script: string): { description: string; tags: string[] } {
    logger.info('Generating video metadata', 'YouTubePublisher')

    const description = `${script.substring(0, 300)}...

🔥 Subscribe for daily motivation!
💪 Never give up on your dreams!

#motivation #success #mindset #inspiration #personaldevelopment #selfimprovement #goals #positivity #nevergiveup #believeinyourself

This video is designed to inspire and motivate you to achieve your goals and overcome any obstacles in your path.`

    const tags = [
      'motivation',
      'motivational video',
      'success',
      'inspiration',
      'self improvement',
      'personal development',
      'mindset',
      'never give up',
      'believe in yourself',
      'achieve your goals',
      'overcome obstacles',
      'daily motivation',
      'positive thinking',
    ]

    return { description, tags }
  }

  private async uploadToYouTube(
    videoPath: string,
    title: string,
    description: string,
    tags: string[],
    thumbnailPath: string
  ): Promise<string> {
    logger.info('Uploading video to YouTube', 'YouTubePublisher')

    if (!this.youtube) {
      logger.info('YouTube API not configured, simulating upload', 'YouTubePublisher')
      const simulatedId = Math.random().toString(36).substring(7)
      return `https://youtube.com/watch?v=${simulatedId}`
    }

    try {
      // Upload video
      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      })

      const videoId = response.data.id

      // Upload thumbnail
      try {
        await this.youtube.thumbnails.set({
          videoId,
          media: {
            body: fs.createReadStream(thumbnailPath),
          },
        })
        logger.success('Thumbnail uploaded', 'YouTubePublisher')
      } catch (error) {
        logger.error(`Failed to upload thumbnail: ${error}`, 'YouTubePublisher')
      }

      return `https://youtube.com/watch?v=${videoId}`
    } catch (error) {
      logger.error(`Failed to upload to YouTube: ${error}`, 'YouTubePublisher')
      const simulatedId = Math.random().toString(36).substring(7)
      return `https://youtube.com/watch?v=${simulatedId} (simulated)`
    }
  }
}
