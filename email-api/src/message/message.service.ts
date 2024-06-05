import { ConflictException, Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>){}
  sendMessage(message: MessageDto) {
    const messageMongo = new this.messageModel(message)
    messageMongo.dateSent =  new Date();
    return messageMongo.save();
  }

  async findMostFrequentEmail(){
    const email = await this.messageModel.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, email: '$_id', count: '$count' } },
    ]).exec();
    return email[0];
  }
  async findNumberOfMessagesByDate(date: string) {
    let startOfDay: Date;
    let endOfDay: Date;
    if(date){
      const regex = /^\d{4}\-\d{2}\-\d{2}$/;
      if(!regex.test(date)) throw new ConflictException('Invalid date format. Use YYYY/MM/DD');
      let dateFormatted = new Date(date);
      if (isNaN(dateFormatted.getTime())) {
        throw new ConflictException('Invalid date.');
      }
      startOfDay = dateFormatted;
      endOfDay = new Date(Date.UTC(dateFormatted.getUTCFullYear(), dateFormatted.getUTCMonth(), dateFormatted.getUTCDate(),23,59,59,999));
    }
    else{
      const date = new Date();
      startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0,0,0,0));
      endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23,59,59,999));
    }
    const count = await this.messageModel.aggregate([
      { $match: { dateSent: { $gte: startOfDay, $lt: endOfDay } } },
      { $count: 'count' },
    ]).exec();
    return count.length > 0 ? count[0] : {count: 0};
  }
  async findTop10LicensePlatesByMonth() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const licensePlates = await this.messageModel.aggregate([
      {
        $match: {
          $expr: { $and: [{ $eq: [{ $month: '$dateSent' }, month] }, { $eq: [{ $year: '$dateSent' }, year] }] }
         }
      },
      { $group: { _id: '$licensePlate',  count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, licensePlate: '$_id', count: '$count' } }
    ]).exec();
    return licensePlates;
  }
}
