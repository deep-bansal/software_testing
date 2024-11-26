const { default: mongoose } = require("mongoose");
const Book = require("../models/Book");

exports.getBooks = async (req, res) => {
	try {
		const books = await Book.find();
		res.status(200).json(books);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.getBookById = async (req, res) => {
	try {
		// Use mongoose.Types.ObjectId to convert the provided ID into a valid ObjectId type
		const book = await Book.findById(
			new mongoose.Types.ObjectId(req.params.id)
		);

		// If no book is found, return a 404 error
		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		// If the book is found, return it with a 200 status
		res.status(200).json(book);
	} catch (error) {
		// If there's an error, send a 400 response with the error message
		console.log(err);
		res.status(400).json({ error: error.message });
	}
};

exports.addBook = async (req, res) => {
	try {
		const book = new Book(req.body);
		await book.save();
		res.status(201).json(book);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.updateBook = async (req, res) => {
	try {
		const book = await Book.findByIdAndUpdate(
			new mongoose.Types.ObjectId(req.params.id),
			req.body,
			{
				new: true,
			}
		);
		if (!book) return res.status(404).json({ error: "Book not found" });
		res.status(200).json(book);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteBook = async (req, res) => {
	try {
		// const id = new mongoose.Types.ObjectId(req.params.id);
		const book = await Book.findByIdAndDelete(
			new mongoose.Types.ObjectId(req.params.id)
		);
		if (!book) return res.status(404).json({ error: "Book not found" });
		res.status(200).json({ message: "Book deleted successfully" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
