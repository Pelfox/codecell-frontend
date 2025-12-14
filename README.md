# CodeCell Frontend

A Next.js-based client for running code snippets against the [CodeCell Runner](https://github.com/Pelfox/codecell-runner) service, with live output streaming via Server-Sent Events (SSE).

## Overview

- Single-page playground with code editor, stdin input, timeout controls, and live log output
- Communicates with a gRPC runner through a Next.js API route

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 with [shadcn/ui](https://ui.shadcn.com) components
- CodeMirror ([@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror))
- gRPC client via @grpc/grpc-js and generated bindings (ts-proto)

## Installation

```bash
pnpm install
```

After installation, generate protocol files via

```bash
pnpm protocol:generate
```

## Development

- Run dev server: `pnpm dev`
- Lint code: `pnpm lint` (ESLint)
- Format: `pnpm format` (Prettier)
- Build: `pnpm build`
