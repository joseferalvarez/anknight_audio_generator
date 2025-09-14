import { S3 } from "./src/audio/classes/S3";
import { DB } from "./src/audio/classes/DB";
import { AudioGen } from "./src/audio/classes/AudioGen";
import Accent from "./src/schemas/Accent";
import Word from "./src/schemas/Word";

const connectServices = async () => {
  try {
    AudioGen.getInstance()

    const s3 = S3.getInstance()
    const db = DB.getInstance()

    if (s3) s3.connect();
    if (db) {
      db.connect();
      db.initializeDB();
    }

    console.log("All the services were connected succesfully");
  } catch (e) {
    console.log("The services couldn't be connected succesfully");
    process.exit(1);
  }
}

const generateAudio = async (word: string, text: string, field: string, fieldID: string) => {
  const dbWord = await Word.findOne({ word: word, [`${field}._id`]: fieldID });

  if (!dbWord) throw new Error(`The word ${word} didn't found in the database`);

  const accents = await Accent.find({ is_active: true })
  const audioGen = AudioGen.getInstance();
  const s3 = S3.getInstance();

  if (!s3) return;

  for (const accent of accents) {
    const audio = await audioGen.generateAudio(text, accent.voice_id);
    const audioUrl = await s3.uploadAudio(word, text, audio, { name: accent.name, language: accent.language });

    if (field === "phonetics") {
      await Word.findOneAndUpdate(
        { word: word },
        { $pull: { [`${field}.audio`]: { accent: accent.name } } }
      );

      const updatedWord = await Word.findOneAndUpdate(
        { word: word },
        {
          $push: { [`${field}.audio`]: { accent: accent.name, url: audioUrl } }
        },
        {
          runValidators: true,
          setDefaultsOnInsert: true,
          new: true
        },
      );

      console.log(updatedWord);
    } else if (field === "definitions") {
      await Word.findOneAndUpdate(
        { word: word },
        { $pull: { [`definitions.$[definition].example.audio`]: { accent: accent.name } } },
        { arrayFilters: [{ 'definition._id': fieldID }] }
      );

      const updatedWord = await Word.findOneAndUpdate(
        { word: word },
        { $push: { [`definitions.$[definition].example.audio`]: { accent: accent.name, url: audioUrl } } },
        {
          arrayFilters: [{ 'definition._id': fieldID }],
          runValidators: true,
          new: true
        }
      );

      console.log(updatedWord);
    }
  }
}

await connectServices();
await generateAudio("apply", "applied glue sparingly to the paper.", "definitions", "68c676bf27bc1cdf53bf6efc");