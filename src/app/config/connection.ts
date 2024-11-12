import mongoose from 'mongoose';

const connectMongo = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'your-default-mongo-uri', {
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('MongoDB connection error');
  }
};

export default connectMongo;