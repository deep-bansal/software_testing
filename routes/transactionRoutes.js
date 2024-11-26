const express = require("express");
const router = express.Router();
const {
	borrowBook,
	returnBook,
	getTransactionById,
	getUserTransactions,
} = require("../controllers/transactionController");
const {authenticate} = require("../middleware/authMiddleware"); // Your authentication middleware

// Borrow a book
router.post("/borrow", authenticate, borrowBook);

// Return a borrowed book
router.post("/return", authenticate, returnBook);

// Get all user transactions
router.get("/", authenticate, getUserTransactions);

// Get a specific transaction
router.get("/:id", authenticate, getTransactionById);

module.exports = router;
