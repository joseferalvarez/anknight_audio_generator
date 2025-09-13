import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api"

// TODO: Crear clase con el cliente de ElevenLabs (Los voice id van a estar en la base de datos, coleccion Accents)
// TODO: Crear clase de mongoose de accents y de audios
// TODO: Crear interfaces de accents y audios con zod
export const generateAudio = async (text: string): Promise<ReadableStream> => {
  try {
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_KEY });
    const outputFormat = TextToSpeechConvertRequestOutputFormat.Mp344100128;

    const audio = await client.textToSpeech.convert(process.env.VOICE_ID || "JBFqnCBsd6RMkjVDRZzb", {
      text: text || "play",
      modelId: process.env.MODEL_ID || "eleven_multilingual_v2",
      outputFormat: outputFormat
    });

    console.log(`Audio generated for the text ${text}`);

    return audio;
  } catch (e) {
    throw new Error(`The audio could't be generated: ${e}`)
  }
}