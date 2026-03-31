// src/models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  year:    { type: Number, required: true },
  studio:  { type: mongoose.Schema.Types.ObjectId, ref: 'Studio', required: true },
  genres:  [{ type: String }],
  imageUrl:{ type: String },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);