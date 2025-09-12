import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api"

export const generateAudio = async (text: string): Promise<ReadableStream> => {
  const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_KEY });
  const outputFormat = TextToSpeechConvertRequestOutputFormat.Mp344100128;

  const audio = await client.textToSpeech.convert(process.env.VOICE_ID || "JBFqnCBsd6RMkjVDRZzb", {
    text: text || "play",
    modelId: process.env.MODEL_ID || "eleven_multilingual_v2",
    outputFormat: outputFormat
  })

  return audio;
}