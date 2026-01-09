import { DownloaderAgent } from './agents/downloader'
import { VideoCreatorAgent } from './agents/videoCreator'
import { YouTubePublisherAgent } from './agents/youtubePublisher'
import { logger } from './logger'
import { storage } from './storage'

export class Orchestrator {
  private downloaderAgent: DownloaderAgent
  private videoCreatorAgent: VideoCreatorAgent
  private youtubePublisherAgent: YouTubePublisherAgent

  constructor() {
    this.downloaderAgent = new DownloaderAgent()
    this.videoCreatorAgent = new VideoCreatorAgent()
    this.youtubePublisherAgent = new YouTubePublisherAgent()
  }

  async run(): Promise<void> {
    const startTime = Date.now()
    logger.info('=== STARTING AUTONOMOUS VIDEO CREATION PIPELINE ===', 'Orchestrator')

    try {
      storage.setRunning(true)

      // Get temp directory
      const tempDir = storage.getTempDir()

      // Step 1: Download media
      logger.info('STEP 1/3: Downloading media', 'Orchestrator')
      const media = await this.downloaderAgent.execute(tempDir)

      // Step 2: Create video
      logger.info('STEP 2/3: Creating video', 'Orchestrator')
      const video = await this.videoCreatorAgent.execute(media, tempDir)

      // Step 3: Publish to YouTube
      logger.info('STEP 3/3: Publishing to YouTube', 'Orchestrator')
      const videoUrl = await this.youtubePublisherAgent.execute(video, tempDir)

      // Update statistics
      storage.incrementVideoCount()

      // Clean up temp files
      logger.info('Cleaning up temporary files', 'Orchestrator')
      storage.clearTempFiles()

      // Clean old logs
      logger.clearOldLogs(7)

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      logger.success(
        `=== PIPELINE COMPLETED IN ${duration}s === Video URL: ${videoUrl}`,
        'Orchestrator'
      )
    } catch (error) {
      logger.error(`Pipeline failed: ${error}`, 'Orchestrator')
      throw error
    } finally {
      storage.setRunning(false)
    }
  }
}
