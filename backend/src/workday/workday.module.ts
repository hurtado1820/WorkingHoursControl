import { Module } from '@nestjs/common';
import { WorkdayService } from './workday.service';
import { WorkdayController } from './workday.controller';
import { Workday } from './entities/workday.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { EmployeeService } from 'src/employee/employee.service';

@Module({
  controllers: [WorkdayController],
  providers: [WorkdayService, EmployeeService],
  imports: [EmployeeModule, TypeOrmModule.forFeature([Workday])]
})
export class WorkdayModule {}
