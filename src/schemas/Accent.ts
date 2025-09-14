import mongoose from "mongoose";

const Accent = new mongoose.Schema({
  name: { type: String, required: true, default: "british" },
  language: { type: String, required: true, default: "en" },
  voice_id: { type: String, required: true, default: "jB2lPb5DhAX6l1TLkKXy" },
  is_active: { type: Boolean, required: true, default: true }
})

export default mongoose.model("Accent", Accent);