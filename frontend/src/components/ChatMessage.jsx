import React, { useMemo } from 'react';
import { Heart, Volume2, Bot, User, Copy, Download } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { addToFavorites, removeFromFavorites, selectIsFavorite } from '../redux/slices/favoritesSlice';
import DOMPurify from 'dompurify';

const ChatMessage = ({ message }) => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
    const isInFavorites = useAppSelector(state =>
        message.ayah ? selectIsFavorite(state, message.ayah.id) : false
    );

    // Updated formatBotResponse function with better Arabic handling
    const formatBotResponse = (content) => {
        if (!content) return '';
      
        // Robustly remove dir="rtl" from content (handle various cases)
        content = content
          .replace(/\*\*dir="rtl"\*\*/gi, '') 
          .replace(/["']dir="rtl"["']/gi, '') 
          .replace(/dir="rtl"\s*/gi, '') 
          .trim();
      
        // Enhanced Arabic detection
        const isArabic = (text) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
      
        let formatted = content
          .replace(/\n\n/g, '</p><p class="mb-4">')
          .replace(/^###\s(.*)$/gm, '<h3 class="text-lg font-semibold mb-3 mt-5 text-emerald-600 dark:text-emerald-400">$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 dark:text-gray-200">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
          .replace(/^\*\s(.*)$/gm, '<li class="flex items-start mb-2 pl-1"><ChevronRight className="w-4 h-4 mt-1 mr-2 flex-shrink-0 text-emerald-500" /><span>$1</span></li>')
          .replace(
            /(["'])(.*?)\1\s*\(Qur'an\s*(\d+:\d+)\)/g,
            (match, quote, verse, ref) => {
              const isVerseArabic = isArabic(verse);
              return `
                <blockquote 
                  class="bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 pl-4 py-3 my-4 
                         ${isVerseArabic ? 'font-arabic text-2xl leading-loose text-right' : 'italic'}
                         text-gray-700 dark:text-gray-300" 
                  ${isVerseArabic ? 'dir="rtl"' : ''}
                >
                  <p>${verse}</p>
                  <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded mt-2 inline-block">
                    Qur'an ${ref}
                  </span>
                </blockquote>`;
            }
          )
          .replace(
            /(["'])([\u0600-\u06FF].*?)\1/g,
            (match, quote, dua) => {
              return `
                <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 
                            rounded-lg p-4 my-4 font-arabic text-2xl text-right leading-loose 
                            text-gray-700 dark:text-gray-300"
                  ${dua}
                </div>`;
            }
          )
          .replace(/^>\s(.*)$/gm, '<blockquote class="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 italic pl-4 py-2 my-3 text-gray-700 dark:text-gray-300">$1</blockquote>')
          .replace(/\n/g, '<br />');
      
        if (formatted.includes('<li')) {
          formatted = formatted.replace(/(<li.*?>.*?<\/li>)+/g, '<ul class="pl-2 mb-4 mt-2">$&</ul>');
        }
      
        formatted = `<div class="message-content">${formatted}</div>`;
      
        return formatted;
    };

    const sanitizedContent = useMemo(() => {
        if (typeof message.content === 'string') {
            const formatted = formatBotResponse(message.content);
            return {
                __html: DOMPurify.sanitize(formatted)
            };
        }
        return { __html: '' };
    }, [message.content]);

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

    const handleCopy = () => {
        const content = message.content || '';
        navigator.clipboard.writeText(content).then(() => {
            alert('Response copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy response.');
        });
    };

    const handleDownload = () => {
        const content = message.content || '';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bot_response_${message.id || 'message'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Response downloaded as text file!');
    };

    if (message.type === 'user') {
        return (
            <div className="flex justify-end mb-6">
                <div className="flex items-end gap-2 max-w-[90%]">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-lg">
                        <p className="text-sm font-medium">{message.content}</p>
                    </div>
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow">
                        <User className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mb-8">
          <div className="flex items-start gap-3 max-w-[90%]">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl rounded-tl-none px-6 py-5 shadow-lg border border-gray-100 dark:border-gray-700">
              <div
                className="prose prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={sanitizedContent}
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-emerald-500 transition-colors"
                  onClick={handleCopy}
                  title="Copy response"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-emerald-500 transition-colors"
                  onClick={handleDownload}
                  title="Download response"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
              {message.ayah && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 rounded-lg">
                    <div className="text-right mb-3">
                      <p className="text-2xl font-arabic leading-loose text-gray-900 dark:text-white" dir="rtl">
                        {message.ayah.arabic}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700/50 p-3 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {message.ayah.translation}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          Tafsir Explanation
                        </h4>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-emerald-500 transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message.ayah.tafsir}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
                          {message.ayah.surah} {message.ayah.ayahNumber}
                        </span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                          {message.ayah.theme}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-emerald-500 transition-colors"
                          onClick={handlePlayAudio}
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button
                          className={`p-2 rounded-full transition-colors ${
                            isInFavorites
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500'
                          }`}
                          onClick={handleFavoriteToggle}
                          disabled={!isAuthenticated}
                        >
                          <Heart className={`w-5 h-5 ${isInFavorites ? 'fill-current' : ''}`} />
                        </button>
                      </div>
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