const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const stream = require('stream');  // Import the stream module to handle streams
require("dotenv").config();

const pollyClient = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateSpeech(text) {
  const params = {
    OutputFormat: "mp3",  
    Text: text, 
    VoiceId: "Brian",   
  
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const data = await pollyClient.send(command);

    // Convert the AudioStream buffer to Base64
    const audioStream = data.AudioStream;

    // Create a new buffer to hold the audio data
    const buffers = [];

    // Return a Promise to handle the stream and ensure async handling
    return new Promise((resolve, reject) => {
      // Create a stream to consume the AudioStream
      const readableStream = new stream.PassThrough();
      audioStream.pipe(readableStream);

      readableStream.on('data', chunk => {
        buffers.push(chunk);
      });

      readableStream.on('end', () => {
        // Combine the chunks into a single Buffer
        const fullAudioBuffer = Buffer.concat(buffers);
        
        // Convert the Buffer to Base64
        const audioData = fullAudioBuffer.toString('base64');
        

        resolve(audioData);  // Resolve with the Base64-encoded audio
      });

      readableStream.on('error', err => {
        console.error("Stream error:", err);
        reject(err);  // Reject the promise if an error occurs
      });
    });

  } catch (err) {
    console.error("Error generating speech:", err);
    throw err;  // Rethrow the error to handle it in the calling code
  }
}

module.exports = { generateSpeech };
