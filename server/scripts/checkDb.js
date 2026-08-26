const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dineflow';

console.log('🔍 Checking MongoDB Connection...');
console.log(`📡 Target URI: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then((conn) => {
    console.log(`✅ MongoDB Connection Successful!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`❌ MongoDB Connection Failed: ${err.message}`);
    console.log('\n💡 Hint for local development:');
    console.log('   - Ensure MongoDB is running locally (mongod) or configure a free MongoDB Atlas URI in server/.env');
    process.exit(1);
  });
