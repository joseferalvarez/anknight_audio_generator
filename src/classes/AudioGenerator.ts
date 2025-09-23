import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api"
import { Logger } from "./Logger";
import type pino from "pino";

export class AudioGenerator {
  static instance: AudioGenerator | null = null;
  private logger: pino.Logger = Logger.getInstance();

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

      this.logger.info(`Audio generated for the text ${text}`);

      return audio;
    } catch (e) {
      throw new Error(`The audio could't be generated: ${e}`);
    }
  }

  public static getInstance = () => {
    if (!AudioGenerator.instance) AudioGenerator.instance = new AudioGenerator();
    return AudioGenerator.instance;
  }
}