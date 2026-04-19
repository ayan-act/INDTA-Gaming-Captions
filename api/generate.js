
export default async function handler(req, res) {
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
      process.env.GEMINI_KEY_6,
      process.env.GEMINI_KEY_7,
      process.env.GEMINI_KEY_8,
      process.env.GEMINI_KEY_9,
      process.env.GEMINI_KEY_10,
      process.env.GEMINI_KEY_11,
      process.env.GEMINI_KEY_12,
      process.env.GEMINI_KEY_13,
      process.env.GEMINI_KEY_14,
      process.env.GEMINI_KEY_15,
      process.env.GEMINI_API_KEY, // system fallback
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
          console.log(`Key ${i+1} rate limited, rotating...`);
          lastError = "Rate limit hit (429)";
          continue;
        }

        const data = await response.json();

        if (!response.ok) {
          console.error(`Key ${i+1} failed with status ${response.status}:`, data);
          lastError = data.error?.message || `API Error ${response.status}`;
          continue;
        }

        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        // Robust JSON cleaning to handle AI conversational filler or markdown
        let cleanText = responseText.trim();
        if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
        if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);
        cleanText = cleanText.trim();

        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanText);
        } catch (e) {
          // If it's not JSON despite our efforts, return raw text or empty results
          console.warn("Could not parse JSON from AI response:", cleanText);
          parsed = { error: "Malformed JSON response from AI", raw: cleanText };
        }

        return res.status(200).json({ result: parsed });

      } catch (err) {
        console.error(`Attempt with key ${i+1} failed:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    return res.status(500).json({
      error: "All API keys failed or were rate-limited.",
      details: lastError,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
