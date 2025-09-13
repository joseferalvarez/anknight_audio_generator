import { generateAudio } from "./src/audio/utils/generateAudio";
import { S3 } from "./src/audio/classes/S3";

const connectServices = async () => {
  S3.getInstance()?.connect()
}

const uploadAudio = async (word: string) => {
  try {
    const s3 = S3.getInstance();

    if (!s3) throw new Error(`The S3 service couldn't be connected`);

    const audio = await generateAudio(word);
    const path = await s3.uploadAudio(word, audio, "british");
    const presignedURL = await s3.generatePresignedURL(path);

    console.log(presignedURL);
  } catch (e) {
    console.log(e);
  }
}

await connectServices();
await uploadAudio("strength");