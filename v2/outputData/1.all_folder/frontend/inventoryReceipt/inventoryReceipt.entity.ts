import { Entity } from 'mycena-store';
import { InventoryReceipt } from './inventoryReceipt.model';

export class InventoryReceiptEntity extends Entity {
  _name = 'InventoryReceiptEntity';
  constructor(property: InventoryReceipt) {
    super(property);
  }
}
