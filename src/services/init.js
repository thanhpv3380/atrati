const logger = require('../utils/logger');

global.logger = logger;

const { telegramBot } = require('./bot');

telegramBot.connect();
