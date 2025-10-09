import mongoose from "mongoose";

const opts = {
  bufferCommands: true,
  maxPoolSize: 10,
};

export async function connectToDatabase() {
  const url = process.env.MONGODB_URL;
  if (!url) throw new Error("Please define MONGODB_URL");

  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, wait for the existing connection to open
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once("open", () => resolve());
      mongoose.connection.once("error", (err) => reject(err));
    });
    return mongoose.connection;
  }

  // Otherwise start a new connection
  const conn = await mongoose.connect(url, opts);
  return conn.connection;
}