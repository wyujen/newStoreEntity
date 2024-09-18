import { Entity } from 'mycena-store';
import { SalesOrder } from './salesOrder.model';

export class SalesOrderEntity extends Entity {
  _name = 'SalesOrderEntity';
  constructor(property: SalesOrder) {
    super(property);
  }
}
