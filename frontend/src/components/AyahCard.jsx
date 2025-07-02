import React, { useState, useRef } from 'react';
import { Heart, Volume2, Copy } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { addToFavorites, removeFromFavorites, selectIsFavorite } from '../redux/slices/favoritesSlice';
import TafsirModal from './TafsirModal';
import ReactMarkdown from 'react-markdown';

const reciters = [
    { id: 1, name: 'Mishary Rashid Al Afasy' },
    { id: 2, name: 'Abu Bakr Al Shatri' },
    { id: 3, name: 'Nasser Al Qatami' },
    { id: 4, name: 'Yasser Al Dosari' },
    { id: 5, name: 'Hani Ar Rifai' }
];

const AyahCard = ({ ayah, showActions = true }) => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const isInFavorites = useAppSelector(state => selectIsFavorite(state, ayah.number));

    const tafsirRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState(1);
    const [showTafsir, setShowTafsir] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleFavoriteToggle = () => {
        if (!isAuthenticated) return;
        isInFavorites
            ? dispatch(removeFromFavorites(ayah.number))
            : dispatch(addToFavorites(ayah));
    };

    const handlePlayAudio = () => {
        const audio = new Audio(`https://the-quran-project.github.io/Quran-Audio/Data/${selectedReciter}/${ayah.surah}_${ayah.numberInSurah}.mp3`);
        setIsPlaying(true);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
            console.error('Failed to play audio');
            setIsPlaying(false);
        };
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${ayah.arabic}\n${ayah.translation}\n${ayah.translation_urdu}`);
        alert('Ayah copied to clipboard');
    };

    const tafsirText = ayah.tafsir || '';
    const isLong = tafsirText.length > 700;
    const displayedTafsir = isLong && !expanded ? tafsirText.slice(0, 200) + '...' : tafsirText;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
                <p className="text-right text-xl font-arabic text-gray-900 dark:text-white" dir="rtl">
                    {ayah.arabic}
                </p>

                <p className="text-gray-700 dark:text-gray-300 font-medium">{ayah.translation}</p>

                <p className="text-right text-sm text-gray-600 dark:text-gray-400 font-urdu" dir="rtl">
                    {ayah.translation_urdu}
                </p>

                {ayah.tafsir && (
                    <div>
                        <button
                            onClick={() => {
                                setShowTafsir(!showTafsir);
                                if (!showTafsir) {
                                    setTimeout(() => tafsirRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
                                }
                            }}
                            className="text-sm text-green-600 dark:text-green-400 hover:underline"
                        >
                            {showTafsir ? 'Hide Tafsir' : 'Show Tafsir'}
                        </button>
                    </div>
                )}

                {showTafsir && (
                    <div ref={tafsirRef} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Tafsir (Ibn Kathir):</h4>
                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed dark:text-gray-300">
                            <ReactMarkdown>{displayedTafsir}</ReactMarkdown>
                        </div>
                        {isLong && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-xs mt-2 text-blue-600 dark:text-blue-300 hover:underline"
                            >
                                Read Full Tafsir →
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                            Ayah: {ayah.verse_key}
                        </span>
                        {ayah.theme && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                                {ayah.theme}
                            </span>
                        )}
                        <select
                            value={selectedReciter}
                            onChange={(e) => setSelectedReciter(Number(e.target.value))}
                            className="text-xs border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                        >
                            {reciters.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {showActions && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePlayAudio}
                                className={`p-2 ${isPlaying ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                            >
                                <Volume2 className="h-4 w-4" />
                            </button>
                            <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-yellow-500">
                                <Copy className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleFavoriteToggle}
                                disabled={!isAuthenticated}
                                className={`p-2 ${!isAuthenticated ? 'text-gray-300 cursor-not-allowed' : isInFavorites ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            >
                                <Heart className={`h-4 w-4 ${isInFavorites && isAuthenticated ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showModal && <TafsirModal ayah={ayah} onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default AyahCard;
