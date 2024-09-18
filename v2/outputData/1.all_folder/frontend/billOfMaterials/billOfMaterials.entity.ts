import { Entity } from 'mycena-store';
import { BillOfMaterials } from './billOfMaterials.model';

export class BillOfMaterialsEntity extends Entity {
  _name = 'BillOfMaterialsEntity';
  constructor(property: BillOfMaterials) {
    super(property);
  }
}
