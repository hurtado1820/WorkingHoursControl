import { Test, TestingModule } from '@nestjs/testing';
import { WorkdayController } from './workday.controller';
import { WorkdayService } from './workday.service';

describe('WorkdayController', () => {
  let controller: WorkdayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkdayController],
      providers: [WorkdayService],
    }).compile();

    controller = module.get<WorkdayController>(WorkdayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
