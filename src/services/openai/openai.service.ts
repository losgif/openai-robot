import { Injectable } from '@nestjs/common';
import type { ChatCompletionRequestMessage } from 'openai';
import { Configuration, OpenAIApi } from 'openai';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
class OpenaiService {
  private openai: OpenAIApi;

  constructor(private configService: ConfigService) {
    const configuration = new Configuration({
      apiKey: configService.get('OPENAI_API_KEY'),
    });
    this.openai = new OpenAIApi(configuration);
  }

  createChatCompletion(messages: ChatCompletionRequestMessage[]) {
    return this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
  }
}

export { OpenaiService };
