// This is a Node.js module intended for a serverless environment (e.g., Vercel, Netlify).
// It requires the '@google-cloud/text-to-speech' package to be installed.
//
// In your deployment environment (e.g., Vercel dashboard), you must set up 
// the necessary Google Cloud environment variables for authentication.
// Typically, this involves setting GOOGLE_APPLICATION_CREDENTIALS to the
// content of the JSON key file you downloaded from your GCP service account.

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the client. The library will automatically find the credentials
// set in the environment variables.
const client = new TextToSpeechClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { text } = JSON.parse(req.body);

    if (!text) {
      return res.status(400).json({ error: 'Text is required in the request body.' });
    }

    // Construct the request to the Google Cloud Text-to-Speech API
    const request = {
      input: { text: text },
      // This is a premium WaveNet voice. You can browse the Google Cloud docs for others.
      // 'en-US-Studio-O' is another excellent, calm female voice.
      voice: { languageCode: 'en-US', name: 'en-US-Studio-M' }, 
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.05 // Slightly faster than normal for a more urgent feel
      },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    
    // Send the audio back to the frontend as a base64 string
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      audioContent: response.audioContent.toString('base64') 
    });

  } catch (error) {
    console.error('Error in Google TTS service:', error);
    res.status(500).json({ error: 'Failed to synthesize speech.' });
  }
}
