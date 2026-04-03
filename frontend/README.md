# Study Buddy - Frontend

A modern web application for intelligent search and management of study materials.

## Installation

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:8001`
- Project is cloned - `git clone https://git-iit.fh-joanneum.at/swd24-hackathon/study-buddy.git`

### Setup

```bash
cd frontend

# Install dependencies
bun install

# Start development server
bun dev
```

The app runs on `http://localhost:3000`

### Using npm instead of Bun

```bash
npm install
npm run dev
```

## Upgrading Next.js & React

Run this before upgrading to a new major Next.js version. It automatically updates `package.json` and applies any required code changes:

```bash
npx @next/codemod@canary upgrade latest
```

No installation needed – `npx` downloads and runs it temporarily.

Updates in `package.json`: `next`, `react`, `react-dom`.
