import fs from 'fs'
import path from 'path'

export interface LogEntry {
  timestamp: string
  level: 'info' | 'error' | 'success'
  message: string
  agent?: string
}

class Logger {
  private logFile: string
  private logs: LogEntry[] = []

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'system.log')
    this.ensureLogDirectory()
    this.loadLogs()
  }

  private ensureLogDirectory() {
    const logDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  private loadLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf-8')
        const lines = content.trim().split('\n').filter(l => l)
        this.logs = lines.map(line => JSON.parse(line))
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
      this.logs = []
    }
  }

  private writeLog(entry: LogEntry) {
    this.logs.push(entry)
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n')
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  info(message: string, agent?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      agent,
    }
    this.writeLog(entry)
    console.log(`[${agent || 'SYSTEM'}] ${message}`)
  }

  error(message: string, agent?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      agent,
    }
    this.writeLog(entry)
    console.error(`[${agent || 'SYSTEM'}] ${message}`)
  }

  success(message: string, agent?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'success',
      message,
      agent,
    }
    this.writeLog(entry)
    console.log(`[${agent || 'SYSTEM'}] ✓ ${message}`)
  }

  getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit)
  }

  clearOldLogs(daysToKeep: number = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    this.logs = this.logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= cutoffDate
    })

    try {
      const content = this.logs.map(log => JSON.stringify(log)).join('\n') + '\n'
      fs.writeFileSync(this.logFile, content)
    } catch (error) {
      console.error('Failed to clear old logs:', error)
    }
  }
}

export const logger = new Logger()
