const mongoose = require('mongoose');
const { MONGO_URI } = require('../configs');

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  logger.error(`Error connect MongoDB: ${err.message}`);
  process.exit();
});

mongoose.connection.once('open', () => {
  logger.info(`MongoDB connected: ${MONGO_URI}`);
});
