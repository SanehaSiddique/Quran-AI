import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: []
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const exists = state.favorites.find(ayah => ayah.id === action.payload.id);
      if (!exists) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(ayah => ayah.id !== action.payload);
    }
  }
});

export const { addToFavorites, removeFromFavorites } = favoritesSlice.actions;

export const selectFavorites = (state) => state.favorites.favorites;

export const selectIsFavorite = (state, id) =>
  state.favorites.favorites.some(ayah => ayah.id === id);

export default favoritesSlice.reducer;
