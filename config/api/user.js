const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// Define a function to generate a reset token
function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

// Define a function to send the reset email
async function sendResetEmail(email, token) {
  // Replace these with your actual email service settings
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail' or 'SMTP'
    auth: {
      user: 'adriansigno03@gmail.com',
      pass: 'wvpfocmqrgewgirc'
    }
  });

  // Email content
  const mailOptions = {
    from: 'adriansigno03@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Use this token to reset your password: ${token}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent:', info.response);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
}

// User sign-up route
router.post('/signup', async (req, res) => {
  let { name, email, password } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        status: "FAILED",
        message: "User with the provided email already exists"
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      
    });

    await newUser.save();

    return res.json({
      status: "SUCCESS",
      message: "User created successfully"
    });
  } catch (error) {
    return res.json({
      status: "FAILED",
      message: "An error occurred while processing the request"
    });
  }
});

// User sign-in route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        status: "FAILED",
        message: "User with the provided email not found"
      });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Create a JSON Web Token (JWT) for authentication
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        'efe3de63-f124-4e69-8095-0e316bf9f1c6', // Change this to your secret key
        { expiresIn: '1h' } // Token expiration time
      );

      return res.json({
        status: "LOGIN SUCCESSFUL",
        message: "Authentication successful",
        token: token
      });
    } else {
      return res.json({
        status: "FAILED",
        message: "Incorrect password"
      });
    }
  } catch (error) {
    return res.json({
      status: "FAILED",
      message: "An error occurred while processing the request"
    });
  } 
 

  });
 


// Step 1: User Request for Password Reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Step 2: Generate and save a reset token in the user's account
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Step 3: Send Reset Email
    await sendResetEmail(user.email, resetToken);

    return res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    console.error('Error processing password reset request:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  // Check if the token is provided
  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  try {
    console.log('Received token:', token);

    // Step 5: Reset Password Form
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    console.log('Found user:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    return res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

// Step 6: Password Update
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Step 6: Check if the token is valid and not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

module.exports = router;
