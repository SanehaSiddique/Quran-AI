const express = require('express');
const { storeChat } = require('../controller/chatController');
const router = express.Router();

router.post('/store-chat', storeChat);

module.exports = router;