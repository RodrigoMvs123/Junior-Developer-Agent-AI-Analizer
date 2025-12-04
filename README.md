# Junior Developer Agent AI Analizer

An autonomous AI developer agent dashboard that mimics GitHub's interface to track, analyze, and fix bugs. It uses the Google Gemini API to analyze issue descriptions and propose solutions.

**Project Live at** 
- https://junior-developer-agent-ai-analizer.vercel.app/ 

## Features

- **GitHub Interface**: A dashboard styled like GitHub dark mode.
- **Repository Connection**: Fetch real issues and pull requests from public GitHub repositories.
- **AI Analysis**: Integrates with Google Gemini 2.5 Flash to analyze bugs and suggest fixes.
- **Activity Feed**: Tracks agent actions (fetches, analysis, etc.).
- **Smart Pagination**: Handles large issue lists gracefully.

## Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key

## Local Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_KEY=your_api_key_here
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (GitHub Pages)

This project is configured to be deployed to GitHub Pages (or any static host).

1.  **Build**
    ```bash
    npm run build
    ```
    This will create a `dist` folder.

2.  **Deploy**
    Upload the contents of the `dist` folder to your static hosting provider or push to a `gh-pages` branch.

    *Note: The `vite.config.ts` is set with `base: './'` to support relative paths for flexible deployment.*
