# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Technologies
- **Next.js 15** with App Router
- **React 19** 
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **ESLint** with Next.js TypeScript configuration
- **Turbopack** for fast development builds

### Project Structure
- `app/` - Next.js App Router directory containing:
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with CSS variables for light/dark themes
- `public/` - Static assets (SVG icons)
- TypeScript path alias `@/*` maps to the root directory

### Styling Architecture
- Uses CSS variables for theming (`--background`, `--foreground`)
- Automatic dark mode support via `prefers-color-scheme`
- Tailwind CSS with inline theme configuration
- Font setup: Geist Sans and Geist Mono from Google Fonts

### Development Notes
- The project uses Turbopack for fast development builds
- TypeScript is configured with strict mode and incremental compilation
- ESLint uses the Next.js recommended configuration with TypeScript support