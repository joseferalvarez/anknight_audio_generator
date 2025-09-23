import mongoose from "mongoose";
import Accent from "../schemas/Accent";
import type pino from "pino";
import { Logger } from "./Logger";

export class MongoDB {
  static instance: MongoDB | null = null;
  private uri: string = process.env.MONGO_URI || "";
  private logger: pino.Logger = Logger.getInstance();

  constructor() { }

  public connect = async () => {
    try {
      await mongoose.connect(this.uri);
      this.logger.info(`Mongoose connected to ${this.uri}`);
    } catch (e) {
      throw new Error(`The database couldn't be connected`);
    }
  }

  public initializeDB = async () => {
    const accent = await Accent.findOne();

    if (!accent) {
      this.logger.info("No accents found, creating default accent")

      const newAccent = await Accent.insertOne({
        name: process.env.DEFAULT_ACCENT_NAME,
        language: process.env.DEFAULT_ACCENT_LANGUAGE,
        voice_id: process.env.DEFAULT_ACCENT_VOICE_ID,
        is_active: true
      });

      this.logger.info(`Default accent created: ${newAccent.name}`);
    }
  }

  public static getInstance = () => {
    if (!MongoDB.instance) MongoDB.instance = new MongoDB();
    return MongoDB.instance;
  }
}