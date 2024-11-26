const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const db = "mongodb://localhost:27017/libmanagement";

const app = express();

app.use(express.json());
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/transactions", transactionRoutes);

const connectDB = async () => {
	try {
		await mongoose.connect(db);
		console.log("MongoDB connected...");
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
