const router = require('express').Router();

const { asyncResponse } = require('../middlewares/async');
const authController = require('../controllers/message');

router.post('/messages', asyncResponse(authController.receiveMessage));

module.exports = router;
