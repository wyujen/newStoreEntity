import { Entity } from 'mycena-store';
import { BomProcedure } from './bomProcedure.model';

export class BomProcedureEntity extends Entity {
  _name = 'BomProcedureEntity';
  constructor(property: BomProcedure) {
    super(property);
  }
}
