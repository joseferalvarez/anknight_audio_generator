import { connect, type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import type pino from "pino";
import { Logger } from "./Logger";

export class RabbitMQ {
  static instance: RabbitMQ | null = null;
  private logger: pino.Logger = Logger.getInstance();

  private host: string = process.env.RABBITMQ_HOST || "localhost";
  private port: number = Number(process.env.RABBITMQ_PORT) || 5672;
  private user: string = process.env.RABBITMQ_USER || "";
  private password: string = process.env.RABBITMQ_PASS || "";
  private queue: string = process.env.RABBITMQ_QUEUE || "";
  private requeueDays: number = ((Number(process.env.RABBITMQ_REQUEUE_DAYS) < 15 ? Number(process.env.RABBITMQ_REQUEUE_DAYS) : 15) || 15) * 24 * 60 * 60 * 1000;

  private client: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor() { }

  public connect = async (): Promise<void> => {
    try {
      const rabbitURL = `amqp://${this.user}:${this.password}@${this.host}:${this.port}`;

      this.client = await connect(rabbitURL);

      if (!this.client) {
        this.logger.fatal(`The RabbitMQ service client couldn't be connected`);
        return;
      }

      this.channel = await this.client.createChannel();

      await this.channel.assertQueue(this.queue, {
        durable: true,
        messageTtl: this.requeueDays,
        deadLetterExchange: "",
        deadLetterRoutingKey: this.queue
      });

      this.logger.info(`RabbitMQ connected to ${rabbitURL}`)
    } catch (e) {
      this.logger.fatal(`RabbitMQ service couldn't be connected: ${e}`)
      return;
    }
  }

  public consumeQueue = async (action: Function): Promise<void> => {
    if (!this.channel) {
      this.logger.fatal(`The RabbitMQ service client couldn't be connected`);
      return;
    }

    this.channel.consume(this.queue, async (message: ConsumeMessage | null) => {

      if (!this.channel) {
        this.logger.fatal(`The RabbitMQ service client couldn't be connected`);
        return;
      }

      if (!message) {
        this.logger.fatal(`The RabbitMQ service client couldn't be connected`);
        return;
      }

      try {
        await action(message);
        this.channel.ack(message)
      } catch (e) {
        this.channel.nack(message, false, false);
      }
    });

  }

  public static getInstance = () => {
    if (!RabbitMQ.instance) this.instance = new RabbitMQ();
    return RabbitMQ.instance;
  }
}