const fetch = require('node-fetch');

const generateImage = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;

    console.log('Generating image via Pollinations...');

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      return res.status(500).json({ error: 'Image generation failed.' });
    }

    const buffer = await response.buffer();
    res.set('Content-Type', 'image/jpeg');
    return res.send(buffer);

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generateImage };