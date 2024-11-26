const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const Book = require("../models/Book");
const User = require("../models/User");

chai.use(chaiHttp);
const { expect } = chai;

let managerToken;

describe("Book API Tests", () => {
	before(async () => {
		// Clear existing data
		await Book.deleteMany({});
		await User.deleteMany({});

		// Create a manager user for authentication
		const manager = new User({
			name: "Manager User",
			email: "manager@example.com",
			password: "password123",
			role: "manager",
		});
		await manager.save();

		// Login the manager to get a token
		const res = await chai
			.request(app)
			.post("/api/v1/users/login")
			.send({ email: "manager@example.com", password: "password123" });

		managerToken = res.body.token;
	});

	describe("GET /api/v1/books", () => {
		it("should retrieve all books (public endpoint)", (done) => {
			chai
				.request(app)
				.get("/api/v1/books")
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an("array");
					done();
				});
		});
	});

	describe("POST /api/v1/books", () => {
		it("should allow a manager to add a book", (done) => {
			chai
				.request(app)
				.post("/api/v1/books")
				.set("Authorization", `Bearer ${managerToken}`)
				.send({
					title: "The Great Gatsby",
					author: "F. Scott Fitzgerald",
					quantity: 5,
				})
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.have.property("title", "The Great Gatsby");
					done();
				});
		});

		it("should not allow adding a book without authorization", (done) => {
			chai
				.request(app)
				.post("/api/v1/books")
				.send({
					title: "Moby Dick",
					author: "Herman Melville",
					quantity: 3,
				})
				.end((err, res) => {
					expect(res).to.have.status(401);
					expect(res.body).to.have.property("error");
					done();
				});
		});
	});

	describe("PUT /api/v1/books/:id", () => {
		let bookId;

		before(async () => {
			// Create a book to test editing
			const book = new Book({
				title: "Edit Me",
				author: "Author Test",
				quantity: 5,
			});
			await book.save();
			bookId = book._id;
		});

		it("should allow a manager to edit a book", (done) => {
			chai
				.request(app)
				.put(`/api/v1/books/${bookId}`)
				.set("Authorization", `Bearer ${managerToken}`)
				.send({
					title: "Edited Title",
					author: "Edited Author",
					quantity: 10,
				})
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.body).to.have.property("title", "Edited Title");
					expect(res.body).to.have.property("author", "Edited Author");
					expect(res.body).to.have.property("quantity", 10);
					done();
				});
		});

		it("should not allow editing a book without authorization", (done) => {
			chai
				.request(app)
				.put(`/api/v1/books/${bookId}`)
				.send({ title: "Unauthorized Edit" })
				.end((err, res) => {
					expect(res).to.have.status(401);
					expect(res.body).to.have.property("error");
					done();
				});
		});

		it("should return 404 for editing a non-existent book", (done) => {
			const nonExistentBookId = new mongoose.Types.ObjectId(
				"64cfc9302a0b0b3e60000abc"
			);
			chai
				.request(app)
				.put(`/api/v1/books/${nonExistentBookId}`)
				.set("Authorization", `Bearer ${managerToken}`)
				.send({ title: "Non-Existent Book" })
				.end((err, res) => {
					expect(res).to.have.status(404);
					expect(res.body).to.have.property("error", "Book not found");
					done();
				});
		});
	});

	describe("DELETE /api/v1/books/:id", () => {
		let bookId;

		before(async () => {
			// Create a book to test deleting
			const book = new Book({
				title: "Delete Me",
				author: "Author Test",
				quantity: 5,
			});
			await book.save();
			bookId = book._id;
		});

		it("should allow a manager to delete a book", (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${bookId}`)
				.set("Authorization", `Bearer ${managerToken}`)
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.body).to.have.property(
						"message",
						"Book deleted successfully"
					);
					done();
				});
		});

		it("should not allow deleting a book without authorization", (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${bookId}`)
				.end((err, res) => {
					expect(res).to.have.status(401);
					expect(res.body).to.have.property("error");
					done();
				});
		});

		it("should return 404 for deleting a non-existent book", (done) => {
			const nonExistentBookId = new mongoose.Types.ObjectId(
				"64cfc9302a0b0b3e60000abc"
			);
			chai
				.request(app)
				.delete(`/api/v1/books/${nonExistentBookId}`)
				.set("Authorization", `Bearer ${managerToken}`)
				.end((err, res) => {
					expect(res).to.have.status(404);
					expect(res.body).to.have.property("error", "Book not found");
					done();
				});
		});
	});
});
