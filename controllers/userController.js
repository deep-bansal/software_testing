const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();
		res.status(201).json(user);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(400).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user._id }, "secret-key", {
			expiresIn: "1h",
		});
		res.status(200).json({ token });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
