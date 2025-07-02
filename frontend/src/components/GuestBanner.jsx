import React from 'react';
import { AlertCircle, LogIn } from 'lucide-react';

const GuestBanner = ({ onSignIn }) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              You are chatting as a guest
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Sign in to save your chat history and favorite ayahs
            </p>
          </div>
        </div>
        <button
          onClick={onSignIn}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </button>
      </div>
    </div>
  );
};

export default GuestBanner;