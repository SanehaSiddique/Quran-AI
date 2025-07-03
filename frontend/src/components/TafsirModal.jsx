// src/components/TafsirModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TafsirModal = ({ ayah, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Tafsir - Surah {ayah.surah}, Ayah {ayah.numberInSurah}
        </h2>

        {/* Tafsir Content */}
        <div className="prose dark:prose-invert text-sm leading-relaxed max-w-none whitespace-pre-wrap dark:text-gray-300">
          <ReactMarkdown>{ayah.tafsir || 'No tafsir available.'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default TafsirModal;
