// Backend/server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

// 1) create the app FIRST
const app = express();

// 2) ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3) middlewares
app.use(
  cors({
    origin: "*", // later: put your real domain here
  })
);
app.use(express.json());

// 4) serve static files from project root (.. = up from Backend/)
app.use(express.static(path.join(__dirname, "..")));

// 5) root → serve portfolio
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// 6) contact route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    // make sure envs exist (this will tell us if Render didn't load them)
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return res.status(500).json({
        error: "Email not configured on server.",
        detail: "Missing MAIL_USER or MAIL_PASS on Render",
      });
    }

    // gmail transporter - simpler, good for Render
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: "gyamprahaugustine07@gmail.com",
      subject: subject ? `Portfolio: ${subject}` : "New message from portfolio",
      html: `
        <h2>New message from portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.json({ success: true, message: "Message sent ✅" });
  } catch (err) {
    console.error("Mail error on Render:", err);
    return res.status(500).json({
      error: "Failed to send message",
      detail: err.message,
    });
  }
});

// 7) fallback for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// 8) start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
