import { Controller, Get, Query } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  // ✅ NOUVEL ENDPOINT pour obtenir une URL signée PUT
  @Get('upload/url')
  async getUploadUrl(
    @Query('key') key: string,
    @Query('contentType') contentType: string,
  ) {
    return this.s3Service.getUploadUrl(key, contentType);
  }
}
