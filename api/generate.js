
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    // fallback to platform-provided GEMINI_API_KEY if KEY_1 is not set
    const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
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

    const data = await response.json();

    if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || "AI API Error" });
    }

    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean potential markdown or trailing garbage
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
        parsed = responseText; // fallback if not JSON
    }

    return res.status(200).json({ result: parsed });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
