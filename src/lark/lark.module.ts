import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LarkMiddleware } from './middlewares/lark.middleware';
import { LarkService } from './services/lark.service';
import { OpenaiService } from '../services/openai/openai.service';
import { LarkController } from './controllers/lark.controller';

@Module({
  providers: [LarkService, OpenaiService],
  controllers: [LarkController],
})
class LarkModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LarkMiddleware).forRoutes('lark/event-handle');
  }
}

export { LarkModule };
