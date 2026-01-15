import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee/entities/employee.entity';

@Module({
  imports: [EmployeeModule,TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.sqlite',
      entities: [
        Employee
      ],
      synchronize: true
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
