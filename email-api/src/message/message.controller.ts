import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from './dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  sendMessage(@Body() message: MessageDto ) {
    return this.messageService.sendMessage(message);
  }
  @Get('most-frequent-email')
  findMostFrequentEmail() {
    return this.messageService.findMostFrequentEmail();
  }
  @Get()
  findNumberOfMessagesByDate(@Query('date') date: string) {
    return this.messageService.findNumberOfMessagesByDate(date);
  }
  @Get('most-frequent-license-plates')
  findTop10LicensePlatesByMonth() {
    return this.messageService.findTop10LicensePlatesByMonth();
  }
}
