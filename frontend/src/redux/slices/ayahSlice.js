// src/redux/slices/ayahSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ayahThemes } from '../../data/themeMap';

const BASE_URL = 'https://quranapi.pages.dev/api';

export const fetchAyahsBySurah = createAsyncThunk(
    'ayah/fetchAyahsBySurah',
    async (surahNo, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/${surahNo}.json`);
            const data = res.data;

            const arabic = data.arabic1;
            const english = data.english;
            const urdu = data.urdu;

            if (!arabic || !Array.isArray(arabic)) {
                throw new Error('Arabic ayahs not found');
            }

            const ayahPromises = arabic.map(async (text, index) => {
                const ayahNo = index + 1;
                const verse_key = `${surahNo}:${ayahNo}`;

                // Fetch tafsir for the specific ayah
                let tafsir = '';
                try {
                    const tafsirRes = await axios.get(`${BASE_URL}/tafsir/${surahNo}_${ayahNo}.json`);
                    const tafsirs = tafsirRes.data?.tafsirs || [];

                    if (tafsirs.length > 0) {
                        const primaryTafsir = tafsirs[0]; // Ibn Kathir or first author
                        const content = primaryTafsir.content;
                        tafsir = content ? content.replace(/<[^>]*>/g, '') : ''; // Remove HTML tags
                    }
                } catch (error) {
                    console.warn(`Tafsir not found for ayah ${verse_key}`);
                }


                return {
                    id: verse_key,
                    surah: surahNo,
                    numberInSurah: ayahNo,
                    number: parseInt(`${surahNo}${ayahNo.toString().padStart(3, '0')}`),
                    arabic: text,
                    translation: english?.[index] || '',
                    translation_urdu: urdu?.[index] || '',
                    audio: `https://the-quran-project.github.io/Quran-Audio/Data/2/${surahNo}_${ayahNo}.mp3`,
                    tafsir,
                    verse_key,
                    theme: ayahThemes[verse_key] || null
                };
            });

            const ayahs = await Promise.all(ayahPromises);
            return ayahs;
        } catch (err) {
            console.error('Fetch error:', err);
            return rejectWithValue(err.message || 'Failed to fetch surah');
        }
    }
);

export const fetchAyahsByVerseKeys = createAsyncThunk(
    'ayah/fetchAyahsByVerseKeys',
    async (verseKeys, { rejectWithValue }) => {
        try {
            const uniqueSurahs = [...new Set(verseKeys.map(v => parseInt(v.split(':')[0])))];
            let allAyahs = [];

            for (const surahNo of uniqueSurahs) {
                const res = await axios.get(`${BASE_URL}/${surahNo}.json`);
                const data = res.data;

                const arabic = data.arabic1;
                const english = data.english;
                const urdu = data.urdu;

                const ayahPromises = arabic.map(async (text, index) => {
                    const ayahNo = index + 1;
                    const verse_key = `${surahNo}:${ayahNo}`;

                    if (!verseKeys.includes(verse_key)) return null;

                    let tafsir = '';
                    try {
                        const tafsirRes = await axios.get(`${BASE_URL}/tafsir/${surahNo}_${ayahNo}.json`);
                        const tafsirs = tafsirRes.data?.tafsirs || [];
                        if (tafsirs.length > 0) {
                            const primaryTafsir = tafsirs[0];
                            tafsir = primaryTafsir.content?.replace(/<[^>]*>/g, '') || '';
                        }
                    } catch (error) {
                        console.warn(`Tafsir not found for ayah ${verse_key}`);
                    }

                    return {
                        id: verse_key,
                        surah: surahNo,
                        numberInSurah: ayahNo,
                        number: parseInt(`${surahNo}${ayahNo.toString().padStart(3, '0')}`),
                        arabic: text,
                        translation: english?.[index] || '',
                        translation_urdu: urdu?.[index] || '',
                        audio: `https://the-quran-project.github.io/Quran-Audio/Data/2/${surahNo}_${ayahNo}.mp3`,
                        tafsir,
                        verse_key,
                        theme: ayahThemes[verse_key] || null
                    };
                });

                const ayahs = await Promise.all(ayahPromises);
                allAyahs.push(...ayahs.filter(Boolean)); // keep only matched
            }

            return allAyahs;
        } catch (err) {
            console.error('Theme fetch error:', err);
            return rejectWithValue(err.message || 'Failed to fetch ayahs by verse keys');
        }
    }
);

const ayahSlice = createSlice({
    name: 'ayah',
    initialState: {
        ayahs: [],
        loading: false,
        error: null
    },
    reducers: {
        clearAyahs(state) {
            state.ayahs = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchAyahsBySurah.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAyahsBySurah.fulfilled, (state, action) => {
                state.loading = false;
                state.ayahs = action.payload;
            })
            .addCase(fetchAyahsBySurah.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAyahsByVerseKeys.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAyahsByVerseKeys.fulfilled, (state, action) => {
                state.loading = false;
                state.ayahs = action.payload;
            })
            .addCase(fetchAyahsByVerseKeys.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAyahs } = ayahSlice.actions;
export default ayahSlice.reducer;
