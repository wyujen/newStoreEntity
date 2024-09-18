import { Entity } from 'mycena-store';
import { Inventory } from './inventory.model';

export class InventoryEntity extends Entity {
  _name = 'InventoryEntity';
  constructor(property: Inventory) {
    super(property);
  }
}
