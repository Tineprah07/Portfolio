// Backend/server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
app.use(cors());
app.use(express.json());


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

    // basic check
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    // make sure Render actually got the envs
    if (
      !process.env.MAIL_USER ||
      !process.env.MAIL_PASS
    ) {
      return res.status(500).json({
        error: "Email not configured on server.",
        detail: "Missing MAIL_USER or MAIL_PASS on Render",
      });
    }

    // use simpler gmail config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // ❌ don't call transporter.verify() on Render

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


// fallback for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
