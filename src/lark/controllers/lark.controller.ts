import { Controller, Post, Req } from '@nestjs/common';
import { createCipheriv } from 'crypto';
import { LarkService } from '../services/lark.service';

@Controller('lark')
export class LarkController {
  constructor(private larkService: LarkService) {}

  @Post('/card-callback')
  cardCallback(@Req() req) {
    const headers = req.headers;
    const body = req.body;

    const timestamp = headers['x-lark-request-timestamp'];
    const nonce = headers['x-lark-request-nonce'];
    const signature = headers['x-lark-signature'];

    return this.larkService.verify(timestamp, nonce, body, signature);
  }
}
