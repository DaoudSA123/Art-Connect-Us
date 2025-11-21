const mongoose = require('mongoose');
const config = require('../config/database');

// Security options for MongoDB connection
const mongoOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  retryWrites: true, // Retry failed writes
  w: 'majority' // Write concern
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, mongoOptions);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Server will continue to run, but cart functionality may be limited.');
    console.error('Please ensure MongoDB is running and MONGODB_URI is correct.');
    // Don't exit - allow server to run without database
  }
};

module.exports = connectDB;
