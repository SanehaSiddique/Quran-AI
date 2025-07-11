import React from 'react';
import { MessageCircle, Clock, Plus } from 'lucide-react';
import { useAppSelector } from '../redux/store';

const ChatSidebar = ({ isOpen, onClose, onNewChat }) => {
    const { chatSessions, user } = useAppSelector(state => state.auth);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };


    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:sticky 
        top-0 left-0 bottom-0 
        w-80 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 
        z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        overflow-y-auto
      `}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
                                {user?.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Chat Sessions */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                        Recent Conversations
                    </h4>

                    <div className="space-y-2">
                        {chatSessions.map((session) => (
                            <button
                                key={session.id}
                                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <MessageCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {session.title}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(session.timestamp)}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {session.messageCount} messages
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {chatSessions.length === 0 && (
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