import React from 'react';
import { Heart, Volume2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { addToFavorites, removeFromFavorites, selectIsFavorite } from '../redux/slices/favoritesSlice';


const AyahCard = ({ ayah, showActions = true }) => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const isInFavorites = useAppSelector(state => selectIsFavorite(state, ayah.id));

    const handleFavoriteToggle = () => {
        if (!isAuthenticated) return;

        if (isInFavorites) {
            dispatch(removeFromFavorites(ayah.id));
        } else {
            dispatch(addToFavorites(ayah));
        }
    };

    const handlePlayAudio = () => {
        // Mock audio functionality
        console.log('Playing audio for:', ayah.arabic);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
                {/* Arabic Text */}
                <div className="text-right">
                    <p className="text-xl font-arabic text-gray-900 dark:text-white leading-relaxed" dir="rtl">
                        {ayah.arabic}
                    </p>
                </div>

                {/* Translation */}
                <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {ayah.translation}
                    </p>
                </div>

                {/* Tafsir */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Tafsir:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {ayah.tafsir}
                    </p>
                </div>

                {/* Reference */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                            {ayah.surah} {ayah.ayahNumber}
                        </span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                            {ayah.theme}
                        </span>
                    </div>

                    {showActions && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePlayAudio}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                                aria-label="Play audio"
                            >
                                <Volume2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleFavoriteToggle}
                                disabled={!isAuthenticated}
                                className={`p-2 transition-colors duration-200 ${!isAuthenticated
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : isInFavorites
                                            ? 'text-red-500 hover:text-red-600'
                                            : 'text-gray-400 hover:text-red-500'
                                    }`}
                                aria-label={isAuthenticated ? (isInFavorites ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to favorite'}
                                title={!isAuthenticated ? 'Sign in to save favorites' : undefined}
                            >
                                <Heart className={`h-4 w-4 ${isInFavorites && isAuthenticated ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AyahCard;