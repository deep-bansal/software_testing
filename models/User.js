const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ["normal", "manager"], default: "normal" },
	borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

module.exports = mongoose.model("User", userSchema);
