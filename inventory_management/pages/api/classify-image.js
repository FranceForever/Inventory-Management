// pages/api/classify-image.js

import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { imageUrl } = req.body;

    try {
      if (!imageUrl) {
        throw new Error('Image URL is missing');
      }
      console.log('Classifying image:', imageUrl); // Log the image URL
      const [result] = await client.labelDetection(imageUrl);
      console.log('Vision API result:', result); // Log the Vision API result
      const labels = result.labelAnnotations ? result.labelAnnotations.map(label => label.description) : [];
      res.status(200).json({ labels });
    } catch (error) {
      console.error('Error classifying image:', error); // Log the full error
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
