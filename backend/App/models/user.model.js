const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,  // only for signup
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
});

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if password is modified

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;

