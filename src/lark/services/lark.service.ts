import { Inject, Injectable } from '@nestjs/common';
import * as lark from '@larksuiteoapi/node-sdk';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
class LarkService {
  private client: lark.Client;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    const appId = this.configService.get('FEISHU_APP_ID');
    const appSecret = this.configService.get('FEISHU_APP_SECRET');

    this.client = new lark.Client({
      appId,
      appSecret,
      appType: lark.AppType.SelfBuild,
    });
  }

  verify(timestamp, nonce, body, signature) {
    const verificationToken = this.configService.get(
      'FEISHU_VERIFICATION_TOKEN',
    );

    const stringToSign = [
      timestamp,
      nonce,
      verificationToken,
      JSON.stringify(body),
    ].join('');

    const b1 = Buffer.from(stringToSign, 'utf-8');
    const bs = createHash('sha1').update(b1).digest();
    const sig = bs.toString('hex');

    if (sig != signature) {
      return 'fail';
    }

    switch (body?.action?.value?.type) {
      case 'clear':
        this.cacheManager.reset();

        return {
          config: {
            wide_screen_mode: true,
          },
          elements: [
            {
              tag: 'note',
              elements: [
                {
                  tag: 'img',
                  img_key: 'img_v2_041b28e3-5680-48c2-9af2-497ace79333g',
                  alt: {
                    tag: 'plain_text',
                    content: '',
                  },
                },
                {
                  tag: 'plain_text',
                  content: '该消息由AI生成',
                },
              ],
            },
            {
              tag: 'hr',
            },
            {
              tag: 'markdown',
              content: '*已经清除上下文，你可以重新问我问题了*',
            },
            {
              tag: 'action',
              actions: [
                {
                  tag: 'button',
                  text: {
                    tag: 'plain_text',
                    content: '清空上下文',
                  },
                  type: 'danger',
                  value: {
                    type: 'clear',
                  },
                },
              ],
            },
          ],
        };
      default:
        return bs.toString();
    }
  }

  async sendMessage(
    receiveId: string,
    content: string,
    receiveIdType:
      | 'chat_id'
      | 'open_id'
      | 'user_id'
      | 'union_id'
      | 'email' = 'chat_id',
  ) {
    return await this.client.im.message.create({
      params: {
        receive_id_type: receiveIdType,
      },
      data: {
        receive_id: receiveId,
        content: JSON.stringify({ text: content }),
        msg_type: 'text',
      },
    });
  }

  replyMessage = async (messageId: string, content: string) => {
    console.log('content', content);
    const templateId = this.configService.get('FEISHU_TEMPLATE_ID');

    const message = {
      path: {
        message_id: messageId,
      },
      data: {
        content: JSON.stringify({
          type: 'template',
          data: {
            template_id: templateId,
            template_variable: {
              content,
            },
          },
        }),
        msg_type: 'interactive',
      },
    };

    console.log('message', message);

    return this.client.im.message.reply(message);
  };
}

export { LarkService };
