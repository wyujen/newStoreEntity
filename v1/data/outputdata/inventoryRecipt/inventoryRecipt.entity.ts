import { Entity } from 'mycena-store';
import { InventoryRecipt } from './inventoryRecipt.model';

export class InventoryReciptEntity extends Entity {
  _name = 'InventoryReciptEntity';
  constructor(property: InventoryRecipt) {
    super(property);
  }
}
