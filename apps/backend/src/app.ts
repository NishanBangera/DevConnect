import express from 'express';
import { connectToDatabase } from './lib/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';

dotenv.config();

async function start() {
  // Wrap the entire startup sequence so we can log and rethrow errors
  // (the caller still exits the process on failure).
  try {
    // Connect to DB first so the server doesn't accept requests before DB is ready
    await connectToDatabase();

    const app = express();
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    app.use(express.json());

    app.get('/health', (req, res) => {
      res.status(200).send('OK');
    });

    app.use('/api/v1/auth', authRoutes);

    const server = app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });

    // Listen for server runtime errors and bail out (these are rare but
    // important to handle in production).
    server.on('error', (err: any) => {
      console.error('Server error:', err);
      // Use a synchronous exit to avoid hanging state.
      process.exit(1);
    });

    return server;
  } catch (err) {
    console.error('Failed during startup inside start():', err);
    // Rethrow so the external caller can decide how to exit.
    throw err;
  }
}

// Global process-level handlers: log and fail fast. These are defensive and
// ensure the process doesn't continue in an unknown state.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at Promise:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

