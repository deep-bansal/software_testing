const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");
const mongoose = require("mongoose");

// Borrow a book
exports.borrowBook = async (req, res) => {
	try {
		const { bookId, quantity } = req.body;
		const userId = req.user._id;

		// Check if the book exists
		const book = await Book.findById(new mongoose.Types.ObjectId(bookId));
		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		// Check if enough quantity is available
		if (book.quantity < quantity) {
			return res.status(400).json({ error: "Not enough stock available" });
		}

		// Create a new transaction for borrowing
		const transaction = new Transaction({
			userId,
			bookId,
			quantity,
			type: "borrow",
			status: "active", // Active means the book is borrowed
		});

		// Save the transaction
		await transaction.save();

		// Reduce the book quantity in the inventory
		book.quantity -= quantity;
		await book.save();

		res.status(201).json({
			message: "Transaction created successfully",
			transaction,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};

// Return a borrowed book
exports.returnBook = async (req, res) => {
	try {
		const { transactionId } = req.body;
		const userId = req.user._id;

		// Find the transaction
		const transaction = await Transaction.findById(transactionId);
		if (!transaction) {
			return res.status(404).json({ error: "Transaction not found" });
		}

		// Check if the transaction is already returned
		if (transaction.status === "returned") {
			return res.status(400).json({ error: "Book already returned" });
		}

		// Check if the user is the one who borrowed the book
		if (transaction.userId.toString() !== userId.toString()) {
			return res
				.status(403)
				.json({ error: "You are not authorized to return this book" });
		}

		// Mark the transaction as returned
		transaction.status = "returned";
		transaction.type = "return";
		await transaction.save();

		// Update the book's quantity
		const book = await Book.findById(transaction.bookId);
		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		book.quantity += transaction.quantity;
		await book.save();

		res.status(200).json({
			message: "Transaction returned successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};

// Get all transactions of the logged-in user
exports.getUserTransactions = async (req, res) => {
	try {
		const userId = req.user._id;

		// Find all transactions of the user
		const transactions = await Transaction.find({ userId });

		res.status(200).json(transactions);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};

// Get a specific transaction
exports.getTransactionById = async (req, res) => {
	try {
		const { id } = req.params;

		// Find the transaction by ID
		const transaction = await Transaction.findById(id);
		if (!transaction) {
			return res.status(404).json({ error: "Transaction not found" });
		}

		// transaction can be seen by manager and user who made the transaction
		if (
			req.user.role !== "manager" &&
			transaction.userId.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({ error: "Access denied" });
		}

		res.status(200).json({ transaction });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};
