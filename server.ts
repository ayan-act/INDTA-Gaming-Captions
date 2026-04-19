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
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    if (keys.length === 0) {
      return res.status(500).json({ error: "No API keys configured" });
    }

    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    let attempts = 0;
    while (attempts < keys.length) {
      const activeKey = keys[currentKeyIndex];

      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + activeKey,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              }
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error?.message?.toLowerCase() || "";
          const isQuotaError = response.status === 429 || errorMessage.includes("quota");
          const isInvalidKeyError = response.status === 400 || response.status === 401 || errorMessage.includes("api key not valid");

          if (isQuotaError || isInvalidKeyError) {
            currentKeyIndex = (currentKeyIndex + 1) % keys.length;
            attempts++;
            console.log(`Rotating to key ${currentKeyIndex + 1}...`);
            continue;
          }
          throw new Error(data.error?.message || "Failed to call AI API");
        }

        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        // Sanitizing the response for JSON compatibility
        let cleanText = responseText.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.substring(7);
        }
        if (cleanText.endsWith("```")) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        // We parse it here to ensure the frontend gets an object
        const parsedContent = JSON.parse(cleanText);

        return res.status(200).json({ result: parsedContent });

      } catch (err: any) {
        console.error(`Attempt with key ${currentKeyIndex + 1} failed:`, err.message);
        
        // Standardize retry logic for fetch errors
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;
        if (attempts >= keys.length) {
          return res.status(500).json({ error: err.message || "All attempts failed" });
        }
      }
    }

    return res.status(429).json({ error: "All configured API keys have been exhausted." });
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
