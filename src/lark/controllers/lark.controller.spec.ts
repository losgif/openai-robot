import { Test, TestingModule } from '@nestjs/testing';
import { LarkController } from './lark.controller';

describe('LarkController', () => {
  let controller: LarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LarkController],
    }).compile();

    controller = module.get<LarkController>(LarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
