const { GoogleGenerativeAI } = require('@google/generative-ai');

const ANALYSIS_PROMPT = `You are a food recognition and nutrition estimation expert. Analyze the food in this image and respond ONLY with valid JSON in this exact format:
{
  "foodName": "specific food name (e.g., Chicken Biryani, Caesar Salad)",
  "calories": 350,
  "protein": 28,
  "carbs": 35,
  "fat": 12,
  "confidence": 0.85,
  "description": "brief description of the food and its components"
}

Rules:
- foodName must be specific and descriptive
- calories, protein, carbs, fat should be realistic estimates for a typical serving (all in grams except calories)
- confidence is a float between 0.0 and 1.0
- If no food is detected, set confidence to 0, foodName to "Unknown", and all numeric fields to 0
- Respond with ONLY the JSON object, no extra text`;

// POST /analyze-food
const analyzeFood = async (req, res) => {
  try {
    let imageBase64 = null;
    let mimeType = 'image/jpeg';

    // Support both multipart file upload and base64 JSON body
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.image) {
      const raw = req.body.image;
      if (raw.startsWith('data:')) {
        const parts = raw.split(',');
        const metaPart = parts[0]; // e.g. "data:image/jpeg;base64"
        mimeType = metaPart.split(':')[1].split(';')[0];
        imageBase64 = parts[1];
      } else {
        imageBase64 = raw;
      }
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided. Send as multipart file or base64 JSON' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.json({
        foodName: 'Sample Food (AI not configured)',
        calories: 350,
        confidence: 0.5,
        description: 'Gemini API key not configured. This is a mock response.',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const result = await model.generateContent([
      ANALYSIS_PROMPT,
      { inlineData: { mimeType, data: imageBase64 } },
    ]);

    const rawContent = result.response.text().trim();
    if (!rawContent) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    // Strip markdown code fences if present
    const jsonStr = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(502).json({ error: 'AI returned invalid JSON', raw: rawContent });
    }

    res.json({
      foodName: parsed.foodName || 'Unknown',
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      description: parsed.description || '',
    });
  } catch (err) {
    console.error('AI analysis error:', err);
    res.status(502).json({ error: `Gemini API error: ${err.message || 'Food analysis failed'}` });
  }
};

module.exports = { analyzeFood };
