import { Module } from '@nestjs/common';
import { InventoryReciptController } from './inventoryRecipt.controller';
import { InventoryReciptService } from './inventoryRecipt.service';

@Module({
  controllers: [InventoryReciptController],
  providers: [InventoryReciptService],
  exports: [InventoryReciptService]
})
export class InventoryReciptModule {}
