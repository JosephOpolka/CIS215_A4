const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secretKey = '!_my_#secur1ty_Key_9O210_?';

// Hash password before storing
exports.hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

// Compared provided password to hashed password
exports.verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error verifying password:', error);
        throw error;
    }
};

// Generates JWT token for session
exports.generateToken = (user) => {
    const expiresIn = '24h';
    // Session valid for 24 hours
    return jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn });
};

// Verifies the JWT token for validity
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        console.error('Error verifying token:', error);
        throw error;
    }
};