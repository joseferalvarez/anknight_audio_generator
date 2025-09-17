import { connect, type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";

export class Rabbit {
  static instance: Rabbit | null = null;

  private host: string;
  private port: number;
  private user: string;
  private password: string;
  private queue: string;
  private requeueDays: number;
  private client: ChannelModel | null;
  private channel: Channel | null;

  constructor() {
    this.host = process.env.RABBITMQ_HOST || "localhost";
    this.port = Number(process.env.RABBITMQ_PORT) || 5672;
    this.user = process.env.RABBITMQ_USER || "";
    this.password = process.env.RABBITMQ_PASS || "";
    this.queue = process.env.RABBITMQ_QUEUE || "";
    this.requeueDays = ((Number(process.env.RABBITMQ_REQUEUE_DAYS) < 15 ? Number(process.env.RABBITMQ_REQUEUE_DAYS) : 15) || 15) * 24 * 60 * 60 * 1000;
    this.client = null;
    this.channel = null;
  }

  public connect = async (): Promise<void> => {
    try {
      const rabbitURL = `amqp://${this.user}:${this.password}@${this.host}:${this.port}`;

      this.client = await connect(rabbitURL);

      if (!this.client) {
        console.log(`The RabbitMQ service client couldn't be connected`);
        return;
      }

      this.channel = await this.client.createChannel();

      await this.channel.assertQueue(this.queue, {
        durable: true,
        messageTtl: this.requeueDays,
        deadLetterExchange: "",
        deadLetterRoutingKey: this.queue
      });

      console.log(`RabbitMQ connected to ${rabbitURL}`)
    } catch (e) {
      console.log(`RabbitMQ service couldn't be connected: ${e}`)
      return;
    }
  }

  public consumeQueue = async (action: Function): Promise<void> => {
    if (!this.channel) {
      console.log(`The RabbitMQ service client couldn't be connected`);
      return;
    }

    this.channel.consume(this.queue, async (message: ConsumeMessage | null) => {

      if (!this.channel) {
        console.log(`The RabbitMQ service client couldn't be connected`);
        return;
      }

      if (!message) {
        console.log(`The RabbitMQ service client couldn't be connected`);
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
    if (!Rabbit.instance) {
      this.instance = new Rabbit();
    }
    return Rabbit.instance;
  }
}