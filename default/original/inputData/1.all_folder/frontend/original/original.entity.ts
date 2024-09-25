import { Entity } from 'mycena-store';
import { Original } from './original.model';

export class OriginalEntity extends Entity {
  _name = 'OriginalEntity';
  constructor(property: Original) {
    super(property);
  }
}
