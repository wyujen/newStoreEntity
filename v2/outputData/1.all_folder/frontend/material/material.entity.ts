import { Entity } from 'mycena-store';
import { Material } from './material.model';

export class MaterialEntity extends Entity {
  _name = 'MaterialEntity';
  constructor(property: Material) {
    super(property);
  }
}
