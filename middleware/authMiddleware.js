const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");
	if (!token) return res.status(401).json({ error: "Authentication required" });

	try {
		const decoded = jwt.verify(token, "secret-key");
		const user = await User.findById(decoded.id);
		if (!user) return res.status(401).json({ error: "User not found" });

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid token" });
	}
};

exports.authorize = (roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ error: "Access denied" });
		}
		next();
	};
};
