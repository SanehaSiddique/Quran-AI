import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import AyahCard from '../components/AyahCard';
import { surahs } from '../data/mockData';
import { ayahThemes } from '../data/themeMap';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchAyahsBySurah, fetchAyahsByVerseKeys, clearAyahs } from '../redux/slices/ayahSlice';

const Explore = () => {
  const dispatch = useAppDispatch();
  const rawAyahs = useAppSelector((state) => state.ayah.ayahs);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState('');
  const [themeQuery, setThemeQuery] = useState('');

  const ayahs = useMemo(() => rawAyahs || [], [rawAyahs]);

  useEffect(() => {
    if (!searchQuery && !selectedSurah && !themeQuery) {
      dispatch(clearAyahs());
      return;
    }

    if (selectedSurah && !themeQuery) {
      const surahIndex = surahs.indexOf(selectedSurah) + 1;
      if (surahIndex > 0) dispatch(fetchAyahsBySurah(surahIndex));
    } else if (themeQuery) {
      const themeObj = ayahThemes.find((t) => t.label === themeQuery);
      if (!themeObj) return;

      if (selectedSurah) {
        // Filter theme ayahs within selected surah
        const filteredAyahs = themeObj.ayahs.filter((v) => v.startsWith(`${surahs.indexOf(selectedSurah) + 1}:`));
        if (filteredAyahs.length > 0) {
          dispatch(fetchAyahsByVerseKeys(filteredAyahs));
        } else {
          // Still load the whole surah in case theme has nothing inside it
          dispatch(fetchAyahsBySurah(surahs.indexOf(selectedSurah) + 1));
        }
      } else {
        dispatch(fetchAyahsByVerseKeys(themeObj.ayahs));
      }
    }
  }, [selectedSurah, themeQuery, searchQuery, dispatch]);

  const filteredAyahs = useMemo(() => {
    return ayahs.filter((ayah) => {
      const matchesSearch =
        searchQuery === '' ||
        ayah.numberInSurah?.toString().includes(searchQuery) ||
        ayah.arabic?.includes(searchQuery) ||
        ayah.translation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ayah.translation_urdu?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, ayahs]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSurah('');
    setThemeQuery('');
    dispatch(clearAyahs());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore the Quran</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover ayahs by theme, surah, or search specific content
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search ayahs (text or number)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              >
                <option value="">All Surahs</option>
                {surahs.map((surah) => (
                  <option key={surah} value={surah}>{surah}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={themeQuery}
                onChange={(e) => setThemeQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              >
                <option value="">All Themes</option>
                {ayahThemes.map((theme) => (
                  <option key={theme.label} value={theme.label}>{theme.label}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || selectedSurah || themeQuery) && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {searchQuery && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Search: "{searchQuery}"</span>}
                {selectedSurah && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">Surah: {selectedSurah}</span>}
                {themeQuery && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">Theme: {themeQuery}</span>}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredAyahs.length} result{filteredAyahs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredAyahs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAyahs.map((ayah) => (
              <AyahCard key={ayah.verse_key || ayah.number} ayah={ayah} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or theme</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;