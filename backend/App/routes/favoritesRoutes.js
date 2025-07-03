const express = require('express');
const verifyToken = require('../../Config/verifyToken');

const router = express.Router();
const {
  addFavorite,
  getFavoritesByUser,
  removeFavorite
} = require('../controller/favoritesController');

router.post('/add-favorite', verifyToken, addFavorite);
router.get('/get-favorite/:userId', verifyToken,  getFavoritesByUser);
router.delete('/remove-favorite', verifyToken, removeFavorite);

module.exports = router;