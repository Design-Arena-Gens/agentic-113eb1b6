import fs from 'fs'
import path from 'path'

export interface SystemState {
  isRunning: boolean
  lastRun?: string
  nextRun?: string
  totalVideos: number
}

class Storage {
  private stateFile: string
  private state: SystemState

  constructor() {
    this.stateFile = path.join(process.cwd(), 'data', 'state.json')
    this.ensureDataDirectory()
    this.state = this.loadState()
  }

  private ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  private loadState(): SystemState {
    try {
      if (fs.existsSync(this.stateFile)) {
        const content = fs.readFileSync(this.stateFile, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.error('Failed to load state:', error)
    }
    return {
      isRunning: false,
      totalVideos: 0,
    }
  }

  private saveState() {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2))
    } catch (error) {
      console.error('Failed to save state:', error)
    }
  }

  getState(): SystemState {
    return { ...this.state }
  }

  setRunning(isRunning: boolean) {
    this.state.isRunning = isRunning
    if (isRunning) {
      this.state.lastRun = new Date().toISOString()
    }
    this.saveState()
  }

  setNextRun(nextRun: string) {
    this.state.nextRun = nextRun
    this.saveState()
  }

  incrementVideoCount() {
    this.state.totalVideos++
    this.saveState()
  }

  getTempDir(): string {
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    return tempDir
  }

  clearTempFiles() {
    const tempDir = path.join(process.cwd(), 'temp')
    if (fs.existsSync(tempDir)) {
      try {
        const files = fs.readdirSync(tempDir)
        for (const file of files) {
          const filePath = path.join(tempDir, file)
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath)
          }
        }
        console.log('✓ Temp files cleared')
      } catch (error) {
        console.error('Failed to clear temp files:', error)
      }
    }
  }
}

export const storage = new Storage()
