import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FiltersEmployeeDto } from './dto/filters-employee.dto';
import { Employee } from './entities/employee.entity';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto):Promise<Employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll(@Query() filters: FiltersEmployeeDto):Promise<Employee[]> {
    return this.employeeService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
  //   return this.employeeService.update(+id, updateEmployeeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.employeeService.remove(+id);
  // }
}
