# AI-Powered CSV Importer

A production-ready CSV Importer built with Next.js, Node.js + Express, TypeScript, and Gemini AI.

## Architecture
- **Frontend**: Next.js App Router, Tailwind CSS, PapaParse (for local parsing), @tanstack/react-virtual (for rendering large tables smoothly).
- **Backend**: Express, TypeScript, Zod (for validation), @google/genai (for AI mapping).
- **Communication**: REST API for initial upload, Server-Sent Events (SSE) for streaming progress.

## Prerequisites
- Node.js >= 18
- NPM / Yarn / PNPM
- Google Gemini API Key

## Setup Instructions

### 1. Backend
Navigate to `apps/backend`:
```bash
cd apps/backend
npm install
```
Create a `.env` file in `apps/backend`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```
Run in development mode:
```bash
npm run dev
```

### 2. Frontend
Navigate to `apps/frontend`:
```bash
cd apps/frontend
npm install
```
Run in development mode:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Deployment

### Frontend (Vercel)
The `apps/frontend` directory is ready to be deployed to Vercel. Connect your repository and select `apps/frontend` as the root directory.

### Backend (Render/Railway)
A `Dockerfile` is provided in `apps/backend`. 
- **Render**: Create a new Web Service, select "Docker" environment, and point to the `apps/backend` directory. Set `GEMINI_API_KEY` in the environment variables.
- **Railway**: Connect your repo, select the backend folder, and Railway will automatically use the `Dockerfile` to build and deploy.

## Features
- **Client-side Parsing**: CSVs are parsed locally in the browser to save server bandwidth and instantly preview data.
- **Virtualized Table**: Can render 100k+ rows without freezing the browser.
- **AI Schema Mapping**: Uses Google's Gemini to map messy/dynamic columns to a strict CRM schema, intelligently merging fields like multiple phone numbers into notes.
- **Batch Processing & SSE**: The backend chunks the data and streams progress back to the frontend in real-time, handling API rate limits and long-running tasks efficiently.
- **Dark Mode**: Fully supported via Tailwind CSS.
