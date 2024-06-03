import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class AppService {
  sendMessage(message: MessageDto) {
    return message;
  }
}
