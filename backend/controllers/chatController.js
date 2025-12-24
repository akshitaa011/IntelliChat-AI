require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function handleChat(req, res) {
  try {
    const { message } = req.body;

    console.log("📨 Received message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    console.log("🤖 Calling Gemini API...");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ]
      })
    });

    console.log("📥 Response status:", response.status);

    const data = await response.json();
    console.log("📥 Full API response:", JSON.stringify(data, null, 2));

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

    console.log("✅ Extracted text:", text);

    
    res.json({
      success: true,
      message: text
    });

  } catch (error) {
    console.error("❌ Chat Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

module.exports = { handleChat };
