const router = require('express').Router();

const { asyncResponse } = require('../middlewares/async');
const userController = require('../controllers/user');

router.get('/users', asyncResponse(userController.getUsers));

module.exports = router;
