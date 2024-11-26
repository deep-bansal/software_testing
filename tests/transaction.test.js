const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;

const app = require("../app"); // Your Express app
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");

chai.use(chaiHttp);

describe("Transaction Controller", () => {
	let token, userId, managerToken, bookId;

	beforeEach(async () => {
		// Mock a user and login to get a token
		const user = await User.create({
			name: "Test User",
			email: "test@example.com",
			password: "password",
			role: "normal",
		});
		userId = user._id;

		// Login the user and get the token
		const userLoginRes = await chai
			.request(app)
			.post("/api/v1/users/login") // Replace with your actual login route
			.send({ email: "test@example.com", password: "password" });

		token = `Bearer ${userLoginRes.body.token}`; // Extract token from response

		const manager = await User.create({
			name: "Test Manager",
			email: "testmanager@example.com",
			password: "password",
			role: "manager",
		});

		const managerLoginRes = await chai
			.request(app)
			.post("/api/v1/users/login")
			.send({ email: "testmanager@example.com", password: "password" });

		managerToken = `Bearer ${managerLoginRes.body.token}`; // Extract token from response

		const book = await Book.create({
			title: "Sample Book",
			author: "Author",
			quantity: 5,
		});
		bookId = book._id;
	});

	afterEach(async () => {
		// Clean up database
		await User.deleteMany();
		await Book.deleteMany();
		await Transaction.deleteMany();
	});

	describe("POST /transactions/borrow", () => {
		it("should allow a user to borrow a book if stock is available", async () => {
			const res = await chai
				.request(app)
				.post("/api/v1/transactions/borrow")
				.set("Authorization", token)
				.send({ bookId, quantity: 1 });

			expect(res).to.have.status(201);
			expect(res.body.message).to.equal("Transaction created successfully");
			expect(res.body.transaction).to.have.property("type", "borrow");
		});

		it("should return an error if the book does not exist", async () => {
			const res = await chai
				.request(app)
				.get("/api/v1/books/64cfc9302a0b0b3e60000abc")
				.set("Authorization", token)
				

			expect(res).to.have.status(404);
			expect(res.body.error).to.equal("Book not found");
		});

	});

	describe("POST /transactions/return", () => {
		let transactionId;

		beforeEach(async () => {
			const transaction = await Transaction.create({
				userId,
				bookId,
				quantity: 1,
				type: "borrow",
				status: "active",
			});
			transactionId = transaction._id;
		});

		it("should allow a user to return a borrowed book", async () => {
			const res = await chai
				.request(app)
				.post("/api/v1/transactions/return")
				.set("Authorization", token)
				.send({ transactionId });

			expect(res).to.have.status(200);
			expect(res.body.message).to.equal("Transaction returned successfully");
		});

		it("should return an error if the transaction is already returned", async () => {
			await Transaction.findByIdAndUpdate(transactionId, {
				status: "returned",
			});

			const res = await chai
				.request(app)
				.post("/api/v1/transactions/return")
				.set("Authorization", token)
				.send({ transactionId });

			expect(res).to.have.status(400);
			expect(res.body.error).to.equal("Book already returned");
		});

		it("should return an error if the user is not authorized to return the book", async () => {
			const res = await chai
				.request(app)
				.post("/api/v1/transactions/return")
				.set("Authorization", managerToken)
				.send({ transactionId });

			expect(res).to.have.status(403);
			expect(res.body.error).to.equal(
				"You are not authorized to return this book"
			);
		});
	});

	describe("GET /transactions", () => {
		it("should return all transactions for the logged-in user", async () => {
			await Transaction.create({
				userId,
				bookId,
				quantity: 1,
				type: "borrow",
				status: "active",
			});

			const res = await chai
				.request(app)
				.get("/api/v1/transactions")
				.set("Authorization", token);

			expect(res).to.have.status(200);
			expect(res.body).to.be.an("array").that.has.length(1);
		});
	});

	describe("GET /transactions/:id", () => {
		let transactionId;

		beforeEach(async () => {
			const transaction = await Transaction.create({
				userId,
				bookId,
				quantity: 1,
				type: "borrow",
				status: "active",
			});
			transactionId = transaction._id;
		});

		it("should allow a user to fetch their own transaction by ID", async () => {
			const res = await chai
				.request(app)
				.get(`/api/v1/transactions/${transactionId}`)
				.set("Authorization", token);

			expect(res).to.have.status(200);
			expect(res.body.transaction).to.have.property(
				"_id",
				transactionId.toString()
			);
		});

		it("should allow a manager to fetch any transaction by ID", async () => {
			const res = await chai
				.request(app)
				.get(`/api/v1/transactions/${transactionId}`)
				.set("Authorization", managerToken);

			expect(res).to.have.status(200);
			expect(res.body.transaction).to.have.property(
				"_id",
				transactionId.toString()
			);
		});

		it("should return an error if a user tries to fetch a transaction they do not own", async () => {
			const anotherUser = await User.create({
				name: "Another User",
				email: "another@example.com",
				password: "password",
				role: "normal",
			});

			const userLoginRes = await chai
			.request(app)
			.post("/api/v1/users/login") // Replace with your actual login route
			.send({ email: "another@example.com", password: "password" });

			const anotherToken = `Bearer ${userLoginRes.body.token}`; // Extract token from response
			

			const res = await chai
				.request(app)
				.get(`/api/v1/transactions/${transactionId}`)
				.set("Authorization", anotherToken);

			expect(res).to.have.status(403);
			expect(res.body.error).to.equal("Access denied");
		});
	});
});
