const vision = require('@google-cloud/vision');

async function quickstart() {
  const client = new vision.ImageAnnotatorClient();

  const [result] = await client.labelDetection('/Users/armaan/Desktop/IBM GenAI Apps/armaan_kunal_aarav.jpg');
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
}

quickstart();
