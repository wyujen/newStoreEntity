import { Body, Controller, Get, Post, Put, Delete, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private _service: InventoryService) {}

  @Post('/create')
  create(@Body() dto: any[]) {
    return this._service.create(dto);
  }

  @Get('/readItself')
  readItself(@Body() dto: any[]) {
    return this._service.readItself();
  }

  @Get('/read')
  read(@Body() dto: any[]) {
    return this._service.read();
  }

  @Put('/update')
  update(@Body() dto: any[]) {
    return this._service.update(dto);
  }

  @Delete('/delete')
  delete(@Query() dto: string[]) {
    return this._service.delete(dto);
  }
}
