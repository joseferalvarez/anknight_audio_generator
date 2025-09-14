import mongoose from "mongoose";

const Word = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  definitions: {
    type: [{
      partOfSpeech: { type: String, required: true },
      definition: { type: String, required: true },
      example: {
        type: {
          text: { type: String, required: true },
          audio: { type: [{ accent: String, url: String }], required: true, default: [] }
        },
        required: true
      }
    }],
    required: true
  },
  phonetics: {
    type: {
      text: { type: String, required: true },
      audio: { type: [{ accent: String, url: String }], required: true, default: [] }
    },
    required: true
  },
  sources: {
    type: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],
    required: true
  },
  frequency: { type: Number, required: true, default: 0 },
  requested: { type: Number, required: true, default: 0 },
  d_creation: { type: Date, required: true, default: Date.now() },
  d_updated: { type: Date, required: true, default: Date.now() }
});

export default mongoose.model("Word", Word);