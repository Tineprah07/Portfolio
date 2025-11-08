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

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // ---- Gmail-specific secure config ----
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,     // smtp.gmail.com
      port: Number(process.env.MAIL_PORT), // 465
      secure: true,                    // always true for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Verify connection before sending (optional but helpful)
    await transporter.verify();

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: "gyamprahaugustine07@gmail.com", // your inbox
      subject: subject
        ? `Portfolio: ${subject}`
        : "New message from portfolio",
      html: `
        <h2>New message from portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("✅ Email sent successfully");
    return res.json({ success: true, message: "Message sent ✅" });
  } catch (err) {
    console.error("Mail error:", err);
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
