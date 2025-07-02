import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Heart, Sparkles } from 'lucide-react';
import { ayahsData, inspirationalQuotes } from '../data/mockData';

const Home = () => {
  const ayahOfTheDay = ayahsData[0];
  const quote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 dark:from-green-600/20 dark:to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Discover the Wisdom of the{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Quran
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Engage with AI-powered insights, explore verses by theme, and build your personal collection of meaningful ayahs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chatting
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Search className="mr-2 h-5 w-5" />
                Explore Verses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ayah of the Day */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ayah of the Day
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Arabic Text */}
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-arabic text-gray-900 dark:text-white leading-relaxed" dir="rtl">
                {ayahOfTheDay.arabic}
              </p>
            </div>

            {/* Translation */}
            <div className="text-center">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                "{ayahOfTheDay.translation}"
              </p>
            </div>

            {/* Tafsir */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-green-600" />
                Reflection:
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {ayahOfTheDay.tafsir}
              </p>
            </div>

            {/* Reference */}
            <div className="text-center">
              <span className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {ayahOfTheDay.surah} {ayahOfTheDay.ayahNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl md:text-2xl text-white font-light leading-relaxed">
            {quote}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Enhance Your Spiritual Journey
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover new features to deepen your connection with the Quran
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Conversations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Engage in meaningful discussions about Islamic teachings with our AI assistant
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Smart Exploration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find verses by theme, surah, or keywords with our intelligent search
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Personal Collection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Save your favorite verses and build your personal spiritual library
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;