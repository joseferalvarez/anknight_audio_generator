import { StorageS3 } from "./classes/StorageS3";
import { MongoDB } from "./classes/MongoDB";
import { AudioGenerator } from "./classes/AudioGenerator";
import { generateAudio } from "./utils/generateAudio";
import { RabbitMQ } from "./classes/RabbitMQ";
import { IMessage } from "./interfaces/IMessage";
import type { Message } from "amqplib";
import { Logger } from "./classes/Logger";

const logger = Logger.getInstance();
if (!logger) console.error("The Logger service doesn't work");

const connectServices = async () => {
  try {
    AudioGenerator.getInstance()

    const storage = StorageS3.getInstance();
    const amqp = RabbitMQ.getInstance();
    const db = MongoDB.getInstance();

    if (!storage) return logger.fatal("The MinioS3 storage couldn't be connected");
    if (!amqp) return logger.fatal("The RabbitMQ service couldn't be connected");
    if (!db) return logger.fatal("The MongoDB database couldn't be connected");

    storage.connect();
    await amqp.connect();
    await db.connect();
    await db.initializeDB();

    amqp.consumeQueue(async (message: Message) => {
      const validMessage = IMessage.Validation.Message.safeParse(JSON.parse(message.content.toString()));

      if (!validMessage.success) {
        logger.warn(`The message data is not valid: ${JSON.parse(validMessage.error?.message)[0].message}`);
        return;
      }

      const newMessage: IMessage.Types.Message = validMessage.data;

      try {
        const newWord = await generateAudio(newMessage.word, newMessage.text, newMessage.field_name, newMessage.field_id);
        logger.info(`Audio generated for "${newWord?.word}": ${newMessage.text}`);
      } catch (e) {
        logger.warn(`Audio couldn't be generated for "${newMessage.word}": ${newMessage.text}`);
      }
    });

    logger.info("All the services were connected succesfully");
  } catch (e) {
    logger.fatal("The services couldn't be connected succesfully");
    process.exit(1);
  }
}

await connectServices()