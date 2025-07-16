const express = require('express');
const { storeChat, messages, saveChatSession, getUserChatSessions, getChatSessionById, updateSession } = require('../controller/chatController');
const router = express.Router();

// Save a full chat session
router.post('/session', saveChatSession);
router.put('/session/:id', updateSession);

// Get all sessions for a user
router.get('/sessions', getUserChatSessions);

// Get a session by ID
router.get('/session/:session_id', getChatSessionById);

// router.post('/store-chat', storeChat);
// router.get('/messages', messages);

module.exports = router;