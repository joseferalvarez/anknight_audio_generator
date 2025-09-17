import { S3 } from "./classes/S3";
import { DB } from "./classes/DB";
import { AudioGenerator } from "./classes/AudioGenerator";
import { generateAudio } from "./utils/generateAudio";
import { Rabbit } from "./classes/Rabbit";
import { IMessage } from "./interfaces/IMessage";
import type { Message } from "amqplib";

const connectServices = async () => {
  try {
    AudioGenerator.getInstance()

    const s3 = S3.getInstance()
    const db = DB.getInstance()
    const rabbit = Rabbit.getInstance()

    if (s3) await s3.connect();
    if (rabbit) await rabbit.connect();

    if (db) {
      await db.connect();
      await db.initializeDB();
    }

    if (!rabbit) return;

    rabbit.consumeQueue(async (message: Message) => {
      const validMessage = IMessage.Validation.Message.safeParse(JSON.parse(message.content.toString()));

      if (!validMessage.success) {
        console.log(`The message data is not valid: ${JSON.parse(validMessage.error?.message)[0].message}`);
        return;
      }

      const newMessage: IMessage.Types.Message = validMessage.data;
      const newWord = await generateAudio(newMessage.word, newMessage.text, newMessage.field_name, newMessage.field_id);

      console.log(newWord);
    })

    console.log("All the services were connected succesfully");
  } catch (e) {
    console.log("The services couldn't be connected succesfully");
    process.exit(1);
  }
}

await connectServices()