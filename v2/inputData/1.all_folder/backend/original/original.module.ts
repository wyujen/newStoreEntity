import { Module } from '@nestjs/common';
import { OriginalController } from './original.controller';
import { OriginalService } from './original.service';

@Module({
  controllers: [OriginalController],
  providers: [OriginalService],
  exports: [OriginalService]
})
export class OriginalModule {}
