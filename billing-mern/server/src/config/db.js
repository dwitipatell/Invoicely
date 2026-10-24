import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not set. Check your environment variables.');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
