const Chat = require('../models/chat.model.js');
const ChatSession = require('../models/chatSession.model.js');

const storeChat = async (req, res) => {
  try {
    const { user_id, query, response } = req.body;

    const chat = new Chat({ user_id, query, response });
    await chat.save();

    res.status(201).json({ message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const messages = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const messages = await Chat.find({ user_id }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Save a new chat session (when user finishes or clicks "New Chat")
const saveChatSession = async (req, res) => {
  const { user_id, title, messages } = req.body;
  console.log("Incoming session POST:", req.body);

  try {
    const session = new ChatSession({
      user_id,
      title,
      messages,
      createdAt: new Date()
    });

    await session.save();
    res.status(201).json({ session });
  } catch (error) {
    console.error("❌ Failed to save session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Get all chat sessions for a user
const getUserChatSessions = async (req, res) => {
  try {
    const { user_id } = req.query;
    console.log("GET /sessions?user_id=", user_id);

    const sessions = await ChatSession.find({ user_id }).sort({ createdAt: -1 });
    console.log("📦 Found sessions:", sessions);

    res.status(200).json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Get a single chat session by ID
const getChatSessionById = async (req, res) => {
  try {
    const { session_id } = req.params;

    const session = await ChatSession.findById(session_id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

const updateSession = async (req, res) => {
  try {
      const sessionId = req.params.id;
      const { title, messages } = req.body;

      const updated = await ChatSession.findByIdAndUpdate(
          sessionId,
          {
              title,
              messages,
              updatedAt: new Date()
          },
          { new: true }
      );

      if (!updated) {
          return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ session: updated });
  } catch (err) {
      console.error("❌ Failed to update session:", err);
      res.status(500).json({ error: 'Failed to update session' });
  }
};


module.exports = { storeChat, messages, saveChatSession, getUserChatSessions, getChatSessionById, updateSession };