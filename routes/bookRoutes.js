const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
	getBooks,
	addBook,
	updateBook,
	deleteBook,
	getBookById,
} = require("../controllers/bookController");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authenticate, authorize(["manager"]), addBook);
router.put("/:id", authenticate, authorize(["manager"]), updateBook);
router.delete("/:id", authenticate, authorize(["manager"]), deleteBook);

module.exports = router;
