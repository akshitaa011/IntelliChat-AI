const fetch = require('node-fetch');

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const analyzeImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const image = req.files.image;
  const prompt = req.body.prompt || "Describe this image in detail.";
  const base64 = image.data.toString("base64");

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "IntelliChat",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.mimetype};base64,${base64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: data.error?.message || "Image analysis failed" });
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { analyzeImage };