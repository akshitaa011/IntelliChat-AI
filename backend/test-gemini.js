require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

async function test() {
  const url =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
    API_KEY;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: "Say hello in one sentence" }]
        }
      ]
    })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
