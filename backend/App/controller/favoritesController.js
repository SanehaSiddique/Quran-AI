const Favorite = require('../models/favorites.model');

const addFavorite = async (req, res) => {
    try {
        const { ayah } = req.body;
        const userId = req.user.id;

        const exists = await Favorite.findOne({ userId, 'ayah.id': ayah.id });
        if (exists) return res.status(200).json({ message: 'Already in favorites' });

        const newFav = await Favorite.create({ userId, ayah });
        res.status(201).json(newFav);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFavoritesByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const favs = await Favorite.find({ userId });
        res.status(200).json(favs.map(f => f.ayah));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { ayahId } = req.body;
        const userId = req.user.id;
        await Favorite.deleteOne({ userId, 'ayah.id': ayahId });
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addFavorite,
    getFavoritesByUser,
    removeFavorite
};