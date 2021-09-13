const dotEnv = require('dotenv');
const mongoose = require('mongoose');

dotEnv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
// const db = process.env.DATABASE_LOCAL;

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB Connection Successful");
}).catch((err) => {
  console.log("DB Connection Error: ", err)
});

// START SERVER

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (error) => {
  console.log(`Unhandled Rejection: ${error.name} - ${error.message}`);
  console.log('💥 Shutting Down...');
  server.close(() => {
    process.exit(1);

  })
})

process.on('uncaughtException', (error) => {
  console.log(`Unhandled Exception: ${error.name} - ${error.message}`);
  console.log('💥 Shutting Down...');
  server.close(() => {
    process.exit(1);
    
  })
})