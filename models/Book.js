const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
	title: { type: String, required: true },
	author: { type: String, required: true },
	quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("Book", bookSchema);
