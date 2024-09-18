import { Entity } from 'mycena-store';
import { PurchuserOrder } from './purchuserOrder.model';

export class PurchuserOrderEntity extends Entity {
  _name = 'PurchuserOrderEntity';
  constructor(property: PurchuserOrder) {
    super(property);
  }
}
