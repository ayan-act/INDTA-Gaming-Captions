import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import "dotenv/config";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Key Rotation Logic
  const keys = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
    process.env.GEMINI_KEY_5,
  ].filter(Boolean) as string[];

  // Always include the platform-provided key as a guaranteed fallback
  if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  console.log(`Loaded ${keys.length} API keys for rotation.`);
  console.log(`System GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);

  let currentKeyIndex = 0;

  app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (keys.length === 0) {
      return res.status(500).json({ error: "No API keys configured" });
    }

    let attempts = 0;
    while (attempts < keys.length) {
      const activeKey = keys[currentKeyIndex];
      const ai = new GoogleGenAI({ apiKey: activeKey });

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text || "{}";
        return res.json(JSON.parse(responseText));
      } catch (error: any) {
        console.error(`Attempt with key ${currentKeyIndex + 1} failed:`, error.message);
        
        const errorMessage = error.message?.toLowerCase() || "";
        const isQuotaError = error.status === 429 || errorMessage.includes("429") || errorMessage.includes("quota");
        const isInvalidKeyError = error.status === 400 || error.status === 401 || errorMessage.includes("api key not valid") || errorMessage.includes("invalid_argument");

        if (isQuotaError || isInvalidKeyError) {
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          attempts++;
          console.log(`Rotating to key ${currentKeyIndex + 1}...`);
        } else {
          return res.status(500).json({ error: error.message || "Failed to generate content" });
        }
      }
    }

    res.status(429).json({ error: "All API keys have been exhausted or are invalid. Please check your configuration." });
  });

  // Contact Form Endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP is not configured. Email will not be sent.");
      // For development/demo purposes, we'll log it and return success if not configured
      // but in production this should be a 500.
      console.log("Contact Form Submission:", { name, email, message });
      return res.json({ success: true, message: "Message received (Development Mode: SMTP not configured)" });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: process.env.CONTACT_EMAIL || "contact@indtanews.com",
        subject: `New Gaming Caption Generator Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #FF4E00;">New Contact Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      });

      res.json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Email sending failed:", error);
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
