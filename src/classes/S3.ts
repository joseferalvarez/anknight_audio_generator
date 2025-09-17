import { language } from "@elevenlabs/elevenlabs-js/api/resources/dubbing/resources/resource";
import * as Minio from "minio"
import { Readable } from "stream";
import { randomUUID } from "crypto";

export class S3 {
  static instance: S3 | null = null;

  private host: string;
  private port: number;
  private accessKey: string;
  private secretKey: string;
  private bucket: string;
  private client: typeof Minio.Client.prototype | null

  constructor() {
    this.host = process.env.MINIO_URL || "";
    this.port = Number(process.env.MINIO_PORT) || 9000;
    this.accessKey = process.env.MINIO_ACCESS_KEY || "";
    this.secretKey = process.env.MINIO_SECRET_KEY || "";
    this.bucket = process.env.MINIO_BUCKET || "";
    this.client = null
  }

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
      })

      console.log(`S3 service connected to ${this.host}:${this.port}`)
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

  public generatePresignedURL = async (path: string) => {
    try {
      if (!this.client) this.connect();
      if (!this.client) throw new Error("The client could't be connected");

      const expiryDays = ((Number(process.env.MINIO_URL_EXPIRY_DAYS) > 7 ? 7 : Number(process.env.MINIO_URL_EXPIRY_DAYS)) || 7) * 60 * 60 * 24;

      const presignedUrl = await this.client.presignedGetObject(this.bucket, path, expiryDays)

      return presignedUrl;
    } catch (e) {
      throw new Error(`The presigned URL couldn't be generated: ${e}`);
    }
  }

  public static getInstance = () => {
    if (!S3.instance) {
      this.instance = new S3();
    }

    return S3.instance;
  }
}