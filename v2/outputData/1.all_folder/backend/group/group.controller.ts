import { Body, Controller, Get, Post, Put, Delete, Query } from '@nestjs/common';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private _service: GroupService) {}

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
