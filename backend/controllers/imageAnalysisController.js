const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

async function analyzeImage(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const imageData = {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      };

      const prompt = req.body.question || "Describe this image";
      const result = await model.generateContent([prompt, imageData]);
      const text = result.response.text();

      res.json({
        success: true,
        analysis: text
      });

    } catch (error) {
      console.error('Analysis Error:', error.message);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });
}

module.exports = { analyzeImage };