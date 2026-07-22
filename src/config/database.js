import mongoose from 'mongoose';
import dns from 'node:dns';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI nao foi definida no arquivo .env.');
  }

  if (
    uri.includes('usuario:senha') ||
    uri.includes('sua_string') ||
    uri.includes('cluster.mongodb.net')
  ) {
    throw new Error(
      'MONGODB_URI ainda esta com o exemplo. Cole a string real do MongoDB Atlas no arquivo .env.'
    );
  }

  dns.setServers(['1.1.1.1', '8.8.8.8']);
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    family: 4
  });

  console.log('MongoDB conectado.');
}
