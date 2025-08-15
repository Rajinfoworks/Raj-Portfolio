// =========================
// Portfolio Site Server.js
// =========================

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------
// Middleware
// -------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static assets from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// Static Pages & SEO Files
// -------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "sitemap.xml"));
});

// -------------------------
// Email Setup
// -------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ SMTP server ready to send emails");
  }
});

// -------------------------
// Contact Form API
// -------------------------
app.post("/send-mail", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "⚠️ All fields are required." });
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_RECEIVER,
      replyTo: email,
      subject: `📩 New Contact Form Submission: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    res.json({ success: true, message: "✅ Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email error:", error.message);
    res.status(500).json({ success: false, message: "⚠️ Could not send message. Please try again later." });
  }
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
