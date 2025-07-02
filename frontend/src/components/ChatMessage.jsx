import React from 'react';
import { Heart, Volume2, Bot, User } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { addToFavorites, removeFromFavorites, selectIsFavorite } from '../redux/slices/favoritesSlice';

const ChatMessage = ({ message }) => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const isInFavorites = useAppSelector(state =>
        message.ayah ? selectIsFavorite(state, message.ayah.id) : false
    );


    const handleFavoriteToggle = () => {
        if (!isAuthenticated || !message.ayah) return;

        if (isInFavorites) {
            dispatch(removeFromFavorites(message.ayah.id));
        } else {
            dispatch(addToFavorites(message.ayah));
        }
    };

    const handlePlayAudio = () => {
        console.log('Playing audio for message:', message.id);
    };

    if (message.type === 'user') {
        return (
            <div className="flex justify-end mb-6">
                <div className="flex items-start space-x-3 max-w-2xl">
                    <div className="bg-green-500 text-white rounded-lg px-4 py-3 shadow-sm">
                        <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-3 max-w-4xl">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message.content}</p>

                    {message.ayah && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                            {/* Arabic Text */}
                            <div className="text-right">
                                <p className="text-lg font-arabic text-gray-900 dark:text-white leading-relaxed" dir="rtl">
                                    {message.ayah.arabic}
                                </p>
                            </div>

                            {/* Translation */}
                            <div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {message.ayah.translation}
                                </p>
                            </div>

                            {/* Tafsir */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                    Tafsir:
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {message.ayah.tafsir}
                                </p>
                            </div>

                            {/* Reference and Actions */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                                        {message.ayah.surah} {message.ayah.ayahNumber}
                                    </span>
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                                        {message.ayah.theme}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePlayAudio}
                                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                                        aria-label="Play audio"
                                    >
                                        <Volume2 className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={handleFavoriteToggle}
                                        disabled={!isAuthenticated}
                                        className={`p-1 transition-colors duration-200 ${!isAuthenticated
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : isInFavorites
                                                    ? 'text-red-500 hover:text-red-600'
                                                    : 'text-gray-400 hover:text-red-500'
                                            }`}
                                        aria-label={isAuthenticated ? (isInFavorites ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to favorite'}
                                        title={!isAuthenticated ? 'Sign in to save favorites' : undefined}
                                    >
                                        <Heart className={`h-3 w-3 ${isInFavorites && isAuthenticated ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;