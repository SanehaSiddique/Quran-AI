import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Menu, Sparkles, Bot } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import ChatSidebar from '../components/ChatSidebar';
import GuestBanner from '../components/GuestBanner';
import AuthModal from '../components/AuthModal';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { migrateTempData } from '../redux/slices/authSlice';
import { ayahsData } from '../data/mockData';
import axios from 'axios';

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
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([
        "What does Islam say about patience?",
        "How to be a good Muslim in daily life?",
        "Explain the concept of Tawheed"
    ]);

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

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (inputMessage.trim() === '') return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const userObject = localStorage.getItem('quran_user');
            const userId = userObject ? JSON.parse(userObject).id : 'guest';

            const { data } = await axios.post(
                'http://localhost:8000/quran-ai',
                {
                    query: inputMessage,
                    top_k: 6,
                    user_id: userId
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const botMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("❌ Error:", error);
            const errorMessage = {
                id: (Date.now() + 2).toString(),
                type: 'bot',
                content: "⚠️ Sorry, something went wrong while processing your request.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
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
        <div className="flex h-full">
            {isAuthenticated && (
                <ChatSidebar
                    isOpen={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    onNewChat={handleNewChat}
                />
            )}

            <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 top-16 shadow-sm">
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

                <div className="flex-1">
                    <div className="max-w-5xl mx-auto space-y-6 w-full px-4">
                        <div className="pt-6">
                            {!isAuthenticated && <GuestBanner onSignIn={handleSignIn} />}
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                        </div>
                        {isLoading && (
                            <div className="flex justify-start mb-8">
                                <div className="flex items-start gap-3 max-w-[85%]">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-900/80 rounded-2xl rounded-tl-none px-6 py-5 shadow-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-100"></div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse delay-200"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>


                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 sticky bottom-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about Islamic teachings, request verses, or seek guidance..."
                                    className="w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                    rows={2}
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
                                disabled={inputMessage.trim() === '' || isLoading}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px] h-[48px]"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>

                        </div>

                        {/* Disclaimer text */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Note: Responses may contain errors. Please verify important information with qualified scholars.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputMessage(question)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 flex items-center ${index % 4 === 0 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' :
                                        index % 4 === 1 ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' :
                                            index % 4 === 2 ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800' :
                                                'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                                        }`}
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {question}
                                </button>
                            ))}
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