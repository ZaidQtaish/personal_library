const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: { type: [String], default: [] },
});

module.exports = mongoose.model('Book', bookSchema);