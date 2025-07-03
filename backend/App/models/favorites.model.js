// models/Favorite.js
const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    ayah: {
        id: { type: String, required: true },           // unique identifier (like `2:255`)
        verse_key: { type: String, required: true },    // example: "2:255"
        surah: { type: Number, required: true },
        numberInSurah: { type: Number, required: true },
        arabic: { type: String },
        translation: { type: String },
        translation_urdu: { type: String },
        theme: { type: String },
        tafsir: { type: String }
    },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
