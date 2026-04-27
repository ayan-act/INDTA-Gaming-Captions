export default async function handler(req, res) {

  // ✅ CORS headers (VERY IMPORTANT)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const keys = [
      process.env.GEMINI_KEY_1,
      process.env.GEMINI_KEY_2,
      process.env.GEMINI_KEY_3,
      process.env.GEMINI_KEY_4,
      process.env.GEMINI_KEY_5,
      process.env.GEMINI_API_KEY,
    ].filter(Boolean);

    if (keys.length === 0) {
      return res.status(500).json({ error: "No API keys configured" });
    }

    let lastError = null;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
              }
            }),
          }
        );

        if (response.status === 429) {
          lastError = "Rate limit (429)";
          continue;
        }

        const data = await response.json();

        if (!response.ok) {
          lastError = data.error?.message || `API Error ${response.status}`;
          continue;
        }

        const responseText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        let cleanText = responseText.trim();

        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/```json|```/g, "").trim();
        }

        const first = cleanText.indexOf("{");
        const last = cleanText.lastIndexOf("}");

        if (first !== -1 && last !== -1) {
          cleanText = cleanText.substring(first, last + 1);
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanText);
        } catch {
          parsed = {
            shortCaptions: ["⚡ Try again"],
            longCaption: cleanText,
            hashtags: "#gaming #viral"
          };
        }

        return res.status(200).json({ result: parsed });

      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    // ❗ fallback instead of 500
    return res.status(200).json({
      result: {
        shortCaptions: ["⚡ Server busy"],
        longCaption: "Try again in a moment.",
        hashtags: "#gaming #retry"
      }
    });

  } catch (err) {
    return res.status(200).json({
      result: {
        shortCaptions: ["⚡ Error"],
        longCaption: err.message,
        hashtags: "#error"
      }
    });
  }
}