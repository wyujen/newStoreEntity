import { Module } from '@nestjs/common';
import { PurchuserOrderController } from './purchuserOrder.controller';
import { PurchuserOrderService } from './purchuserOrder.service';

@Module({
  controllers: [PurchuserOrderController],
  providers: [PurchuserOrderService],
  exports: [PurchuserOrderService]
})
export class PurchuserOrderModule {}
