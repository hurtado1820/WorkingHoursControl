import { Module } from '@nestjs/common';
import { WorkdayService } from './workday.service';
import { WorkdayController } from './workday.controller';
import { Workday } from './entities/workday.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [WorkdayController],
  providers: [WorkdayService],
  imports: [TypeOrmModule.forFeature([Workday])]
})
export class WorkdayModule {}
