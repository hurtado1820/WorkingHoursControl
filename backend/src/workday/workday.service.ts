import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workday } from './entities/workday.entity';
import { Repository } from 'typeorm';
import { EmployeeService } from 'src/employee/employee.service';
import { CreateWorkdayDto } from './dto/create-workday.dto';
import { UpdateWorkdayDto } from './dto/update-workday.dto';

@Injectable()
export class WorkdayService {

  constructor(
    @InjectRepository(Workday) private readonly repo: Repository<Workday>,
    @Inject() private readonly employeeService: EmployeeService
  ) {

  }

  async startWorkday(workDayDto: CreateWorkdayDto) {
    const employee = await this.employeeService.findOne(workDayDto.employeeID);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const lastWorkday = await this.findLastWorkdayByEmployeeID(workDayDto.employeeID);

    if (lastWorkday && !lastWorkday.leave) {
      throw new BadRequestException('The employee already has an active workday');
    }

    return this.create(workDayDto);
  }

  async finishWorkday(workDayDto: UpdateWorkdayDto) {
    const employee = await this.employeeService.findOne(workDayDto.employeeID);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const lastWorkday = await this.findLastWorkdayByEmployeeID(workDayDto.employeeID);
    if (!lastWorkday || lastWorkday.leave) {
      throw new BadRequestException('The employee does not have an active workday');
    }

    if (!workDayDto.timeWorked) {
      const leave = new Date(lastWorkday.leave);
      const entry = new Date(lastWorkday.entry);
      const timeInSeconds = Math.floor((+leave - +entry) / 1000);
      workDayDto.timeWorked = timeInSeconds;
    }

    return this.update(workDayDto);
  }

  private findLastWorkdayByEmployeeID(employeeID: string): Promise<Workday | null> {
    return this.repo.findOne({
      where: { employeeID },
      order: { entry: 'DESC' },
    });
  }

  private create(createDto: CreateWorkdayDto): Promise<Workday> {
    const workday = this.repo.create(createDto);
    return this.repo.save(workday);
  }

  private findOne(id: string): Promise<Workday | null> {
    return this.repo.findOneBy({ id });
  }

  private async update(updateDto: UpdateWorkdayDto): Promise<Workday> {
    const workday = await this.findOne(updateDto.id);
    if (!workday) {
      throw new NotFoundException('Work not found');
    }
    this.repo.merge(workday, updateDto);
    return this.repo.save(workday);
  }

  // findAll() {
  //   return `This action returns all workday`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} workday`;
  // }
}
