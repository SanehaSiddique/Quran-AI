const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
