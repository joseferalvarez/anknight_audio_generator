import * as Minio from "minio"

// TODO: Buscar la mejor manera de montar el Singleton
// TODO: Montar la funcion para subir los audios
export class SMinio {
  static instance: SMinio | null = null;

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

  connect() {
    try {
      this.client = new Minio.Client({
        endPoint: this.host,
        port: this.port,
        useSSL: true,
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      })

      console.log(`Minio service connected to ${this.host}:${this.port}`)

    } catch (e) {
      throw new Error(`Unable to connect to minio host: ${e}`)
    }
  }

  private bucketExist() {
    return this.client?.bucketExists(this.bucket);
  }

  public static getInstance() {
    if (!SMinio.instance) {
      this.instance = new SMinio();
    }

    return SMinio.instance
  }
}