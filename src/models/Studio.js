// src/models/Studio.js
const mongoose = require('mongoose');

const studioSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Studio', studioSchema);