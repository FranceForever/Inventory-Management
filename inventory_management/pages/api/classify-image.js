import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { imageUrl } = req.body;

    try {
      const [result] = await client.labelDetection(imageUrl);
      const labels = result.labelAnnotations.map(label => label.description);

      res.status(200).json({ labels });
    } catch (error) {
      console.error('Error classifying image:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}