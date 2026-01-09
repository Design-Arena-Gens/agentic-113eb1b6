# Autonomous YouTube Video System

A fully autonomous AI system that creates and uploads YouTube videos on autopilot.

## Features

### 1. Downloader Agent
- Automatically finds copyright-free videos from Pexels
- Downloads copyright-free music from Pixabay
- Stores media in temporary directory

### 2. Video Creation Agent
- Generates motivational scripts using GPT-4
- Creates AI voiceover using OpenAI TTS
- Combines video clips, music, and voiceover
- Exports final video

### 3. YouTube Publisher Agent
- Creates eye-catching thumbnails
- Generates title, description, and tags
- Uploads video to YouTube automatically
- Sets proper metadata and categories

### 4. Automation
- Runs on schedule via Vercel Cron
- Manual trigger available via dashboard
- Automatic temp file cleanup
- Comprehensive logging system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- `OPENAI_API_KEY` - For script generation and voiceover
- `PEXELS_API_KEY` - For copyright-free videos
- `PIXABAY_API_KEY` - For copyright-free music
- `YOUTUBE_CLIENT_ID` - YouTube OAuth credentials
- `YOUTUBE_CLIENT_SECRET` - YouTube OAuth credentials
- `YOUTUBE_REFRESH_TOKEN` - YouTube OAuth refresh token

3. Run development server:
```bash
npm run dev
```

4. Deploy to Vercel:
```bash
vercel deploy --prod
```

## How It Works

1. **Scheduled Execution**: System runs daily at 10 AM (configurable)
2. **Media Download**: Downloader agent fetches videos and music
3. **Script Generation**: AI creates motivational script
4. **Voiceover Creation**: Text-to-speech generates voiceover
5. **Video Assembly**: All media combined into final video
6. **Publishing**: Video uploaded to YouTube with metadata
7. **Cleanup**: Temporary files deleted, logs saved

## Dashboard

Access the web dashboard to:
- View system status
- Check recent logs
- See total videos created
- Manually trigger video creation
- Monitor agent activity

## API Endpoints

- `GET /api/status` - Get system status and logs
- `POST /api/trigger` - Manually trigger video creation
- `GET /api/cron` - Cron endpoint for scheduled runs

## Vercel Cron Setup

The system uses Vercel Cron Jobs (configured in `vercel.json`):
- Schedule: Daily at 10 AM UTC
- Endpoint: `/api/cron`
- Automatic execution, no manual intervention required

## Requirements

- Node.js 18+
- OpenAI API key
- Pexels API key (free)
- Pixabay API key (free)
- YouTube API credentials
- Vercel account for deployment

## License

MIT
