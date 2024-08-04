import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);  // Add this line to log the API key

  if (req.method === 'POST') {
    const { pantryItems } = req.body;

    try {
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Suggest 5 unique recipes under 5000 tokens each time using the following pantry items: ${pantryItems.join(', ')}` }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 5000,
      });

      const recipe = response.choices[0].message.content.trim();

      res.status(200).json({ recipe });
    } catch (error) {
      console.error('Error suggesting recipe:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}