import React, { useState } from 'react';
import { Heart, Volume2, Trash2, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { removeFromFavorites, selectFavorites } from '../redux/slices/favoritesSlice';
import AyahCard from '../components/AyahCard';

const Favorites = () => {
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const [reciterMap, setReciterMap] = useState({});

    const dispatch = useAppDispatch();
    const favorites = useAppSelector(selectFavorites);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userId = useAppSelector(state => state.auth.user?.id);

    const handleRemoveFromFavorites = (ayahId) => {
        if (userId) {
            dispatch(removeFromFavorites({ userId, ayahId }));
        } else {
            console.error('User ID not found. Cannot remove from favorites.');
        }
    };

    const handleReciterChange = (ayahId, reciterId) => {
        setReciterMap(prev => ({ ...prev, [ayahId]: reciterId }));
    };

    const handlePlayAudio = (ayah) => {
        const reciterId = reciterMap[ayah.id] || 1; // default to 1
        const audio = new Audio(`https://the-quran-project.github.io/Quran-Audio/Data/${reciterId}/${ayah.surah}_${ayah.numberInSurah}.mp3`);
        setCurrentlyPlayingId(ayah.id);
        audio.play();
        audio.onended = () => {
            setCurrentlyPlayingId(null);
        };
        audio.onerror = () => {
            setCurrentlyPlayingId(null);
            console.error('Failed to play audio');
        };
    };

    const playAllSequentially = async (favoritesList) => {
        for (let ayah of favoritesList) {
            await new Promise((resolve, reject) => {
                const audio = new Audio(`https://the-quran-project.github.io/Quran-Audio/Data/2/${ayah.surah}_${ayah.numberInSurah}.mp3`);

                audio.play();
                audio.onended = resolve;
                audio.onerror = reject;
            });
        }
    };

    // Show sign-in prompt for unauthenticated users
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Sign In to Access Favorites
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Create an account or sign in to save your favorite ayahs and build your personal spiritual collection.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/chat"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Sign In
                        </a>
                        <a
                            href="/explore"
                            className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            Explore Ayahs
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-red-500 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Your Favorites
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your personal collection of meaningful ayahs from the Quran
                    </p>
                </div>

                {/* Favorites Count */}
                {favorites.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {favorites.length} saved ayah{favorites.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => playAllSequentially(favorites)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                                >
                                    <Volume2 className="h-4 w-4" />
                                    <span>Play All</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Favorites List */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {favorites.map((ayah) => (
                            <div key={ayah.id} className="relative min-w-0">
                                <div className="relative">
                                    <AyahCard ayah={ayah} showActions={false} onReciterChange={handleReciterChange} />
                                    {/* Custom Actions */}
                                    <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePlayAudio(ayah)}
                                            className={`p-2 bg-white dark:bg-gray-800 rounded-full dark:shadow-slate-700 shadow-md ${currentlyPlayingId === ayah.id
                                                    ? 'text-blue-500'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'
                                                } transition-colors duration-200`}
                                            aria-label="Play audio"
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromFavorites(ayah.id)}
                                            className="p-2 bg-white dark:bg-gray-800 dark:shadow-slate-700 rounded-full shadow-md text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                                            aria-label="Remove from favorites"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-400 mb-6">
                            <Heart className="h-24 w-24 mx-auto" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            No favorites yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Start exploring the Quran and save meaningful ayahs to build your personal collection. Click the heart icon on any ayah to add it here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/chat"
                                className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                Start Chatting
                            </a>
                            <a
                                href="/explore"
                                className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                Explore Ayahs
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;