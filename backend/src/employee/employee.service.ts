import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { FiltersEmployeeDto } from './dto/filters-employee.dto';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>
  ){

  }

  async create(createEmployeeDto: CreateEmployeeDto):Promise<Employee> {
    if (createEmployeeDto.code==null || createEmployeeDto.code.trim()===''){
      throw new BadRequestException('Employee code is required');
    }
    const employees = await this.findAll({code: createEmployeeDto.code});
    if (employees.length > 0) throw new BadRequestException(`Already exist an employee with code:${createEmployeeDto.code}`);
    
    const employee: Employee = await this.repo.save(createEmployeeDto);
    return employee;
  }

  findAll(filters: FiltersEmployeeDto):Promise<Employee[]> {
    return this.repo.find({where: {code: filters?.code}});
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
