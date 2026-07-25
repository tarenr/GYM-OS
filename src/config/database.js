import mongoose from 'mongoose';
import dns from 'node:dns';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI was not defined in the .env file.');
  }

  if (
    uri.includes('usuario:senha') ||
    uri.includes('sua_string') ||
    uri.includes('cluster.mongodb.net')
  ) {
    throw new Error(
      'MONGODB_URI is still using the example value. Add the real MongoDB Atlas string to the .env file.'
    );
  }

  dns.setServers(['1.1.1.1', '8.8.8.8']);
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    family: 4
  });

  console.log('MongoDB connected.');
}
