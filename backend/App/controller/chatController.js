const Chat = require('../models/chat.model.js');

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

module.exports = { storeChat };
