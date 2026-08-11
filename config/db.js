import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!uri) {
    throw new Error("Mongo connection string is missing. Set MONGO_URI, MONGODB_URI, or DATABASE_URL in the environment.");
  }

  if (process.env.NODE_ENV === "production" && /127\.0\.0\.1|localhost/i.test(uri)) {
    throw new Error("Production deployment is using a local MongoDB URI. Set MONGO_URI to a hosted MongoDB connection string in Render.");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri);

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  return conn;
};

export default connectDB;
