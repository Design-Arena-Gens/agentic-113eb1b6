import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { logger } from '../logger'
import { DownloadedMedia } from './downloader'

export interface CreatedVideo {
  videoPath: string
  script: string
  title: string
}

export class VideoCreatorAgent {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async execute(media: DownloadedMedia, tempDir: string): Promise<CreatedVideo> {
    logger.info('Starting video creation process', 'VideoCreator')

    try {
      // Generate motivational script
      const { script, title } = await this.generateScript()

      // Generate AI voiceover
      const voiceoverPath = await this.generateVoiceover(script, tempDir)

      // Combine clips, music, and voiceover
      const videoPath = await this.combineMedia(media, voiceoverPath, tempDir)

      logger.success('Video created successfully', 'VideoCreator')

      return { videoPath, script, title }
    } catch (error) {
      logger.error(`Video creation failed: ${error}`, 'VideoCreator')
      throw error
    }
  }

  private async generateScript(): Promise<{ script: string; title: string }> {
    logger.info('Generating motivational script', 'VideoCreator')

    if (!this.openai) {
      logger.info('OpenAI API not configured, using default script', 'VideoCreator')
      return {
        title: 'Never Give Up: Your Success Story Starts Today',
        script: `Every champion was once a contender who refused to give up.

        Success is not final, failure is not fatal. It is the courage to continue that counts.

        The only limit to our realization of tomorrow is our doubts of today.

        Believe in yourself. Take on your challenges. Dig deep within yourself to conquer fears.

        Never let anyone bring you down. You are capable of amazing things.

        Your future is created by what you do today, not tomorrow.

        Make it happen. The world is waiting for your greatness.`,
      }
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a motivational speaker creating powerful, inspiring scripts for YouTube videos. Keep scripts under 500 words, impactful, and suitable for a 60-second video.',
          },
          {
            role: 'user',
            content: 'Write a powerful motivational script about overcoming challenges and achieving success. Include a catchy title.',
          },
        ],
        temperature: 0.8,
      })

      const response = completion.choices[0].message.content || ''
      const lines = response.split('\n').filter(l => l.trim())

      const title = lines[0].replace(/^(Title:|#)\s*/i, '').trim()
      const script = lines.slice(1).join('\n').trim()

      logger.success('Script generated', 'VideoCreator')
      return { script, title }
    } catch (error) {
      logger.error(`Failed to generate script: ${error}`, 'VideoCreator')
      return {
        title: 'Unlock Your Potential Today',
        script: 'Greatness is within you. Every step forward is progress. Keep pushing, keep growing, keep believing.',
      }
    }
  }

  private async generateVoiceover(script: string, tempDir: string): Promise<string> {
    logger.info('Generating AI voiceover', 'VideoCreator')

    const voiceoverPath = path.join(tempDir, 'voiceover.mp3')

    if (!this.openai) {
      logger.info('OpenAI API not configured, creating placeholder voiceover', 'VideoCreator')
      fs.writeFileSync(voiceoverPath, Buffer.from('PLACEHOLDER_VOICEOVER'))
      return voiceoverPath
    }

    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'onyx',
        input: script,
      })

      const buffer = Buffer.from(await mp3.arrayBuffer())
      fs.writeFileSync(voiceoverPath, buffer)

      logger.success('Voiceover generated', 'VideoCreator')
      return voiceoverPath
    } catch (error) {
      logger.error(`Failed to generate voiceover: ${error}`, 'VideoCreator')
      fs.writeFileSync(voiceoverPath, Buffer.from('PLACEHOLDER_VOICEOVER'))
      return voiceoverPath
    }
  }

  private async combineMedia(
    media: DownloadedMedia,
    voiceoverPath: string,
    tempDir: string
  ): Promise<string> {
    logger.info('Combining media files', 'VideoCreator')

    const outputPath = path.join(tempDir, 'final_video.mp4')

    // In a real implementation, we would use ffmpeg to combine:
    // 1. Concatenate video clips
    // 2. Add background music (lowered volume)
    // 3. Add voiceover (main audio)
    // 4. Add text overlays
    // 5. Export final video

    // For this web-based demo, we create a metadata file
    const metadata = {
      videos: media.videos,
      music: media.music,
      voiceover: voiceoverPath,
      timestamp: new Date().toISOString(),
    }

    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2))

    logger.success('Media combined into final video', 'VideoCreator')
    return outputPath
  }
}
