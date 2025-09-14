import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api"

export class AudioGen {
  static instance: AudioGen | null = null;

  private client: ElevenLabsClient;
  private outputFormat: TextToSpeechConvertRequestOutputFormat;
  private modelId: string;

  constructor() {
    this.client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_KEY || "" });
    this.outputFormat = TextToSpeechConvertRequestOutputFormat.Mp344100128;
    this.modelId = process.env.MODEL_ID || "eleven_multilingual_v2";
  }

  public generateAudio = async (text: string, voiceId: string | undefined): Promise<ReadableStream> => {
    try {
      const audio = await this.client.textToSpeech.convert(voiceId || "jB2lPb5DhAX6l1TLkKXy", {
        text: text || "play",
        modelId: this.modelId,
        outputFormat: this.outputFormat
      });

      console.log(`Audio generated for the text ${text}`);

      return audio;
    } catch (e) {
      throw new Error(`The audio could't be generated: ${e}`)
    }
  }

  public static getInstance() {
    if (!AudioGen.instance) {
      AudioGen.instance = new AudioGen()
    }

    return AudioGen.instance
  }
}