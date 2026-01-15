import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee/entities/employee.entity';
import { WorkdayModule } from './workday/workday.module';
import { Workday } from './workday/entities/workday.entity';

@Module({
  imports: [EmployeeModule,WorkdayModule,TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [
        Employee, Workday
      ],
      synchronize: true
    }), WorkdayModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
