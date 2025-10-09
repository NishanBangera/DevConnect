# DevConnect Monorepo

A monorepo for the DevConnect project using npm workspaces.

## Structure

```
dev-connect/
├── apps/
│   └── backend/          # Backend API server
├── package.json          # Root package.json with workspaces
├── tsconfig.base.json    # Shared TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v7 or higher for workspaces support)

### Installation

Install all dependencies for all packages:

```bash
npm install
```

### Development

Run the backend in development mode:

```bash
npm run dev
```

### Build

Build all packages:

```bash
npm run build
```

### Start Production

Start the backend in production mode:

```bash
npm run start
```

## Workspace Commands

Run commands in specific workspaces:

```bash
# Run a script in a specific workspace
npm run dev --workspace=@dev-connect/backend

# Install a dependency in a specific workspace
npm install express --workspace=@dev-connect/backend

# Install a dev dependency in a specific workspace
npm install -D typescript --workspace=@dev-connect/backend
```

## Adding New Apps

1. Create a new directory in `apps/`
2. Initialize with `npm init` or create `package.json` manually
3. Name it with the `@dev-connect/` scope (e.g., `@dev-connect/frontend`)
4. Run `npm install` at the root to link workspaces

## Scripts

- `npm run dev` - Start backend in development mode
- `npm run build` - Build all apps
- `npm run start` - Start backend in production mode
- `npm run clean` - Clean build artifacts (if implemented)
- `npm run lint` - Lint all apps (if implemented)
- `npm run test` - Test all apps (if implemented)

## Repository

- GitHub: [DevConnect](https://github.com/NishanBangera/DevConnect)
