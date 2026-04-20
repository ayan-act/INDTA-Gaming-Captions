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
    let lastError = "";

    while (attempts < keys.length) {
      const activeKey = keys[currentKeyIndex];

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${activeKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        // Handle rate limit / failure
        if (!response.ok) {
          console.log(`Key ${currentKeyIndex + 1} failed: ${response.status}`);
          lastError = `Error ${response.status}`;
          
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          attempts++;
          
          // small delay before next retry
          await new Promise(r => setTimeout(r, 400));
          continue;
        }

        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Sanitizing the response for JSON compatibility
        let cleanText = responseText.trim();
        if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
        if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);

        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanText);
        } catch {
          parsed = { caption: cleanText, hashtags: ["#gaming", "#viral"] };
        }

        // ✅ SUCCESS
        return res.status(200).json({ result: parsed });

      } catch (err: any) {
        console.log(`Key ${currentKeyIndex + 1} crashed, retrying...`);
        lastError = err.message;

        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;

        // delay before next attempt
        await new Promise(r => setTimeout(r, 400));
        continue;
      }
    }

    // 🔥 FINAL FALLBACK (NO MORE 500 ERROR)
    console.error("All keys exhausted or failed. Returning fallback.");
    return res.status(200).json({
      result: {
        shortCaptions: [
          "⚡ Server busy right now, please try again in a few seconds.",
          "🔥 Generating epicness... but reaching limits. Try again soon!",
          "🎮 Leveling up our system. Re-attempting connection..."
        ],
        longCaption: "We are currently experiencing high traffic. Please wait a moment and try generating again for the best quality gaming captions.",
        hashtags: "#gaming #viral #trending #gamers #nextlevel #freefire #bgmi #pubg #highlights #clutch"
      },
      fallback: true
    });
  });

  // Contact Form Endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
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
