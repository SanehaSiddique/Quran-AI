import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Menu, X } from 'lucide-react';
import DarkModeToggle from "./DarkModeToggle";
import AuthModal from './AuthModal';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const Header = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector(state => state.auth);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        dispatch(logout());
        setShowUserMenu(false);
    };

    return (
        <>
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                                Quran AI
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/')
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : 'text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/chat"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/chat')
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : 'text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
                                    }`}
                            >
                                Chat
                            </Link>
                            <Link
                                to="/explore"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/explore')
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : 'text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
                                    }`}
                            >
                                Explore
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/favorites"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/favorites')
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
                                        }`}
                                >
                                    Favorites
                                </Link>
                            )}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            <DarkModeToggle />


                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {user?.name}
                                        </span>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {user?.email}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                                >
                                    Sign In
                                </button>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                {showMobileMenu ? (
                                    <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {showMobileMenu && (
                        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to="/"
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/chat"
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/chat') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Chat
                                </Link>
                                <Link
                                    to="/explore"
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/explore') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Explore
                                </Link>
                                {isAuthenticated && (
                                    <Link
                                        to="/favorites"
                                        onClick={() => setShowMobileMenu(false)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/favorites') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        Favorites
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => {
                    setShowAuthModal(false);
                    setShowUserMenu(false);
                }}
            />

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </>
    );
};

export default Header;