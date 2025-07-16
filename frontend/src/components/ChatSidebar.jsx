import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, Plus } from 'lucide-react';
import { useAppSelector } from '../redux/store';
import axios from 'axios';

const ChatSidebar = ({ isOpen, onClose, onNewChat, setMessages, setActiveSessionId, refreshTrigger }) => {
    const { user } = useAppSelector(state => state.auth);
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("🧪 ChatSidebar.jsx - useEffect triggered, user:", user, "refreshTrigger:", refreshTrigger);
        const fetchSessions = async () => {
            const userObject = localStorage.getItem('quran_user');
            console.log("🧪 ChatSidebar.jsx - quran_user from localStorage:", userObject);
            if (!userObject) {
                console.log("🧪 ChatSidebar.jsx - No quran_user, skipping fetch");
                return;
            }

            let userId;
            try {
                userId = JSON.parse(userObject).id;
                console.log("🧪 ChatSidebar.jsx - Parsed userId:", userId);
            } catch (e) {
                console.error("🧪 ChatSidebar.jsx - Error parsing quran_user:", e);
                return;
            }

            if (!userId) {
                console.log("🧪 ChatSidebar.jsx - No userId, skipping fetch");
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/chat/sessions?user_id=${userId}`);
                console.log("🧪 ChatSidebar.jsx - API response:", response.data);
                if (Array.isArray(response.data)) {
                    console.log("🧪 ChatSidebar.jsx - Setting chatSessions:", response.data);
                    setChatSessions(response.data);
                } else {
                    console.log("🧪 ChatSidebar.jsx - No sessions or invalid response:", response.data);
                    setChatSessions([]);
                }
            } catch (error) {
                console.error("🧪 ChatSidebar.jsx - Error fetching sessions:", error);
                setChatSessions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, [user, refreshTrigger]);

    const handleSelectSession = (session) => {
        console.log("🧪 ChatSidebar.jsx - Selecting session:", session);
        const sessionMessages = Array.isArray(session.messages)
            ? session.messages.map(msg => ({
                  id: msg._id || Date.now().toString(),
                  type: msg.type || 'bot',
                  content: msg.content || '',
                  createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
              }))
            : [{
                  id: '1',
                  type: 'bot',
                  content: 'Peace be upon you! I\'m here to help you explore the wisdom of the Quran.',
                  createdAt: new Date()
              }];
        setMessages(sessionMessages);
        setActiveSessionId(session._id || session.id);
        console.log("🧪 ChatSidebar.jsx - Set messages:", sessionMessages);
        onClose();
    };

    const formatDate = (createdAt) => {
        const date = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    console.log("🧪 ChatSidebar.jsx - Rendering with chatSessions:", chatSessions);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            <div className={`fixed lg:sticky top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 h-screen lg:h-[calc(100vh-4rem)] overflow-hidden`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 h-auto">
                    <div className="flex items-center space-x-3 mb-4">
                        {user?.avatar && (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                            />
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {user?.name || 'User'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email || 'No email'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Chat</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-6rem)] lg:h-[calc(100%-8rem)]">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                        Recent Conversations
                    </h4>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading sessions...</p>
                        </div>
                    ) : chatSessions.length > 0 ? (
                        <div className="space-y-2">
                            {chatSessions.map((session) => (
                                <button
                                    key={session._id || session.id}
                                    onClick={() => handleSelectSession(session)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <MessageCircle className="h-4 w-4 text-green-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {session.title || 'Untitled Session'}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(session.createdAt)}
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(session.messages?.length || 0)} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No chat history yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;