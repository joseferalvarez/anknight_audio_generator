import pino from "pino";

export class Logger {
  static instance: Logger | null = null;

  public logger: any;

  constructor() {
    this.logger = pino()
  }

  public static getInstance = () => {
    if (!Logger.instance) {
      this.instance = new Logger();
    }
    return Logger.instance;
  }
}