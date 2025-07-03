import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../axiosInstance';

export const fetchFavoritesFromServer = createAsyncThunk(
  'favorites/fetchFromServer',
  async (userId) => {
    const res = await API.get(`/favorites/get-favorite/${userId}`);
    return res.data;
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToServer',
  async ({ userId, ayah }) => {
    await API.post('/favorites/add-favorite', { userId, ayah });
    return ayah;
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromServer',
  async ({ userId, ayahId }) => {
    await API.delete('/favorites/remove-favorite', { data: { userId, ayahId } });
    return ayahId;
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoritesFromServer.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites.push(action.payload);
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(f => f.id !== action.payload);
      });
  }
});

export const selectFavorites = (state) => state.favorites.favorites;
export const selectIsFavorite = (state, id) =>
  state.favorites.favorites.some(ayah => ayah.id === id);

export default favoritesSlice.reducer;
