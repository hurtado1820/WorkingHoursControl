import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [TypeOrmModule.forFeature([Employee])]
})
export class EmployeeModule {}
