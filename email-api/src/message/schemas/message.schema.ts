import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message{
  @Prop()
  email: string;

  @Prop()
  message: string;

  @Prop()
  licensePlate: string;
  @Prop()
  dateSent: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message);