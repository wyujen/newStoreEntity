import { Module } from '@nestjs/common';
import { BillOfMaterialsController } from './billOfMaterials.controller';
import { BillOfMaterialsService } from './billOfMaterials.service';

@Module({
  controllers: [BillOfMaterialsController],
  providers: [BillOfMaterialsService],
  exports: [BillOfMaterialsService]
})
export class BillOfMaterialsModule {}
