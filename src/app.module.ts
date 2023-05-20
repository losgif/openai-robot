import { Module } from '@nestjs/common';
import { LarkModule } from './lark/lark.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { OpenaiService } from './services/openai/openai.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    LarkModule,
  ],
  controllers: [],
  providers: [OpenaiService],
})
class AppModule {}

export { AppModule };
