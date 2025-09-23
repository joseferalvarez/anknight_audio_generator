import pino from "pino";

export class Logger {
  static instance: pino.Logger | null = null;

  static getInstance = () => {
    if (!Logger.instance) Logger.instance = pino();
    return Logger.instance;
  }
}