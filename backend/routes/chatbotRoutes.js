const express = require('express');
const router  = express.Router();
const { chat, getRecommendations, clearSession } = require('../controllers/chatbotController');

// No auth — works for guests too
router.post('/chat',           chat);
router.get('/recommendations', getRecommendations);
router.delete('/session',      clearSession);

module.exports = router;