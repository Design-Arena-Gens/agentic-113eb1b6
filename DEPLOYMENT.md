# Autonomous YouTube System - Deployment Guide

## 🎉 Successfully Deployed!

**Production URL:** https://agentic-113eb1b6.vercel.app

## System Architecture

This is a fully autonomous AI system that creates and uploads YouTube videos automatically. The system consists of three specialized agents:

### 1. **Downloader Agent** (`lib/agents/downloader.ts`)
- Searches for copyright-free videos on Pexels
- Downloads copyright-free music from Pixabay  
- Stores all media in temporary directory
- Automatic fallback to placeholders if APIs unavailable

### 2. **Video Creation Agent** (`lib/agents/videoCreator.ts`)
- Generates motivational scripts using OpenAI GPT-4
- Creates AI voiceover using OpenAI TTS (Text-to-Speech)
- Combines video clips, background music, and voiceover
- Exports final video ready for upload

### 3. **YouTube Publisher Agent** (`lib/agents/youtubePublisher.ts`)
- Creates eye-catching SVG thumbnails with gradients
- Generates SEO-optimized title, description, and tags
- Uploads video to YouTube via YouTube Data API v3
- Automatically sets metadata and publishes

## Features

✅ **Fully Automated** - No human input required after setup
✅ **API-Driven** - Integrates with OpenAI, Pexels, Pixabay, YouTube APIs
✅ **Web Dashboard** - Real-time monitoring and manual triggers
✅ **Logging System** - Comprehensive logs saved to disk
✅ **Auto Cleanup** - Temporary files deleted after each run
✅ **Scheduled Runs** - Can be triggered via cron or manually
✅ **Production Ready** - Deployed on Vercel serverless platform

## API Endpoints

### `GET /api/status`
Returns current system status, video count, and recent logs.

```json
{
  "isRunning": false,
  "totalVideos": 0,
  "lastRun": "2026-01-09T...",
  "logs": [...]
}
```

### `POST /api/trigger`
Manually triggers a video creation job.

```bash
curl -X POST https://agentic-113eb1b6.vercel.app/api/trigger
```

### `GET /api/cron`
Cron endpoint for scheduled execution (can be called by external cron services).

```bash
curl https://agentic-113eb1b6.vercel.app/api/cron
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following:

```env
# OpenAI API Key (required for script generation and voiceover)
OPENAI_API_KEY=sk-...

# Pexels API Key (free - get from https://www.pexels.com/api/)
PEXELS_API_KEY=...

# Pixabay API Key (free - get from https://pixabay.com/api/docs/)
PIXABAY_API_KEY=...

# YouTube OAuth2 Credentials
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
YOUTUBE_REFRESH_TOKEN=...

# Optional: Cron secret for API protection
CRON_SECRET=your_secret_here
```

### 2. YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/youtube/callback`
6. Download credentials and add to `.env`
7. Run OAuth flow to get refresh token

### 3. Scheduling Options

#### Option A: External Cron Service (Recommended)
Use services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

```
URL: https://agentic-113eb1b6.vercel.app/api/cron
Schedule: 0 10 * * * (Daily at 10 AM)
Method: GET
```

#### Option B: GitHub Actions
Create `.github/workflows/cron.yml`:

```yaml
name: Trigger Video Creation
on:
  schedule:
    - cron: '0 10 * * *'  # Daily at 10 AM UTC
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger API
        run: curl -X GET https://agentic-113eb1b6.vercel.app/api/cron
```

## How It Works

1. **Trigger** - System starts via manual trigger or scheduled cron
2. **Download** - Downloader agent fetches copyright-free media
3. **Create** - Video creator generates script, voiceover, and combines media
4. **Publish** - YouTube publisher creates thumbnail and uploads to YouTube
5. **Cleanup** - All temporary files are deleted
6. **Log** - Complete activity log saved for monitoring

## Dashboard Features

The web interface at https://agentic-113eb1b6.vercel.app provides:

- **System Status** - Real-time running/idle state
- **Video Count** - Total videos created and published
- **Next Run Time** - When next scheduled execution will occur
- **Manual Trigger** - Button to start video creation immediately
- **Live Logs** - Recent system activity with timestamps and agent names
- **Agent Overview** - Description of each agent's responsibilities

## Technical Stack

- **Framework:** Next.js 16 (React 19)
- **Deployment:** Vercel Serverless
- **AI:** OpenAI GPT-4 + TTS
- **Media APIs:** Pexels (video), Pixabay (music)
- **Publishing:** YouTube Data API v3
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Limitations & Notes

⚠️ **Vercel Serverless Limitations:**
- Max execution time: 10 seconds (Hobby), 60 seconds (Pro)
- For long video processing, consider using background jobs or external workers
- File system is ephemeral - temporary files cleared between invocations

⚠️ **API Rate Limits:**
- Pexels: 200 requests/hour (free tier)
- Pixabay: 5,000 requests/hour (free tier)
- YouTube: 10,000 quota units/day (free tier)
- OpenAI: Based on your plan

## Troubleshooting

### Videos not uploading to YouTube
- Check YouTube OAuth credentials
- Verify refresh token is valid
- Check YouTube API quota usage

### Media downloads failing
- Verify Pexels/Pixabay API keys
- Check rate limits
- System will use placeholders if APIs fail

### Deployment errors
- Run `npm run build` locally first
- Check all environment variables are set
- Review Vercel deployment logs

## Future Enhancements

Potential improvements for this system:

- [ ] Add video editing with transitions and effects
- [ ] Support multiple video niches/topics
- [ ] A/B testing for thumbnails and titles
- [ ] Analytics dashboard with YouTube metrics
- [ ] Queue system for multiple videos per day
- [ ] Custom voice cloning for unique brand
- [ ] Integration with TikTok, Instagram Reels
- [ ] Automated comment responses

## License

MIT License - See LICENSE file for details
