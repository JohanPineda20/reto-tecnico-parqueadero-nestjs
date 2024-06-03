import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageDto } from './dto/message.dto';

@Controller('email')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendMessage(@Body() message: MessageDto ) {
    console.log(message)
    return this.appService.sendMessage(message);
  }
}
