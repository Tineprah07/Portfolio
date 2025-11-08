// Backend/server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const app = express();

// --- ES module dirname setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middlewares
app.use(
  cors({
    origin: "*", // later you can lock this to your portfolio URL
  })
);
app.use(express.json());

// serve static files from project root (.. = go up from Backend/)
app.use(express.static(path.join(__dirname, "..")));

// root → serve portfolio
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. basic form check
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    // 2. make sure Render actually got your envs
    if (
      !process.env.MAIL_HOST ||
      !process.env.MAIL_PORT ||
      !process.env.MAIL_USER ||
      !process.env.MAIL_PASS
    ) {
      return res.status(500).json({
        error: "Email not configured on server.",
        detail: "Missing env vars on Render",
      });
    }

    // 3. create transporter (same as before)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // ❗️important: REMOVE verify() for Render
    // await transporter.verify();

    // 4. send mail
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

    console.log("✅ Email sent successfully (Render)");
    return res.json({ success: true, message: "Message sent ✅" });
  } catch (err) {
    console.error("Mail error on Render:", err);
    return res.status(500).json({
      error: "Failed to send message",
      detail: err.message,
    });
  }
});

// fallback for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
