import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/message'),
    MessageModule
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
