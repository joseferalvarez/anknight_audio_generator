import { z } from "zod";

export namespace IMessage {
  const zMessage = z.object({
    word: z.string(),
    text: z.string(),
    field_name: z.string(),
    field_id: z.string()
  });

  export namespace Validation {
    export const Message = zMessage;
  }

  export namespace Types {
    export type Message = z.infer<typeof zMessage>;
  }
}