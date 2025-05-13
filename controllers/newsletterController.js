import newsletterModel from "../models/newsletterModel.js";
import nodemailer from "nodemailer";

// Validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Send confirmation email
const sendConfirmationEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER, // shagufta7572@gmail.com
      pass: process.env.MAIL_PASS, // ybnzmzjybaxvpvpb
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Welcome to Afandal Newsletter!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank You for Subscribing!</h2>
        <p>Welcome to the Afandal community! You'll get updates on new drops and exclusive offers.</p>
        <p style="font-size: 12px; color: #6b7280;">
          If you didn't subscribe, please ignore this email.
        </p>
      </div>
    `,
  });
};

// Subscribe user to newsletter
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if already subscribed
    const existing = await newsletterModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Already subscribed",
      });
    }

    // Save to DB
    await newsletterModel.create({ email: normalizedEmail });

    // Send confirmation email
    await sendConfirmationEmail(normalizedEmail);

    res.status(200).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export { subscribeNewsletter };