import mongoose from "mongoose";
import Accent from "../schemas/Accent";

export class DB {
  static instance: DB | null = null;
  private uri: string

  constructor() {
    this.uri = process.env.MONGO_URI || "";
  }

  public connect = async () => {
    try {
      await mongoose.connect(this.uri);
      console.log(`Mongoose connected to ${this.uri}`);
    } catch (e) {
      throw new Error(`The database couldn't be connected`);
    }
  }

  public initializeDB = async () => {
    const accent = await Accent.findOne();

    if (!accent) {
      console.log("No accents found, creating default accent")

      const newAccent = await Accent.insertOne({
        name: process.env.DEFAULT_ACCENT_NAME,
        language: process.env.DEFAULT_ACCENT_LANGUAGE,
        voice_id: process.env.DEFAULT_ACCENT_VOICE_ID,
        is_active: true
      });

      console.log(`Default accent created: ${newAccent.name}`);
    }
  }

  public static getInstance = () => {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }
}