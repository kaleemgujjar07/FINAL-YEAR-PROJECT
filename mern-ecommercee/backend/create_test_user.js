const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const User = require('../models/User');
const { connectToDB } = require('../database/db');

const createTestUser = async () => {
    try {
        await connectToDB();
        const email = 'testuser@gmail.com';
        const password = 'password123';
        
        // Delete existing if any
        await User.deleteOne({ email });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: 'Test User',
            email,
            password: hashedPassword,
            isVerified: true,
            isAdmin: true
        });
        
        await user.save();
        console.log('Test user created: email: testuser@gmail.com, password: password123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createTestUser();
