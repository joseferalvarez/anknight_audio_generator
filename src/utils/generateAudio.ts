import { S3 } from "../classes/S3";
import { AudioGenerator } from "../classes/AudioGenerator";
import Accent from "../schemas/Accent";
import Word from "../schemas/Word";

export const generateAudio = async (word: string, text: string, field: string, fieldID: string) => {
  const dbWord = await Word.findOne({ word: word, [`${field}._id`]: fieldID });

  console.log(dbWord);

  if (!dbWord) throw new Error(`The word ${word} has not found in the database`);

  const accents = await Accent.find({ is_active: true })
  const audioGen = AudioGenerator.getInstance();
  const s3 = S3.getInstance();

  if (!s3) return;
  if (!audioGen) return;
  if (!accents || accents.length == 0) return;


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

      return updatedWord;
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

      return updatedWord;
    }
  }

  return;
}