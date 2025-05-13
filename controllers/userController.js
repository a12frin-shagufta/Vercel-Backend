import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";

// Utility - Token Create
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// In-memory OTP store
const otpStore = new Map();

// Send OTP Email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your AFANDAL Login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Login Code</h2>
        <p>Here's your OTP to login to AFANDAL:</p>
        <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 15px; 
            background: #f5f5f5; display: inline-block; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  });
};

// Request OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false
    });

    // Save OTP (valid for 10 minutes)
    otpStore.set(email, { 
      otp, 
      expiresAt: Date.now() + 600000 
    });

    // Find or create user
    let user = await userModel.findOne({ email });
    if (!user) {
      user = new userModel({ email });
      await user.save();
    }

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ 
      success: true, 
      message: "OTP sent successfully" 
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    // Check if OTP exists
    if (!otpStore.has(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP not requested or expired" 
      });
    }

    const storedOtp = otpStore.get(email);

    // Check if OTP matches
    if (storedOtp.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: "OTP expired" 
      });
    }

    // Clean up OTP
    otpStore.delete(email);

    // Get user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Create token
    const token = createToken(user._id);

    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify OTP" 
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid admin credentials" 
      });
    }

    const token = jwt.sign(
      { email, isAdmin: true }, 
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      success: true, 
      token,
      isAdmin: true
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Admin login failed" 
    });
  }
};

export { sendOtp, verifyOtp, adminLogin };
