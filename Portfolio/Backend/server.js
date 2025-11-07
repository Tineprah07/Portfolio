// Backend/server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const app = express();

// ---- setup __dirname for ES modules ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// allow your frontend (Render static or local) to call this
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ serve static files from the project root (where index.html, style.css are)
app.use(express.static(path.join(__dirname, "..")));  // <-- important

// root route -> send your real index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// contact route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,       // e.g. smtp.gmail.com
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,     // your email
        pass: process.env.MAIL_PASS      // your app password
      }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
      to: "gyamprahaugustine07@gmail.com", // you
      subject: subject ? `Portfolio: ${subject}` : "New message from portfolio",
      html: `
        <h2>New message from portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    res.json({ success: true, message: "Message sent ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// fallback — if someone goes to /projects etc, send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
