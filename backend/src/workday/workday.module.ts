import { Module } from '@nestjs/common';
import { WorkdayService } from './workday.service';
import { WorkdayController } from './workday.controller';

@Module({
  controllers: [WorkdayController],
  providers: [WorkdayService],
})
export class WorkdayModule {}
