import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import { initSocketServer } from './services/socket.handler.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`✅ Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Attach socket server
  initSocketServer(server, env.CLIENT_ORIGIN);

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled promise rejection:', reason);
    process.exit(1);
  });
};

startServer();
