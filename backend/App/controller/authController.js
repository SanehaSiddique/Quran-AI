const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Signup Body:", req.body);
    
    // Validate input
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long."
        });
    }
    else {
        console.log('Password is valid');
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email already in use" });

        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.status(201).json({
            message: "Signup successful",
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { signup, login };