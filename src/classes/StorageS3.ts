import * as Minio from "minio"
import { Readable } from "stream";
import { randomUUID } from "crypto";
import type pino from "pino";
import { Logger } from "./Logger";

export class StorageS3 {
  static instance: StorageS3 | null = null;
  private logger: pino.Logger = Logger.getInstance();

  private host: string = process.env.MINIO_URL || "";
  private port: number = Number(process.env.MINIO_PORT) || 9000;
  private accessKey: string = process.env.MINIO_ACCESS_KEY || "";
  private secretKey: string = process.env.MINIO_SECRET_KEY || "";
  private bucket: string = process.env.MINIO_BUCKET || "";
  private client: typeof Minio.Client.prototype | null = null;

  constructor() { }

  private async bucketExist() {
    if (!this.client) throw new Error(`The bucket ${this.bucket} doesn't exist`)
    return await this.client.bucketExists(this.bucket);
  }

  public connect = () => {
    try {
      this.client = new Minio.Client({
        endPoint: this.host,
        useSSL: true,
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      });

      this.logger.info(`S3 service connected to ${this.host}:${this.port}`)
    } catch (e) {
      throw new Error(`Unable to connect to minio host: ${e}`)
    }
  }

  public uploadAudio = async (word: string, text: string, audio: ReadableStream, accent: { name: string, language: string }) => {
    try {
      if (!this.client) this.connect();

      const bucketExist = await this.bucketExist();
      if (!bucketExist) throw new Error(`The bucket selected does not exist: ${this.bucket}. Create it in your S3 provider before uploads.`);

      const file = Readable.fromWeb(audio);

      if (!this.client) throw new Error("The client could't be connected");

      const path = `public/audio/phonetics/${accent.language}/${accent.name}/${word}/${randomUUID()}.mp3`;
      await this.client.putObject(this.bucket, path, file);

      console.log(`Audio uploaded to S3: ${text}`)

      return `https://${this.host}/${this.bucket}/${path}`;
    } catch (e) {
      throw new Error(`Error uploading the audio of ${text} to S3 storage: ${e}`)
    }
  }

  public static getInstance = () => {
    if (!StorageS3.instance) this.instance = new StorageS3();
    return StorageS3.instance;
  }
}