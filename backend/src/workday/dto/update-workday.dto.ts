import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkdayDto } from './create-workday.dto';

export class UpdateWorkdayDto extends CreateWorkdayDto {
    id:string;
    leave: Date;
    timeInSeconds: number;
}
