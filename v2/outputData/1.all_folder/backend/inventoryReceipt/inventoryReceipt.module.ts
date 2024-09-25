import { Module } from '@nestjs/common';
import { InventoryReceiptController } from './inventoryReceipt.controller';
import { InventoryReceiptService } from './inventoryReceipt.service';

@Module({
  controllers: [InventoryReceiptController],
  providers: [InventoryReceiptService],
  exports: [InventoryReceiptService]
})
export class InventoryReceiptModule {}
