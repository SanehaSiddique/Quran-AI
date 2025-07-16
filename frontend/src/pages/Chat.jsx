import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Menu, Sparkles, Bot, MicOff, Waves } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import ChatSidebar from '../components/ChatSidebar';
import GuestBanner from '../components/GuestBanner';
import AuthModal from '../components/AuthModal';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { migrateTempData } from '../redux/slices/authSlice';
import axios from 'axios';

const Chat = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    console.log("Chat.jsx - isAuthenticated:", isAuthenticated);

    const [messages, setMessages] = useState([
        {
            id: '1',
            type: 'bot',
            content: 'Peace be upon you! I\'m here to help you explore the wisdom of the Quran. Ask me anything about Islamic teachings, request verses on specific themes, or seek guidance.',
            createdAt: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceError, setVoiceError] = useState(null);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [interimTranscript, setInterimTranscript] = useState('');
    const messagesEndRef = useRef(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const recognitionRef = useRef(null);
    const voiceLevelInterval = useRef(null);
    const suggestedQuestions = [
        "What does Islam say about patience?",
        "How to be a good Muslim in daily life?",
        "Explain the concept of Tawheed"
    ];

    // Initialize SpeechRecognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
            console.log("🧪 Chat.jsx - SpeechRecognition initialized");

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setInputMessage(finalTranscript || interimTranscript);
                setInterimTranscript(interimTranscript);
            };

            recognitionRef.current.onstart = () => {
                console.log("🧪 Chat.jsx - Speech recognition started");
                setIsListening(true);
                setVoiceError(null);
                startVoiceLevelSimulation();
            };

            recognitionRef.current.onend = () => {
                console.log("🧪 Chat.jsx - Speech recognition ended");
                setIsListening(false);
                stopVoiceLevelSimulation();
                if (inputMessage.trim()) {
                    handleSendMessage();
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("🧪 Chat.jsx - Speech recognition error:", event.error);
                setIsListening(false);
                stopVoiceLevelSimulation();

                let errorMessage = 'Speech recognition error. Please try again or type your message.';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try again.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone not available. Please check your microphone settings.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please enable microphone permissions.';
                        break;
                }

                setVoiceError(errorMessage);
                setTimeout(() => setVoiceError(null), 5000);
            };
        } else {
            console.warn("🧪 Chat.jsx - SpeechRecognition not supported in this browser");
            setVoiceError('Voice input is not supported in your browser. Please use Chrome or Edge.');
            setTimeout(() => setVoiceError(null), 5000);
        }

        return () => {
            stopVoiceLevelSimulation();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Simulate voice level for visual feedback
    const startVoiceLevelSimulation = () => {
        stopVoiceLevelSimulation();
        voiceLevelInterval.current = setInterval(() => {
            setVoiceLevel(Math.random() * 100);
        }, 100);
    };

    const stopVoiceLevelSimulation = () => {
        if (voiceLevelInterval.current) {
            clearInterval(voiceLevelInterval.current);
            voiceLevelInterval.current = null;
            setVoiceLevel(0);
        }
    };

    // Load guest chat from localStorage only if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            console.log("Chat.jsx - Loading guest chat");
            const savedTempChat = localStorage.getItem('quran_temp_chat');
            if (savedTempChat) {
                try {
                    const parsedChat = JSON.parse(savedTempChat);
                    setMessages(Array.isArray(parsedChat) ? parsedChat : messages);
                    console.log("Chat.jsx - Loaded temp chat:", parsedChat);
                } catch (e) {
                    console.error("Chat.jsx - Error parsing temp chat:", e);
                }
            }
        }
    }, [isAuthenticated]);

    // Save guest chat to localStorage
    useEffect(() => {
        if (messages.length > 0 && !isAuthenticated) {
            console.log("Chat.jsx - Saving guest messages to quran_temp_chat");
            localStorage.setItem('quran_temp_chat', JSON.stringify(messages));
        }
    }, [messages, isAuthenticated]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (inputMessage.trim() === '') return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            createdAt: new Date()
        };

        console.log("Chat.jsx - Sending user message:", userMessage);
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const userObject = localStorage.getItem('quran_user');
            const userId = userObject ? JSON.parse(userObject).id : 'guest';
            console.log("Chat.jsx - User ID for AI request:", userId);

            const { data } = await axios.post(
                'http://localhost:8000/quran-ai',
                {
                    query: inputMessage,
                    top_k: 6,
                    user_id: userId
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const botMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: data.response,
                createdAt: new Date()
            };

            console.log("Chat.jsx - Received bot message:", botMessage);
            setMessages(prev => [...prev, botMessage]);

            if (isAuthenticated && userId !== 'guest') {
                console.log("Chat.jsx - Calling saveSessionToServer");
                await saveSessionToServer(userMessage, botMessage);
                setRefreshTrigger(prev => prev + 1);
            } else {
                console.log("Chat.jsx - Skipping saveSessionToServer: not authenticated or guest user");
            }
        } catch (error) {
            console.error("Chat.jsx - Error sending message:", error);
            const errorMessage = {
                id: (Date.now() + 2).toString(),
                type: 'bot',
                content: "⚠️ Sorry, something went wrong while processing your request.",
                createdAt: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSessionToServer = async (userMessage, botMessage) => {
        console.log("Chat.jsx - saveSessionToServer called");
        const userObject = localStorage.getItem('quran_user');
        let userId;
        try {
            userId = userObject ? JSON.parse(userObject).id : null;
        } catch (e) {
            console.error("Chat.jsx - Error parsing quran_user:", e);
            return;
        }
        if (!userId) {
            console.log("Chat.jsx - No userId, showing auth modal");
            setShowAuthModal(true);
            return;
        }

        const title = userMessage.content.slice(0, 40) || 'New Session';
        const updatedMessages = [...messages.filter(msg => msg.id !== userMessage.id), userMessage, botMessage];

        try {
            const endpoint = activeSessionId
                ? `http://localhost:5000/api/chat/session/${activeSessionId}`
                : `http://localhost:5000/api/chat/session`;
            const method = activeSessionId ? 'put' : 'post';

            console.log("Chat.jsx - Saving session to:", endpoint, "Method:", method);
            console.log("Chat.jsx - Session data:", { user_id: userId, title, messages: updatedMessages });

            const response = await axios[method](endpoint, {
                user_id: userId,
                title,
                messages: updatedMessages
            });

            console.log("Chat.jsx - Session saved, response:", response.data);
            if (!activeSessionId) {
                setActiveSessionId(response.data.session._id || response.data.session.id);
            }
        } catch (error) {
            console.error("Chat.jsx - Error saving session:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            setVoiceError('Voice input is not supported in this browser. Please type your message.');
            setTimeout(() => setVoiceError(null), 5000);
            return;
        }

        if (isListening) {
            console.log("🧪 Chat.jsx - Stopping speech recognition");
            recognitionRef.current.stop();
            setIsListening(false);
            stopVoiceLevelSimulation();
        } else {
            console.log("🧪 Chat.jsx - Starting speech recognition");
            setIsListening(true);
            setInputMessage('');
            setInterimTranscript('');
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Error starting recognition:", error);
                setIsListening(false);
                setVoiceError('Error accessing microphone. Please check permissions.');
                setTimeout(() => setVoiceError(null), 5000);
            }
        }
    };

    const handleNewChat = () => {
        console.log("Chat.jsx - Starting new chat");
        setMessages([{
            id: '1',
            type: 'bot',
            content: 'Peace be upon you! I\'m here to help you explore the wisdom of the Quran.',
            createdAt: new Date()
        }]);
        setActiveSessionId(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleSignIn = () => {
        console.log("Chat.jsx - Opening auth modal");
        setShowAuthModal(true);
    };

    const handleAuthSuccess = () => {
        console.log("Chat.jsx - Auth success");
        const tempChat = localStorage.getItem('quran_temp_chat');
        if (tempChat) {
            try {
                const tempMessages = JSON.parse(tempChat);
                dispatch(migrateTempData(tempMessages));
                setMessages(tempMessages);
                console.log("Chat.jsx - Migrated temp chat:", tempMessages);
                setRefreshTrigger(prev => prev + 1);
            } catch (e) {
                console.error("Chat.jsx - Error parsing temp chat:", e);
            }
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
                    setMessages={setMessages}
                    setActiveSessionId={setActiveSessionId}
                    refreshTrigger={refreshTrigger}
                />
            )}
            <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {isAuthenticated && (
                                <button
                                    onClick={() => setShowSidebar(true)}
                                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                                <ChatMessage
                                    key={message.id}
                                    message={{
                                        ...message,
                                        createdAt: message.createdAt instanceof Date
                                            ? message.createdAt
                                            : new Date(message.createdAt)
                                    }}
                                />
                            ))}
                        </div>
                        {isLoading && (
                            <div className="flex justify-start mb-8">
                                <div className="flex items-start gap-3 max-w-[85%]">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-900/80 rounded-2xl rounded-tl-none px-6 py-5 border border-gray-100 dark:border-gray-700">
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
                        {voiceError && (
                            <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                                <MicOff className="h-4 w-4 mr-2" />
                                {voiceError}
                            </div>
                        )}

                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={isListening ? interimTranscript : inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={isListening ? 'Listening... (speak now)' : 'Ask about Islamic teachings, request verses, or seek guidance...'}
                                    className={`w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-gray-700 border ${isListening ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-300 dark:border-gray-600'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-300`}
                                    rows={2}
                                    disabled={isListening}
                                />

                                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                    {isListening && (
                                        <div className="flex items-center gap-1">
                                            {[20, 40, 60, 80, 100].map((level) => (
                                                <div
                                                    key={level}
                                                    className="w-1 h-2 bg-green-500 rounded-full"
                                                    style={{
                                                        height: `${voiceLevel > level ? level : Math.max(5, voiceLevel)}%`,
                                                        opacity: voiceLevel > level ? 1 : 0.6
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={toggleVoiceInput}
                                        className={`p-2 rounded-lg transition-all duration-300 ${isListening
                                                ? 'bg-green-500 text-white animate-pulse shadow-lg shadow-green-500/30'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                                            }`}
                                        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                                        disabled={isLoading}
                                    >
                                        {isListening ? (
                                            <div className="relative">
                                                <Waves className="h-4 w-4" />
                                                <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping"></span>
                                            </div>
                                        ) : (
                                            <Mic className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {isListening && (
                                    <div className="absolute left-4 -bottom-5 text-xs text-green-600 dark:text-green-400 flex items-center">
                                        <span className="animate-pulse">●</span>
                                        <span className="ml-1">Listening...</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSendMessage}
                                disabled={(inputMessage.trim() === '' && !isListening) || isLoading}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium disabled:cursor-not-allowed flex items-center justify-center min-w-[50px] h-[48px] transition-colors duration-300"
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

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            Note: Responses may contain errors. Please verify important information with qualified scholars.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputMessage(question)}
                                    className={`px-3 py-1 rounded-full text-sm flex items-center transition-colors duration-200 ${index % 4 === 0 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' :
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