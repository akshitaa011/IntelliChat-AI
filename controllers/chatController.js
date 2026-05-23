const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const sessionHistory = {};

const handleChat = async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  const id = sessionId || "default";

  if (!sessionHistory[id]) {
    sessionHistory[id] = [];
  }

  // Save user message
  sessionHistory[id].push({
    role: "user",
    content: message,
  });

  try {

    console.log("API KEY:", process.env.OPENROUTER_API_KEY);

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
        messages: sessionHistory[id],
      }),
    });

    const data = await response.json();

    console.log("OpenRouter Response:", data);

    const reply =
      data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: data.error?.message || "No response from AI",
      });
    }

    // Save AI response
    sessionHistory[id].push({
      role: "assistant",
      content: reply,
    });

    res.json({ reply });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = { handleChat };