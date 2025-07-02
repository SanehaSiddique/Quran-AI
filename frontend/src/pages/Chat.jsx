import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Menu } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import ChatSidebar from '../components/ChatSidebar';
import GuestBanner from '../components/GuestBanner';
import AuthModal from '../components/AuthModal';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { migrateTempData } from '../redux/slices/authSlice';
import { ayahsData } from '../data/mockData';

const Chat = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const [messages, setMessages] = useState([
        {
            id: '1',
            type: 'bot',
            content: 'Peace be upon you! I\'m here to help you explore the wisdom of the Quran. Ask me anything about Islamic teachings, request verses on specific themes, or seek guidance.',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const messagesEndRef = useRef(null);

    // Load chat history based on authentication status
    useEffect(() => {
        if (isAuthenticated) {
            const savedUserChat = localStorage.getItem('quran_user_chat');
            if (savedUserChat) {
                setMessages(JSON.parse(savedUserChat));
            }
        } else {
            const savedTempChat = localStorage.getItem('quran_temp_chat');
            if (savedTempChat) {
                setMessages(JSON.parse(savedTempChat));
            }
        }
    }, [isAuthenticated]);

    // Save chat history
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem('quran_user_chat', JSON.stringify(messages));
        } else {
            localStorage.setItem('quran_temp_chat', JSON.stringify(messages));
        }
    }, [messages, isAuthenticated]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (inputMessage.trim() === '') return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        setTimeout(() => {
            const randomAyah = ayahsData[Math.floor(Math.random() * ayahsData.length)];
            const botMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: `Based on your question, I found this relevant ayah that speaks to your concern:`,
                ayah: randomAyah,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleVoiceInput = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setTimeout(() => {
                setInputMessage('Tell me about patience in Islam');
                setIsListening(false);
            }, 2000);
        }
    };

    const handleNewChat = () => {
        setMessages([
            {
                id: '1',
                type: 'bot',
                content: 'Peace be upon you! I\'m here to help you explore the wisdom of the Quran. Ask me anything about Islamic teachings, request verses on specific themes, or seek guidance.',
                timestamp: new Date()
            }
        ]);
        setShowSidebar(false);
    };

    const handleSignIn = () => {
        setShowAuthModal(true);
    };

    const handleAuthSuccess = () => {
        const tempChat = localStorage.getItem('quran_temp_chat');
        if (tempChat) {
            const tempMessages = JSON.parse(tempChat);
            dispatch(migrateTempData(tempMessages));
        }
        setShowAuthModal(false);
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {isAuthenticated && (
                <ChatSidebar
                    isOpen={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    onNewChat={handleNewChat}
                />
            )}

            <div className="flex-1 flex flex-col">
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {isAuthenticated && (
                                <button
                                    onClick={() => setShowSidebar(true)}
                                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Quran AI Assistant
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Ask questions about Islamic teachings and explore the Quran
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {!isAuthenticated && (
                            <GuestBanner onSignIn={handleSignIn} />
                        )}

                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about Islamic teachings, request verses, or seek guidance..."
                                    className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                    rows={3}
                                />
                                <button
                                    onClick={toggleVoiceInput}
                                    className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors duration-200 ${isListening
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                                        }`}
                                    aria-label="Voice input"
                                >
                                    <Mic className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={inputMessage.trim() === ''}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <button
                                onClick={() => setInputMessage('Tell me about patience in difficult times')}
                                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200"
                            >
                                Patience
                            </button>
                            <button
                                onClick={() => setInputMessage('Show me verses about gratitude')}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                            >
                                Gratitude
                            </button>
                            <button
                                onClick={() => setInputMessage('What does the Quran say about forgiveness?')}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
                            >
                                Forgiveness
                            </button>
                            <button
                                onClick={() => setInputMessage('Help me understand Islamic prayer')}
                                className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-sm hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors duration-200"
                            >
                                Prayer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
};

export default Chat;