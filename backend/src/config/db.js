import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

// The system DNS resolver on some Windows networks refuses MongoDB Atlas SRV
// lookups. Use a resolver that can reliably resolve the Atlas cluster records.
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Exits the process on failure to prevent a partially initialised app.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${env.MONGODB_URI}`);
    console.log(`✅ MongoDB connected to: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Primary MongoDB connection failed. Trying local fallback...`);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/xogame');
      console.log(`✅ MongoDB connected to local: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`❌ MongoDB connection failed:`, fallbackError.message);
      process.exit(1);
    }
  }
};

export default connectDB;
