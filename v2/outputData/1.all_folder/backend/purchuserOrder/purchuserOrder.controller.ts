import { Body, Controller, Get, Post, Put, Delete, Query } from '@nestjs/common';
import { PurchuserOrderService } from './purchuserOrder.service';

@Controller('purchuserOrder')
export class PurchuserOrderController {
  constructor(private _service: PurchuserOrderService) {}

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
