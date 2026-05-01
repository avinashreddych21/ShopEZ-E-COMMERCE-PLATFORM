const mongoose = require('mongoose');

let hasLoggedSuccess = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI is not set. Backend auth and Mongo-backed data will not work until you add it to backend/.env.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    if (!hasLoggedSuccess) {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      hasLoggedSuccess = true;
    }

    return true;
  } catch (error) {
    console.error('Database connection failed.');
    console.error('Make sure your Atlas cluster is running, your IP is allowed, and backend/.env has a valid MONGO_URI.');
    console.error(`Error details: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
