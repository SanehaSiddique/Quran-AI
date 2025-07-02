import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loadFromStorage as loadAuthFromStorage } from './slices/authSlice';
import favoritesReducer from './slices/favoritesSlice';
import { useDispatch, useSelector } from 'react-redux';

// Utility to load favorites from localStorage
const loadFavoritesFromStorage = () => {
  try {
    const saved = localStorage.getItem('quran_favorites');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load favorites from localStorage', e);
  }
  return [];
};

// Configure the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    favorites: favoritesReducer
  },
  preloadedState: {
    favorites: {
      favorites: loadFavoritesFromStorage()
    }
  }
});

// Dispatch auth loadFromStorage manually
store.dispatch(loadAuthFromStorage());

// Subscribe to store changes and sync favorites to localStorage
store.subscribe(() => {
  const { favorites } = store.getState();
  localStorage.setItem('quran_favorites', JSON.stringify(favorites.favorites));
});

// Typed hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
