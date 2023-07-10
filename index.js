
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const dbName=forgetPassword;


mongoose.connect('mongodb+srv://root:123@cluster0.70nqoe4.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Defined user schema
const userSchema = new mongoose.Schema({
  name: {type: String},
  mobile: {type: String},
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String, default: null },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Endpoint for user sign-up
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Checking the user already exists or not
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
  
      // Create new user object
      const newUser = new User({
        email,
        password,
      });
  
      // Save new user to the database
      await newUser.save();
  
      res.json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

// Endpoint for user sign-in
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user in the database
      const user = await User.findOne({ email });
  
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      res.json({ message: 'Sign in successful' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
//   const resetTokensDB = {};
//   const usersDB = [];
// POST request for handle forget password form submission
app.post('/forget-password', async(req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.send('User not found');
            return;
        }

        const token = crypto.randomBytes(10).toString('hex');
        user.resetToken = token;
        await user.save();

        console.log('Reset Token:', token + user);

        // res.send('Reset token generated successfully',token);
        res.send('Reset token generated successfully, your Reset Token is:' + token);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

 // POST request for password reset
app.post('/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
      const user = await User.findOne({ email, resetToken: token });
      console.log(user);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found or invalid token' });
      }
  
      // Update the user's password
      user.password = newPassword;
      user.resetToken = null;
      await user.save();
  
      res.send('Password reset successfully',);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
