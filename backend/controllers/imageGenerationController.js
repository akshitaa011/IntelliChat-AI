const axios = require('axios');

async function generateImage(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.HUGGINGFACE_TOKEN) {
      return res.status(500).json({ error: 'API not configured' });
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    const base64 = Buffer.from(response.data).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    res.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt
    });

  } catch (error) {
    console.error('Generation Error:', error.message);
    
    if (error.response?.status === 503) {
      return res.status(503).json({ 
        error: 'Model is loading. Please wait 20 seconds and try again.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to generate image' });
  }
}

module.exports = { generateImage };