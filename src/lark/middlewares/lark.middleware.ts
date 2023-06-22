import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { adaptExpress } from '@larksuiteoapi/node-sdk';
import * as lark from '@larksuiteoapi/node-sdk';
import { ChatCompletionRequestMessage } from 'openai';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LarkService } from '../services/lark.service';
import { OpenaiService } from '../../services/openai/openai.service';

@Injectable()
class LarkMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private larkService: LarkService,
    private openaiService: OpenaiService,
  ) {}

  public getEventHandles = (): lark.EventHandles => ({
    'application.bot.menu_v6': async (data) => {
      const unionId = data.operator.operator_id.union_id;
      await this.cacheManager.del(`union_id_${unionId}`);

      await this.larkService.sendMessage(unionId, '清除成功', 'union_id');
    },
    'im.message.receive_v1': async (data) => {
      const chatId = data.message.chat_id;
      const unionId = data.sender.sender_id.union_id;
      const messageId = data.message.message_id;

      console.log(data.message);

      if (
        data.message.message_type !== 'text' &&
        data.message.message_type !== 'post'
      ) {
        await this.larkService.sendMessage(chatId, '暂不支持此类消息');

        return;
      }

      const content = JSON.parse(data.message.content);
      const cachedMessages = await this.cacheManager.get<string>(
        `union_id_${unionId}`,
      ); // get messages from redis
      let messages: Array<ChatCompletionRequestMessage> = cachedMessages
        ? JSON.parse(cachedMessages)
        : [];
      messages = [...messages, { role: 'user', content: content.text }];
      await this.cacheManager.set(
        `union_id_${unionId}`,
        JSON.stringify(messages),
      );

      console.log('messages', messages);

      this.openaiService
        .createChatCompletion(messages)
        .then(async (completion) => {
          const reply = completion?.data.choices[0].message;

          await this.cacheManager.set(
            `union_id_${unionId}`,
            JSON.stringify([
              ...messages,
              {
                role: 'assistant',
                content: reply.content,
              },
            ]),
            1000 * 60 * 60 * 8,
          ); // save messages to redis

          await this.larkService.replyMessage(messageId, reply.content);
        })
        .catch(async (e) => {
          console.log(e);
          await this.larkService.replyMessage(
            messageId,
            '系统请求过多，请稍后重试',
          );
        });
    },
  });

  async use(req: any, res: any) {
    const encryptKey = this.configService.get('FEISHU_ENCRYPT_KEY');

    const eventDispatcher = new lark.EventDispatcher({
      encryptKey,
    }).register(this.getEventHandles());

    const adaptor = adaptExpress(eventDispatcher, {
      autoChallenge: true,
    });

    await adaptor(req, res);
  }
}

export { LarkMiddleware };
