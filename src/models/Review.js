// src/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating:  { type: Number, required: true, min: 1, max: 10 },
  comment: { type: String, required: true },
  game:    { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);