import { Module } from '@nestjs/common';
import { SalesOrderController } from './salesOrder.controller';
import { SalesOrderService } from './salesOrder.service';

@Module({
  controllers: [SalesOrderController],
  providers: [SalesOrderService],
  exports: [SalesOrderService]
})
export class SalesOrderModule {}
