import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CardData } from './interface/CardData';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getScrapper(@Query() query): Promise<CardData[]> {
    return await this.appService.getScrapper(query);
  }

  @Get('health')
  getHealth(): string {
    return 'OK';
  }
}
